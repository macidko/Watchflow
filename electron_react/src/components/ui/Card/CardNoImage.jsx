import React from 'react';
import styles from './Card.module.css';

const CardNoImage = ({ title, releaseDate, genres }) => {
  return (
    <div className={styles.cardNoImage}>
      <div className={styles.cardNoImageContent}>
        <svg className={styles.cardNoImageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Poster Yok" focusable="false">
          <title>Poster Yok</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xs text-gray-500">Poster Yok</p>
      </div>
      {/* Content for No Image */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <h2 className={styles.cardNoImageTitle}>
          {title || 'Başlık Yok'}
        </h2>
        <div className="flex items-center justify-between gap-1">
          {releaseDate && (
            <span className={styles.cardNoImageYear}>{releaseDate}</span>
          )}
          {genres?.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full text-gray-500 bg-gray-700">
              {genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardNoImage;