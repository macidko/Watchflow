import React from 'react';
import styles from './Card.module.css';

const CardContent = ({ title, releaseDate, genres }) => {
  return (
    <div className={styles.cardContent}>
      <h2 className={styles.cardTitle}>
        {title || 'Başlık Yok'}
      </h2>
      <div className={styles.cardMeta}>
        {releaseDate && (
          <span className="text-xs text-gray-400 drop-shadow-md">{releaseDate}</span>
        )}
        {genres?.length > 0 && (
          <span className="text-xs text-gray-500 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {genres[0]}
          </span>
        )}
      </div>
    </div>
  );
};

export default CardContent;