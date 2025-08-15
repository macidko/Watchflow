import React from 'react';

const CardSkeleton = () => (
  <div
    className="w-44 h-64 rounded-xl bg-neutral-800/60 animate-pulse flex flex-col justify-end relative border border-neutral-800"
    style={{ boxShadow: 'var(--card-shadow, 0 6px 18px rgba(0,0,0,0.18))' }}
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 rounded-xl" />
    <div className="p-3">
      <div className="h-4 w-3/4 bg-neutral-700 rounded mb-2" />
      <div className="h-3 w-1/2 bg-neutral-700 rounded" />
    </div>
  </div>
);

export default CardSkeleton;
