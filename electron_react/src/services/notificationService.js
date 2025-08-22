// Bildirim servisi: Takvimde bugünün ve yarının etkinliklerini kontrol eder ve bildirim mesajı üretir.
// Diğer bildirim türleri de buraya eklenebilir.

/**
 * Takvimde bugünün ve yarının tarihinde içerik var mı kontrol eder.
 * @param {Array} events - Takvimdeki etkinlikler (calendarEvents array)
 * @param {Date} [now=new Date()] - Şu anki tarih (test için override edilebilir)
 * @returns {Array<{ type: string, message: string, event: object }>} Bildirim mesajları
 */
export function getUpcomingEpisodeNotifications(events, now = new Date()) {
  const notifications = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  events.forEach(event => {
    if (!event.start) return;
    const eventDate = new Date(event.start);
    const isToday = eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth() && eventDate.getDate() === today.getDate();
    const isTomorrow = eventDate.getFullYear() === tomorrow.getFullYear() && eventDate.getMonth() === tomorrow.getMonth() && eventDate.getDate() === tomorrow.getDate();
    if (isToday) {
      notifications.push({
        type: 'episode',
        message: `${event.title} bugün yayınlandı!`,
        event
      });
    } else if (isTomorrow) {
      notifications.push({
        type: 'episode',
        message: `${event.title} yarın yayınlanacak!`,
        event
      });
    }
  });
  return notifications;
}
