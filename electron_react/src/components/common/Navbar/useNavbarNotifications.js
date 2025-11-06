import { useState, useEffect } from 'react';
import { getUpcomingEpisodeNotifications } from '../../../services/notificationService';
import useContentStore from '../../../config/initialData';
import { t } from '../../../i18n';

// Notification management hook
export const useNavbarNotifications = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  
  const NOTIF_KEY = 'wf-last-seen-notification-count';
  const { contents } = useContentStore();

  useEffect(() => {
    const calendarEvents = [];
    
    Object.values(contents || {}).forEach(content => {
      const { apiData, statusId } = content;
      const isWatching = statusId === 'watching';
      const isCompleted = apiData?.status === 'completed' || 
                          apiData?.status === 'finished' || 
                          apiData?.status === 'ended';

      // Schedule'dan gelecek bölümler
      if (isWatching && !isCompleted && Array.isArray(apiData?.schedule) && apiData?.title) {
        const now = new Date();
        apiData.schedule.forEach(ep => {
          const airDate = new Date(ep.airDate);
          if (airDate > now) {
            calendarEvents.push({
              id: `scheduled-ep-${content.id}-${ep.episode}`,
              title: `🗓️ ${apiData.title} - ${t('components.episodeTracking.episodeWithNumber', { number: ep.episode })} (${t('calendar.events.scheduleDescription')})`,
              start: ep.airDate,
              allDay: false
            });
          }
        });
      }

      // Yayın tarihi
      if (apiData?.releaseDate && apiData?.title) {
        const releaseYear = parseInt(apiData.releaseDate);
        const currentYear = new Date().getFullYear();
        if (releaseYear >= currentYear) {
          calendarEvents.push({
            id: `release-${content.id}`,
            title: `📅 ${apiData.title}`,
            start: `${releaseYear}-01-01`,
            allDay: true
          });
        }
      }

      // Sonraki bölüm
      if (apiData?.relations?.nextEpisode?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextEpisode.airDate;
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T20:00:00`;
        calendarEvents.push({
          id: `next-episode-${content.id}`,
          title: `🎬 ${apiData.title} - ${t('components.episodeTracking.episodeWithNumber', { number: apiData.relations.nextEpisode.episodeNumber })}`,
          start: formattedDate,
          allDay: false
        });
      }

      // Sonraki sezon
      if (apiData?.relations?.nextSeason?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextSeason.airDate;
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T00:00:00`;
        calendarEvents.push({
          id: `next-season-${content.id}`,
          title: `🎭 ${apiData.title} - ${apiData.relations.nextSeason.seasonNumber}. Sezon`,
          start: formattedDate,
          allDay: true
        });
      }
    });

    const newNotifications = getUpcomingEpisodeNotifications(calendarEvents);
    setNotifications(newNotifications);

    // localStorage'dan son okunan bildirim sayısını al
    let lastSeenCount = 0;
    try {
      lastSeenCount = parseInt(localStorage.getItem(NOTIF_KEY) || '0', 10);
    } catch (error) {
      console.error('localStorage access error for notifications:', error);
    }
    
    // Eğer yeni bildirim sayısı önceki kayıttan fazlaysa unread göster
    setHasUnread(newNotifications.length > lastSeenCount);
    
    // Bildirimler sıfırsa unread'i de sıfırla
    if (newNotifications.length === 0) {
      try {
        localStorage.setItem(NOTIF_KEY, '0');
      } catch (error) {
        console.error('localStorage write error for notifications:', error);
      }
    }
  }, [contents]);

  const handleNotificationClick = () => {
    setShowNotifications((prev) => {
      // Panel açılırken unread'i sıfırla ve localStorage'a bildir
      if (!prev) {
        setHasUnread(false);
        try {
          localStorage.setItem(NOTIF_KEY, notifications.length.toString());
        } catch (error) {
          console.error('localStorage write error for notification count:', error);
        }
      }
      return !prev;
    });
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  return {
    showNotifications,
    notifications,
    hasUnread,
    handleNotificationClick,
    handleCloseNotifications
  };
};
