import { useEffect, useRef, useState } from 'react';
import useContentStore from '../config/initialData';
import { t } from '../i18n';
import useViewMode from './useViewMode';
import { PAGES } from '../config/constants';
import { useDrag } from '../contexts/DragContext';

export default function useFilmController() {
  const mainContentRef = useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllModal, setShowAllModal] = useState({ isOpen: false, title: '', items: [] });
  const { viewMode, toggleViewMode } = useViewMode(PAGES.FILM);

  const { getStatusesByPage, getContentsByPageAndStatus, initializeStore, moveContentBetweenStatuses } = useContentStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const filmStatuses = getStatusesByPage(PAGES.FILM);
  const sliders = filmStatuses.map(status => {
    const contents = getContentsByPageAndStatus(PAGES.FILM, status.id);
    return {
      id: `film-${status.id}`,
      title: (t(`statuses.${PAGES.FILM}.${status.id}`) === `statuses.${PAGES.FILM}.${status.id}`) ? status.title : t(`statuses.${PAGES.FILM}.${status.id}`),
      items: contents.map(content => ({
        id: content.id,
        ...content.apiData,
        apiData: content.apiData || {},
        seasons: content.seasons || {},
        pageId: content.pageId,
        statusId: content.statusId,
        title: content.apiData?.title || content.title,
        poster: content.apiData?.poster || content.poster || content.imageUrl,
        rating: content.apiData?.rating || content.rating || content.score,
        releaseDate: content.apiData?.releaseDate || content.releaseDate || content.year
      }))
    };
  });

  const handleCardClick = (item) => setSelectedItem(item);
  const handleShowAll = (title, items) => setShowAllModal({ isOpen: true, title, items });
  const handleShowAllClose = () => setShowAllModal({ isOpen: false, title: '', items: [] });

  const { isDragging } = useDrag();
  const sliderRefs = useRef({});

  const handleCardMove = (cardItem, fromSliderId, toSliderId) => {
    const fromStatusId = fromSliderId.replace('film-', '');
    const toStatusId = toSliderId.replace('film-', '');
    const success = moveContentBetweenStatuses(cardItem, fromStatusId, toStatusId, PAGES.FILM);
    if (success) {
      setTimeout(() => {
        const ref = sliderRefs.current[toSliderId];
        ref?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  };

  const quickMoveConfig = {
    availableSliders: sliders.map(slider => ({ id: slider.id, title: slider.title })),
    handler: (item, fromSliderId, toSliderId) => {
      if (fromSliderId !== toSliderId) handleCardMove(item, fromSliderId, toSliderId);
    }
  };

  return {
    mainContentRef,
    showManager,
    setShowManager,
    selectedItem,
    setSelectedItem,
    showAllModal,
    setShowAllModal,
    handleCardClick,
    handleShowAll,
    handleShowAllClose,
    sliders,
    viewMode,
    toggleViewMode,
    isDragging,
    sliderRefs,
    handleCardMove,
    quickMoveConfig
  };
}
