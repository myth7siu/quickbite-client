export default function CartDrawer({ cart, isOpen, onClose, onUpdateQty, onRemove, onSubmit, isSubmitting }) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="max-w-lg mx-auto bg-[#1a1a1a] border-t border-l border-r border-white/10 rounded-t-3xl shadow-2xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 border-b border-white/10">
            <div>
              <h2 className="font-display font-bold text-xl text-white">Your Order</h2>
              <p className="text-white/40 text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition"
              id="cart-close-btn"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="px-5 py-3 max-h-[50vh] overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">🛒</span>
                <p className="text-white/40">Your cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-3 py-2 animate-fade-in"
                  id={`cart-item-${item._id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-brand-400 text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => item.quantity <= 1 ? onRemove(item._id) : onUpdateQty(item._id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 transition text-sm"
                      id={`qty-minus-${item._id}`}
                    >
                      {item.quantity <= 1 ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      ) : '−'}
                    </button>
                    <span className="text-white font-semibold text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-brand-500/20 hover:text-brand-400 transition text-sm"
                      id={`qty-plus-${item._id}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="px-5 pb-6 pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-medium">Total</span>
                <span className="text-2xl font-display font-bold text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                id="submit-order-btn"
                className={`btn-primary w-full text-center py-3.5 text-base
                  ${isSubmitting ? 'opacity-60 cursor-wait' : 'animate-pulse-glow'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </span>
                ) : (
                  'Place Order 🚀'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
