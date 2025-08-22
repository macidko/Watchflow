/**
 * Haftalık veya düzenli yayınlanan diziler/anime için tahmini yayın takvimi üretir.
 *
 * @param {Object} options
 * @param {string} options.startDate - Yayının başladığı tarih (ISO string)
 * @param {number} options.episodeCount - Toplam bölüm sayısı
 * @param {number} options.intervalDays - Bölümler arası gün (ör: haftalık için 7)
 * @param {string} [options.time] - Yayın saati ("20:00" gibi, opsiyonel)
 * @returns {Array<{episode: number, airDate: string}>}
 */
export function generateWeeklySchedule({ startDate, episodeCount, intervalDays, time }) {
  if (!startDate || !episodeCount || !intervalDays) return [];
  const schedule = [];
  let current = new Date(startDate);
  for (let i = 1; i <= episodeCount; i++) {
    const date = new Date(current);
    if (time) {
      const [h, m] = time.split(":");
      date.setHours(Number(h), Number(m), 0, 0);
    }
    schedule.push({
      episode: i,
      airDate: date.toISOString(),
    });
    current.setDate(current.getDate() + intervalDays);
  }
  return schedule;
}

/**
 * Schedule array'inden bugüne göre sıradaki bölümü döndürür ve schedule güncelliğini teyit eder.
 * @param {Array<{episode: number, airDate: string}>} schedule
 * @param {Date|string} [now] - Şu anki zaman (opsiyonel, test için)
 * @param {boolean} [withStatus] - Schedule güncelliğiyle ilgili bilgi dönsün mü?
 * @returns {{episode: number, airDate: string}|{status: 'expired', lastEpisode: object}|null}
 */
export function getNextEpisodeFromSchedule(schedule, now = new Date(), withStatus = false) {
  if (!Array.isArray(schedule)) return null;
  const nowDate = new Date(now);
  const next = schedule.find(ep => new Date(ep.airDate) > nowDate);
  if (next) return withStatus ? { status: 'ok', nextEpisode: next } : next;
  // Schedule bitti mi? Son bölüm tarihi geçtiyse expired döndür
  if (withStatus && schedule.length > 0) {
    const last = schedule[schedule.length - 1];
    if (new Date(last.airDate) < nowDate) {
      return { status: 'expired', lastEpisode: last };
    }
  }
  return null;
}
