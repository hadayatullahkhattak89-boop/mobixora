'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bookmark, X } from 'lucide-react';
import { api } from '@/services/api';
import { Brand } from '@/types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await api.getBrands();
      setBrands(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openAdd = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80');
    setShowModal(true);
  };

  const openEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setLogo(b.logo || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      name: name.trim(),
      slug: slug.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, '-'),
      logo: logo.trim() || undefined,
      is_active: true,
    };
    try {
      if (editingBrand) {
        await api.updateBrand(editingBrand.id, data);
      } else {
        await api.createBrand(data);
      }
      setShowModal(false);
      await loadBrands();
    } catch (err: any) {
      alert(err.message || 'Error saving brand');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await api.deleteBrand(id);
      setBrands(brands.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting brand');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Brand Partner Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage global smartphone and tech manufacturer partnerships.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-cyan-600 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading brands...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Logo</th>
                  <th className="py-3.5 px-4">Brand Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                        {b.logo ? (
                          <img src={b.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold">{b.name[0]}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.name}</td>
                    <td className="py-3 px-4 font-mono text-cyan-700">{b.slug}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(b)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingBrand ? 'Edit Brand' : 'Create Brand'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sony"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="sony"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Logo URL</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md mt-2"
              >
                {saving ? 'Saving...' : editingBrand ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
