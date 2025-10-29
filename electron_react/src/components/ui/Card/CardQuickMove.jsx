import React from 'react';
import styles from './Card.module.css';

// Pure component - sadece props alıp render eder
const CardQuickMove = ({ showDropdown, availableSliders, toggleDropdown, handleQuickMove }) => {
  if (!availableSliders.length) return null;

  return (
    <div className={styles.cardQuickMove}>
      <button
        onClick={toggleDropdown}
        className={styles.quickMoveBtn}
        title="Hızlı taşı"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className={styles.dropdownMenu}>
          {availableSliders.map((slider) => (
            <button
              key={slider.id}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickMove(slider.id);
              }}
              className={styles.dropdownItem}
            >
              {slider.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardQuickMove;