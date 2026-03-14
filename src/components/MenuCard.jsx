import { useState } from 'react';

export default function MenuCard({ item, onAdd }) {
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAdd(item);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div className="glass-card overflow-hidden group" id={`menu-item-${item._id}`}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-500/20 to-brand-700/20 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-brand-400 font-bold text-sm px-3 py-1 rounded-full">
          ${item.price.toFixed(2)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-white text-lg leading-tight">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Add button */}
        <button
          onClick={handleAdd}
          id={`add-btn-${item._id}`}
          className={`w-full mt-2 flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-sm
            transition-all duration-300 active:scale-95
            ${isAdding
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-brand-500/15 text-brand-400 border border-brand-500/25 hover:bg-brand-500/25 hover:border-brand-500/40'
            }`}
        >
          {isAdding ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
