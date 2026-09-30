'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon, Package, Heart, MapPin, Settings,
  LogOut, Truck, AlertCircle, CheckCircle2, Trash2, Eye,
  Lock, ShoppingCart, Plus, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { api, formatPKR } from '@/services/api';
import { Order, Address } from '@/types';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, logout, updateProfile, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist, refreshWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // New Address State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('Islamabad');
  const [addrProvince, setAddrProvince] = useState('Islamabad Capital Territory');
  const [addrPostal, setAddrPostal] = useState('');
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Load orders & addresses
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      Promise.all([api.getUserOrders(), api.getAddresses()])
        .then(([ordList, addrList]) => {
          setOrders(ordList);
          setAddresses(addrList);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        password: newPassword ? newPassword : undefined,
      });
      setNewPassword('');
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const added = await api.addAddress({
        full_name: addrName.trim(),
        phone: addrPhone.trim(),
        address: addrStreet.trim(),
        city: addrCity.trim(),
        province: addrProvince.trim(),
        postal_code: addrPostal.trim() || undefined,
        is_default: addresses.length === 0,
      });
      setAddresses([...addresses, added]);
      setShowAddressModal(false);
      setAddrStreet('');
    } catch (err: any) {
      alert(err.message || 'Could not save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    await api.deleteAddress(id);
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const updated = await api.cancelOrder(orderId);
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      alert('Order cancelled and inventory restored successfully.');
    } catch (err: any) {
      alert(err.message || 'Could not cancel order');
    }
  };

  const handleMoveToCart = async (productId: number) => {
    await addToCart(productId, null, 1);
    await removeFromWishlist(productId);
    alert('Product moved to cart!');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'settings', label: 'Security & Password', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Customer Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800">{user.name}</strong> ({user.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-xs hover:bg-cyan-700 transition-colors"
              >
                Go to Admin Panel
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dashboard Left Sidebar Tabs (3 cols) */}
          <aside className="lg:col-span-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Dashboard Content Right (9 cols) */}
          <main className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs min-h-[450px]">
            {/* 1. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-base">Account Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Update your personal details</p>
                </div>

                {profileMsg && (
                  <div className="p-3 rounded-xl bg-cyan-50 text-cyan-800 text-xs font-semibold">
                    {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email (Cannot be modified)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full text-xs p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03001234567"
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="py-3 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-cyan-600 transition-colors"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. My Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Your Order History</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Track shipment milestones and invoices</p>
                  </div>
                </div>

                {loadingOrders ? (
                  <p className="text-xs text-slate-400">Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-700">No orders placed yet</p>
                    <Link href="/shop" className="text-xs text-cyan-600 font-bold hover:underline mt-2 inline-block">
                      Browse Mobixora Shop &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4 hover:border-slate-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 text-xs">
                          <div>
                            <span className="font-black text-slate-900 tracking-wider text-sm">
                              {ord.order_number}
                            </span>
                            <span className="text-slate-400 ml-2">
                              {new Date(ord.created_at).toLocaleDateString('en-PK')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                ord.order_status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.order_status === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-cyan-100 text-cyan-800'
                              }`}
                            >
                              {ord.order_status}
                            </span>
                            <span className="font-black text-slate-900">{formatPKR(ord.total)}</span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="space-y-2">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between text-xs text-slate-700">
                              <span className="truncate max-w-xs font-medium">
                                {it.quantity}x {it.product_name} {it.variant_info ? `(${it.variant_info})` : ''}
                              </span>
                              <span className="font-semibold">{formatPKR(it.subtotal)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <Link
                            href={`/track-order?order=${ord.order_number}`}
                            className="text-cyan-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Shipment
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold hover:bg-slate-100"
                            >
                              Invoice Details
                            </button>
                            {ord.order_status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(ord.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg font-bold hover:bg-rose-100"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-base">Your Wishlist</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Saved items for later purchase</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-700">Your wishlist is currently empty</p>
                    <Link href="/shop" className="text-xs text-cyan-600 font-bold hover:underline mt-2 inline-block">
                      Discover Products &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between"
                      >
                        <Link href={`/products/${item.product.slug}`} className="block aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3">
                          <img
                            src={item.product.images[0]?.image_url || ''}
                            alt=""
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </Link>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-cyan-600 mb-0.5">{item.product.brand?.name}</p>
                          <Link href={`/products/${item.product.slug}`} className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-cyan-600">
                            {item.product.name}
                          </Link>
                          <p className="text-sm font-black text-slate-900 mt-1">
                            {formatPKR(item.product.sale_price || item.product.price)}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveToCart(item.product_id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.product_id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Saved Addresses</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Quickly select addresses during checkout</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-cyan-600 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2 relative"
                    >
                      {addr.is_default && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full inline-block mb-1">
                          Default Address
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-xs">{addr.full_name}</h4>
                      <p className="text-xs text-slate-600">{addr.address}</p>
                      <p className="text-xs text-slate-500">{addr.city}, {addr.province} {addr.postal_code || ''}</p>
                      <p className="text-xs text-slate-500">Phone: {addr.phone}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-rose-500 font-bold hover:underline pt-2 block"
                      >
                        Delete Address
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-900 text-base">Security &amp; Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your credentials</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Change Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-cyan-500 outline-hidden font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newPassword || savingProfile}
                    className="py-3 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-cyan-600 transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-600">Mobixora Invoice</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.order_number}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{it.product_name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {it.quantity} {it.variant_info ? `(${it.variant_info})` : ''}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">{formatPKR(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1 text-right">
                <p>Subtotal: <strong>{formatPKR(selectedOrder.subtotal)}</strong></p>
                {Number(selectedOrder.discount) > 0 && <p className="text-emerald-600">Discount: -{formatPKR(selectedOrder.discount)}</p>}
                <p>Shipping: <strong>{Number(selectedOrder.shipping_fee) === 0 ? 'FREE' : formatPKR(selectedOrder.shipping_fee)}</strong></p>
                <p className="text-base font-black text-slate-900 pt-2 border-t border-slate-100">Total: {formatPKR(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setShowAddressModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Address</h3>
              <button type="button" onClick={() => setShowAddressModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  required
                  placeholder="Full Name"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  required
                  placeholder="03001234567"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  required
                  placeholder="House, Street, Sector"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province</label>
                  <input
                    type="text"
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAddr}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-md hover:bg-cyan-700 mt-2"
              >
                {savingAddr ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-xs text-slate-400">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
