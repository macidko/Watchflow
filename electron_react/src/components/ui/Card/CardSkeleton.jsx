import React from 'react';
import '../../../css/components/ui/CardSkeleton.css';

const CardSkeleton = () => (
  <div
    className="card-skeleton"
    aria-hidden="true"
  >
    <div className="card-skeleton__overlay" />
    <div className="card-skeleton__content">
      <div className="card-skeleton__title" />
      <div className="card-skeleton__meta" />
    </div>
  </div>
);

export default CardSkeleton;
