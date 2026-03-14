export default function OrderCard({ order, onStatusUpdate }) {
  const statusFlow = ['Pending', 'Preparing', 'Completed'];
  const currentIdx = statusFlow.indexOf(order.status);

  const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  const statusStyles = {
    Pending: 'status-pending',
    Preparing: 'status-preparing',
    Completed: 'status-completed',
  };

  const statusIcons = {
    Pending: '🕐',
    Preparing: '👨‍🍳',
    Completed: '✅',
  };

  const timeSince = (timestamp) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div
      className={`glass-card p-5 space-y-4 animate-bounce-in ${
        order.status === 'Pending' ? 'ring-1 ring-amber-500/30' : ''
      }`}
      id={`order-card-${order._id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-lg">
              Table {order.tableNumber}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[order.status]}`}>
              {statusIcons[order.status]} {order.status}
            </span>
          </div>
          <p className="text-white/40 text-xs mt-0.5">
            {order.orderId} · {timeSince(order.timestamp)}
          </p>
        </div>
        <span className="text-brand-400 font-display font-bold text-lg">
          ${order.totalAmount?.toFixed(2)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-white/80">
              <span className="text-white/40 mr-2">{item.quantity}×</span>
              {item.name}
            </span>
            <span className="text-white/40">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Status progress bar */}
      <div className="flex gap-1">
        {statusFlow.map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= currentIdx
                ? i === 0
                  ? 'bg-amber-500'
                  : i === 1
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Action Button */}
      {nextStatus && (
        <button
          onClick={() => onStatusUpdate(order._id, nextStatus)}
          id={`status-btn-${order._id}`}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 ${
            nextStatus === 'Preparing'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
          }`}
        >
          {nextStatus === 'Preparing' ? '🔥 Start Preparing' : '✓ Mark Completed'}
        </button>
      )}
    </div>
  );
}
