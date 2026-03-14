import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MenuCard from '../components/MenuCard.jsx';
import CartDrawer from '../components/CartDrawer.jsx';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Fetch menu items on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE}/menu`);
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map((item) => item.category))];
    return ['All', ...cats];
  }, [menuItems]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((c) => (c._id === id ? { ...c, quantity: qty } : c))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  };

  // Submit order
  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        tableNumber: Number(tableNumber),
        items: cart.map((c) => ({
          name: c.name,
          price: c.price,
          quantity: c.quantity,
        })),
      };
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false);
        setOrderPlaced(true);
        setTimeout(() => setOrderPlaced(false), 5000);
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-24">
      {/* Order success toast */}
      {orderPlaced && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl rounded-2xl px-6 py-3 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-emerald-400 font-semibold text-sm">Order Placed!</p>
              <p className="text-emerald-400/60 text-xs">Your food is being prepared</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
        <div className="relative px-5 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
                QuickBite
                <span className="text-brand-400"> QR</span>
              </h1>
              <p className="text-white/40 text-sm mt-1">Scan · Order · Enjoy</p>
            </div>
            <div className="glass rounded-xl px-3 py-2 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Table</p>
              <p className="text-brand-400 font-display font-bold text-xl" id="table-number">{tableNumber}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Category pills */}
      <nav className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" id="category-nav">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill whitespace-nowrap ${
                activeCategory === cat ? 'category-pill-active' : 'category-pill-inactive'
              }`}
            >
              {cat === 'Starters' && '🥗 '}
              {cat === 'Main Course' && '🍔 '}
              {cat === 'Drinks' && '🥤 '}
              {cat === 'Desserts' && '🍰 '}
              {cat === 'All' && '✨ '}
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu Grid */}
      <main className="px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="menu-grid">
          {filteredItems.map((item) => (
            <MenuCard key={item._id} item={item} onAdd={addToCart} />
          ))}
        </div>
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="text-white/40">No items in this category</p>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-5 right-5 z-30 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            id="cart-fab"
            className="w-full btn-primary flex items-center justify-between py-4 px-6 rounded-2xl shadow-2xl shadow-brand-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-white text-brand-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              </div>
              <span className="font-semibold">View Order</span>
            </div>
            <span className="font-display font-bold text-lg">${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onSubmit={submitOrder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
