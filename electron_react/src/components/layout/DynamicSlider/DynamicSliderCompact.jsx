import React from 'react';
import PropTypes from 'prop-types';
import styles from './DynamicSlider.module.css';

// Helper function to parse title from various formats
const parseTitle = (title) => {
  if (React.isValidElement(title)) {
    return title.props?.children || 'Slider';
  }
  if (typeof title === 'string') {
    return title;
  }
  return 'Slider';
};

const DynamicSliderCompact = ({
  rootRef,
  title,
  itemsCount,
  isDragOver,
  onMouseEnter,
  onMouseLeave,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const titleText = parseTitle(title);

  return (
    <section
      ref={rootRef}
      className={`${styles.compactItem} slider-compact-item`}
      aria-label={`Slider: ${titleText}`}
      data-dragover={isDragOver}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Compact header */}
      <div className={styles.compactHeader}>
        <div className={styles.compactHeaderRow}>
          <div className={styles.compactHeaderLeft}>
            <div className={styles.compactDot} data-dragover={isDragOver} />
            <h3 className={styles.compactTitle} data-dragover={isDragOver}>
              {titleText}
            </h3>
          </div>
          {itemsCount > 0 && (
            <div className={styles.compactCount} data-dragover={isDragOver}>
              {itemsCount}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

DynamicSliderCompact.propTypes = {
  rootRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]),
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  itemsCount: PropTypes.number.isRequired,
  isDragOver: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired
};

DynamicSliderCompact.defaultProps = {
  rootRef: undefined
};

export default DynamicSliderCompact;
