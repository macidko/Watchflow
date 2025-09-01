import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useContentStore from '../config/initialData';
import { t } from '../i18n';
import { PAGES, COLORS, DUMMY } from '../config/constants';
import '../css/pages/Takvim.css';

const Takvim = () => {
  const { contents } = useContentStore();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Store'dan içerikleri alıp takvim etkinliklerine dönüştür
    const calendarEvents = [];

    // Dummy etkinlik ekle (örnek: 25 Ağustos 2025)
    calendarEvents.push({
      id: DUMMY.EVENT_ID,
      title: t('calendar.events.dummyTitle'),
      start: DUMMY.EVENT_DATE,
      allDay: true,
      backgroundColor: COLORS.DUMMY_BG,
      borderColor: COLORS.TRANSPARENT,
      textColor: COLORS.WHITE,
      description: t('calendar.events.dummyDescription')
    });

    Object.values(contents || {}).forEach(content => {
      const { apiData, pageId, statusId } = content;
      // İzleniyor ve tamamlanmamış içerikler için schedule'dan gelecek bölümleri ekle
      const isWatching = statusId === 'watching';
      const isCompleted = apiData?.status === 'completed' || apiData?.status === 'finished' || apiData?.status === 'ended';

      // Schedule'dan gelecek bölümler
        if (isWatching && !isCompleted && Array.isArray(apiData?.schedule) && apiData?.title) { 
        const now = new Date();
        apiData.schedule.forEach(ep => {
          const airDate = new Date(ep.airDate);
          if (airDate > now) {
              let bgColor = COLORS.DEFAULT;
              if (pageId === PAGES.FILM) bgColor = COLORS.FILM;
              else if (pageId === PAGES.DIZI) bgColor = COLORS.DIZI;
              else if (pageId === PAGES.ANIME) bgColor = COLORS.ANIME;
              calendarEvents.push({
                id: `scheduled-ep-${content.id}-${ep.episode}`,
                title: `🗓️ ${apiData.title} - ${ep.episode}. Bölüm (${t('calendar.events.scheduleDescription')})` ,
                start: ep.airDate,
                allDay: false,
                backgroundColor: bgColor,
                borderColor: 'transparent',
                textColor: 'white',
                description: t('calendar.events.scheduleDescription')
              });
          }
        });
      }

      // Yayın tarihini etkinlik olarak ekle (sadece gelecekteki tarihler)
      if (apiData?.releaseDate && apiData?.title) {
        const releaseYear = parseInt(apiData.releaseDate);
        const currentYear = new Date().getFullYear();
        
        // Sadece gelecek yıllar veya bu yıl olan içerikleri göster
        if (releaseYear >= currentYear) {
            let bgColor = COLORS.DEFAULT;
            if (pageId === PAGES.FILM) bgColor = COLORS.FILM;
            else if (pageId === PAGES.DIZI) bgColor = COLORS.DIZI;
            else if (pageId === PAGES.ANIME) bgColor = COLORS.ANIME;
            calendarEvents.push({
              id: `release-${content.id}`,
              title: `📅 ${apiData.title}`,
              start: `${releaseYear}-01-01`,
              allDay: true,
              backgroundColor: bgColor,
              borderColor: 'transparent',
              textColor: 'white'
            });
        }
      }

      // Sonraki bölüm tarihini ekle (eğer varsa)
      if (apiData?.relations?.nextEpisode?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextEpisode.airDate;
        // Tarih formatını düzelt: '2025-08-23' -> '2025-08-23T00:00:00'
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T20:00:00`;
          let bgColor = COLORS.NEXT_EP;
          if (pageId === PAGES.FILM) bgColor = COLORS.FILM;
          else if (pageId === PAGES.DIZI) bgColor = COLORS.DIZI;
          else if (pageId === PAGES.ANIME) bgColor = COLORS.ANIME;
          calendarEvents.push({
            id: `next-episode-${content.id}`,
            title: `🎬 ${apiData.title} - ${apiData.relations.nextEpisode.episodeNumber}. Bölüm`,
            start: formattedDate,
            allDay: false,
            backgroundColor: bgColor,
            borderColor: 'transparent',
            textColor: 'white'
          });
      }

      // Sezon sonraki tarihini ekle (eğer varsa)
      if (apiData?.relations?.nextSeason?.airDate && apiData?.title) {
        const airDate = apiData.relations.nextSeason.airDate;
        // Tarih formatını düzelt
        const formattedDate = airDate.includes('T') ? airDate : `${airDate}T00:00:00`;
          let bgColor = COLORS.NEXT_SEASON;
          if (pageId === PAGES.FILM) bgColor = COLORS.FILM;
          else if (pageId === PAGES.DIZI) bgColor = COLORS.DIZI;
          else if (pageId === PAGES.ANIME) bgColor = COLORS.ANIME;
          calendarEvents.push({
            id: `next-season-${content.id}`,
            title: `🎭 ${apiData.title} - ${apiData.relations.nextSeason.seasonNumber}. Sezon`,
            start: formattedDate,
            allDay: true,
            backgroundColor: bgColor,
            borderColor: 'transparent',
            textColor: 'white'
          });
      }
    });

    setEvents(calendarEvents);
  }, [contents]);

  const handleDateClick = (arg) => {
    console.log(t('logs.dateClicked'), arg.dateStr);
  };

  const handleEventClick = (clickInfo) => {
    console.log(t('logs.eventClicked'), clickInfo.event.title);
  };

  return (
    <div className="takvim-container">
      <div className="takvim-header">
        <h1>{t('pages.takvim.title')}</h1>
        <p>{t('pages.takvim.description')}</p>
      </div>
      
      <div className="takvim-content">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={t('calendar.initialView')}
          headerToolbar={t('calendar.headerToolbar')}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="calc(100vh - 200px)"
          locale={t('calendar.locale')}
          firstDay={1}
          buttonText={t('calendar.buttonText')}
          dayMaxEvents={true}
          moreLinkText={t('calendar.moreLinkText')}
          noEventsText={t('calendar.noEventsText')}
          eventDisplay={t('calendar.eventDisplay')}
          displayEventTime={true}
          allDayText={t('calendar.allDayText')}
          slotMinTime={t('calendar.slotMinTime')}
          slotMaxTime={t('calendar.slotMaxTime')}
          expandRows={true}
          stickyHeaderDates={true}
          dayHeaderFormat={t('calendar.dayHeaderFormat')}
        />
      </div>
    </div>
  );
};

export default Takvim;
