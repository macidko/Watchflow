import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Card.module.css';

// Image loading logic hook
const useCardImage = (poster, title) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imageRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observerRef.current.observe(imageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setImageLoaded(true);
    setError(true);
  }, []);

  return {
    imageRef,
    src: isInView ? poster : undefined,
    alt: title,
    className: `${styles.cardImage} ${imageLoaded ? styles.cardImageLoaded : styles.cardImageLoading}`,
    onLoad: handleLoad,
    onError: handleError,
    error,
    loaded: imageLoaded,
  };
};

export default useCardImage;