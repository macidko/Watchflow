import React, { useState } from 'react';
import { t } from '../../../i18n';
import CardImage from './CardImage';
import CardRating from './CardRating';
import CardQuickMove from './CardQuickMove';
import CardContent from './CardContent';
import CardDragIndicator from './CardDragIndicator';
import CardNoImage from './CardNoImage';
import useItemData from './useItemData';
import useCardImage from './useCardImage';
import useCardQuickMove from './useCardQuickMove';
import useCardDrag from './useCardDrag';
import styles from './Card.module.css';

// Pure Card component - sadece props alıp render eder
const Card = ({
  // Data props
  title,
  genres,
  releaseDate,
  rating,

  // UI state props
  showImage,
  isDragging,

  // Action props
  onClick,

  // Context props
  item,

  // Component props
  imageProps,
  quickMoveProps,
  dragProps,

  // Size & Style props
  size = 'medium',
  variant = 'default',
  customCSS = {},
}) => {
  const cardClasses = [
    styles.card,
    styles.cardHoverLift,
    styles[`cardSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`cardVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    isDragging ? styles.cardDragging : '',
    'group',
    'flex-none'
  ].filter(Boolean).join(' ');

  const cardStyles = {
    // Default sizes
    ...(size === 'small' && { width: '8rem', height: '12rem' }), // w-32 h-48
    ...(size === 'medium' && { width: '11rem', height: '16rem' }), // w-44 h-64
    ...(size === 'large' && { width: '14rem', height: '20rem' }), // w-56 h-80
    ...(size === 'compact' && { width: '100%', height: '120px' }), // full width, fixed height
    ...customCSS
  };

  return (
    <div
      className={cardClasses}
      style={cardStyles}
      onClick={() => onClick && onClick(item)}
      tabIndex={0}
      role="button"
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick(item);
        }
      }}
      draggable
      onDragStart={(e) => {
        dragProps.handleDragStart(e);
      }}
      onDragEnd={(e) => {
        dragProps.handleDragEnd(e);
      }}
      title={t('components.card.dragHint')}
    >
      {/* Image Container - Full Height */}
      <div className="relative w-full h-full overflow-hidden">
        {showImage ? (
          <>
            <CardImage {...imageProps} />

            {/* Gradient Overlay for Text Readability */}
            <div className={styles.cardOverlay}></div>

            <CardRating rating={rating} />
            <CardQuickMove {...quickMoveProps} />
            <CardContent
              title={title}
              releaseDate={releaseDate}
              genres={genres}
            />
            <CardDragIndicator isDragging={false} />
          </>
        ) : (
          <CardNoImage
            title={title}
            releaseDate={releaseDate}
            genres={genres}
          />
        )}
      </div>
    </div>
  );
};

// Container component - logic'i yönetir
const CardContainer = ({ 
  item, 
  onClick, 
  onDragStart, 
  onDragEnd, 
  isDragging, 
  sliderId, 
  onQuickMove,
  size = 'medium',
  variant = 'default',
  customCSS = {}
}) => {
  const [imgError, setImgError] = useState(false);

  // Data transformation
  const data = useItemData(item);

  // Business logic hooks
  const imageLogic = useCardImage(data.poster, data.title);
  const quickMoveLogic = useCardQuickMove(item, sliderId, onQuickMove);
  const dragLogic = useCardDrag(item, sliderId, onDragStart, onDragEnd);

  // Error handling
  const handleImageError = () => {
    setImgError(true);
  };

  // Combine props for pure component
  const showImage = data.poster && !imgError;

  const imageProps = {
    ...imageLogic,
    onError: handleImageError,
  };

  const quickMoveProps = {
    ...quickMoveLogic,
  };

  const dragProps = {
    ...dragLogic,
  };

  return (
    <Card
      {...data}
      showImage={showImage}
      isDragging={isDragging}
      onClick={onClick}
      onQuickMove={onQuickMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      item={item}
      sliderId={sliderId}
      imageProps={imageProps}
      quickMoveProps={quickMoveProps}
      dragProps={dragProps}
      size={size}
      variant={variant}
      customCSS={customCSS}
    />
  );
};

export default CardContainer;