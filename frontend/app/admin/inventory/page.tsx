'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, RefreshCw, Search } from 'lucide-react';
import { api, formatPKR } from '@/services/api';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState<{ [id: number]: number }>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getInventory(lowStockOnly);
      setItems(res);
      const stockMap: any = {};
      res.forEach((item: any) => {
        stockMap[item.id] = item.stock;
      });
      setEditingStock(stockMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly]);

  const handleUpdateStock = async (productId: number) => {
    const val = editingStock[productId];
    if (val === undefined || val < 0) return;
    setSavingId(productId);
    try {
      await api.updateInventoryStock(productId, val);
      setItems(items.map((it) => (it.id === productId ? { ...it, stock: val, is_low_stock: val <= 5 } : it)));
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = items.filter((it) => {
    const q = search.toLowerCase();
    return it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory &amp; Stock Levels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock auditing. Automatically decrements upon orders and restores on cancellation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 ${
            lowStockOnly
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Only (&le; 5 units)</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="button"
          onClick={loadInventory}
          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Inventory
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Auditing stock levels...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No inventory records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Available Inventory</th>
                  <th className="py-3.5 px-4 text-right">Quick Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => {
                  const isLow = item.stock <= 5;
                  const currentVal = editingStock[item.id] !== undefined ? editingStock[item.id] : item.stock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                        {item.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{item.sku}</td>
                      <td className="py-3.5 px-4 font-semibold text-cyan-700">{item.brand}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{formatPKR(item.sale_price || item.price)}</td>
                      <td className="py-3.5 px-4">
                        {item.stock <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900">{item.stock}</span> units
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentVal}
                            onChange={(e) =>
                              setEditingStock({
                                ...editingStock,
                                [item.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold bg-white outline-hidden focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            disabled={savingId === item.id || currentVal === item.stock}
                            onClick={() => handleUpdateStock(item.id)}
                            className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-cyan-600 disabled:opacity-30 transition-colors"
                          >
                            {savingId === item.id ? '...' : 'Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
