import { useEffect, useRef, useState } from 'react';
import useContentStore from '../config/initialData';
import { t } from '../i18n';

export default function useHomeController() {
  const mainContentRef = useRef(null);
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllModal, setShowAllModal] = useState({ isOpen: false, title: '', items: [] });

  const { getPages, getStatusesByPage, getContentsByPageAndStatus, initializeStore } = useContentStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const getSliderData = () => {
    const pages = getPages();
    if (!pages) return [];
    const sliders = [];

    pages.forEach(page => {
      const statuses = getStatusesByPage(page.id);
      statuses.forEach(status => {
        const contents = getContentsByPageAndStatus(page.id, status.id);
          if (contents.length > 0) {
          const pageKey = 'pages.' + page.id + '.title';
          const statusKey = 'statuses.' + page.id + '.' + status.id;
          const pageTitle = t(pageKey) === pageKey ? page.title : t(pageKey);
          const statusTitle = t(statusKey) === statusKey ? status.title : t(statusKey);
          sliders.push({
            id: `${page.id}-${status.id}`,
            title: `${pageTitle} - ${statusTitle}`,
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
          });
        }
      });
    });

    return sliders;
  };

  const handleCardClick = (item) => setSelectedItem(item);
  const handleManagerClose = () => setShowManager(false);

  const handleShowAll = (title, items) => setShowAllModal({ isOpen: true, title, items });
  const handleShowAllClose = () => setShowAllModal({ isOpen: false, title: '', items: [] });

  const isLoading = !getPages() || getPages().length === 0;
  const sliderData = getSliderData();

  return {
    mainContentRef,
    showManager,
    setShowManager,
    selectedItem,
    setSelectedItem,
    showAllModal,
    setShowAllModal,
    handleCardClick,
    handleManagerClose,
    handleShowAll,
    handleShowAllClose,
    isLoading,
    sliderData
  };
}
