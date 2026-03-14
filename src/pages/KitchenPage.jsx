import { useState, useEffect, useCallback } from 'react';
import socket from '../socket.js';
import OrderCard from '../components/OrderCard.jsx';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function KitchenPage() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [showArchive, setShowArchive] = useState(false);

  // Fetch active orders (for initial load + reconnection resilience)
  const fetchActiveOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setActiveOrders(data.filter((o) => o.status !== 'Completed'));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  // Fetch completed orders history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/history`);
      const data = await res.json();
      setCompletedOrders(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();
    fetchHistory();

    // Socket connection events
    const onConnect = () => {
      setConnected(true);
      // Reconnection resilience: re-fetch missed orders
      fetchActiveOrders();
    };
    const onDisconnect = () => setConnected(false);

    // Real-time order events
    const onOrderPlaced = (order) => {
      setActiveOrders((prev) => {
        // Avoid duplicates
        if (prev.find((o) => o._id === order._id)) return prev;
        return [order, ...prev];
      });
      // Play notification sound attempt (browser may block)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        audio.play().catch(() => { });
      } catch (e) {
        // Silent fail
      }
    };

    const onStatusUpdated = (updatedOrder) => {
      if (updatedOrder.status === 'Completed') {
        setActiveOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
        setCompletedOrders((prev) => [updatedOrder, ...prev]);
      } else {
        setActiveOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('order:placed', onOrderPlaced);
    socket.on('order:status-updated', onStatusUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('order:placed', onOrderPlaced);
      socket.off('order:status-updated', onStatusUpdated);
    };
  }, [fetchActiveOrders, fetchHistory]);

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        if (updatedOrder.status === 'Completed') {
          setActiveOrders((prev) => prev.filter((o) => o._id !== orderId));
          setCompletedOrders((prev) => [updatedOrder, ...prev]);
        } else {
          setActiveOrders((prev) =>
            prev.map((o) => (o._id === orderId ? updatedOrder : o))
          );
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const pendingOrders = activeOrders.filter((o) => o.status === 'Pending');
  const preparingOrders = activeOrders.filter((o) => o.status === 'Preparing');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
              👨‍🍳 Kitchen
              <span className="text-kitchen-400"> Dashboard</span>
            </h1>
            {/* Connection indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${connected
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/15 text-red-400 border border-red-500/20'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 mr-4">
              <div className="text-center">
                <p className="text-amber-400 font-display font-bold text-xl">{pendingOrders.length}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 font-display font-bold text-xl">{preparingOrders.length}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Preparing</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 font-display font-bold text-xl">{completedOrders.length}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Done</p>
              </div>
            </div>

            {/* Archive toggle */}
            <button
              onClick={() => setShowArchive(!showArchive)}
              id="toggle-archive-btn"
              className={`btn-secondary text-sm ${showArchive ? 'bg-white/15 border-white/20' : ''}`}
            >
              {showArchive ? '← Active Orders' : '📋 History'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {!showArchive ? (
          /* ──── Active Orders View ──── */
          <div className="space-y-8">
            {/* Pending Section */}
            {pendingOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="font-display font-bold text-lg text-white/80">
                    New Orders
                    <span className="text-white/30 text-sm font-normal ml-2">({pendingOrders.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
                  ))}
                </div>
              </section>
            )}

            {/* Preparing Section */}
            {preparingOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <h2 className="font-display font-bold text-lg text-white/80">
                    In Progress
                    <span className="text-white/30 text-sm font-normal ml-2">({preparingOrders.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {preparingOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {activeOrders.length === 0 && (
              <div className="text-center py-24">
                <span className="text-6xl block mb-4">🎉</span>
                <h3 className="font-display font-bold text-xl text-white/60 mb-2">All caught up!</h3>
                <p className="text-white/30">New orders will appear here in real-time</p>
              </div>
            )}
          </div>
        ) : (
          /* ──── Archive/History View ──── */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display font-bold text-lg text-white/80">
                Today&apos;s Completed Orders
                <span className="text-white/30 text-sm font-normal ml-2">({completedOrders.length})</span>
              </h2>
            </div>
            {completedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <span className="text-6xl block mb-4">📋</span>
                <h3 className="font-display font-bold text-xl text-white/60 mb-2">No completed orders yet</h3>
                <p className="text-white/30">Completed orders will appear here</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
