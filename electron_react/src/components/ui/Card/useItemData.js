import { useMemo } from 'react';

// Data transformation hook - item'dan standardized data çıkarır
const useItemData = (item) => {
  return useMemo(() => ({
    poster: item?.poster || item?.imageUrl || item?.apiData?.poster,
    title: item?.title || item?.apiData?.title || 'Başlık Yok',
    genres: item?.genres || item?.genre || item?.apiData?.genres || [],
    releaseDate: item?.releaseDate || item?.year || item?.apiData?.releaseDate,
    rating: item?.rating || item?.score || item?.apiData?.rating || item?.apiData?.score,
  }), [item]);
};

// Card state management hook
export const useCardState = () => {
  // Tüm card state'leri burada toplanabilir
  // imgError, isDragging, etc.
};


export default useItemData;
