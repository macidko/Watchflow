import React from 'react';
import { CardSkeleton } from '../../ui/Card';

const DynamicSliderLoading = () => {
  return (
    <div className="p-5 grid grid-flow-col gap-5 overflow-x-auto">
      {[1, 2, 3, 4, 5].map(n => (
        <CardSkeleton key={n} />
      ))}
    </div>
  );
};

export default DynamicSliderLoading;
