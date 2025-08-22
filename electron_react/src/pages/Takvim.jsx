import React, { useState, useEffect } from 'react';
import { getNextEpisodeFromSchedule } from '../utils/episodeScheduler';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import useContentStore from '../config/initialData';
import './Takvim.css';

const Takvim = () => {
  const { contents } = useContentStore();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Store'dan içerikleri alıp takvim etkinliklerine dönüştür
    const calendarEvents = [];

    // Dummy etkinlik ekle (örnek: 25 Ağustos 2025)
    calendarEvents.push({
      id: 'dummy-1',
      title: '🧪 Dummy Etkinlik (Test)',
      start: '2025-08-25',
      allDay: true,
      backgroundColor: '#607d8b',
      borderColor: 'transparent',
      textColor: 'white',
      description: 'Bu sadece test amaçlı bir dummy etkinliktir.'
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
              let bgColor = '#1976d2';
              if (pageId === 'film') bgColor = '#ff6b6b';
              else if (pageId === 'dizi') bgColor = '#43a047';
              else if (pageId === 'anime') bgColor = '#45b7d1';
              calendarEvents.push({
                id: `scheduled-ep-${content.id}-${ep.episode}`,
                title: `🗓️ ${apiData.title} - ${ep.episode}. Bölüm (Tahmini)` ,
                start: ep.airDate,
                allDay: false,
                backgroundColor: bgColor,
                borderColor: 'transparent',
                textColor: 'white',
                description: 'Tahmini yayın tarihi (schedule)'
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
            let bgColor = '#1976d2';
            if (pageId === 'film') bgColor = '#ff6b6b';
            else if (pageId === 'dizi') bgColor = '#43a047';
            else if (pageId === 'anime') bgColor = '#45b7d1';
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
          let bgColor = '#ffa726';
          if (pageId === 'film') bgColor = '#ff6b6b';
          else if (pageId === 'dizi') bgColor = '#43a047';
          else if (pageId === 'anime') bgColor = '#45b7d1';
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
          let bgColor = '#9c27b0';
          if (pageId === 'film') bgColor = '#ff6b6b';
          else if (pageId === 'dizi') bgColor = '#43a047';
          else if (pageId === 'anime') bgColor = '#45b7d1';
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
    console.log('Tarih tıklandı:', arg.dateStr);
  };

  const handleEventClick = (clickInfo) => {
    console.log('Etkinlik tıklandı:', clickInfo.event.title);
  };

  return (
    <div className="takvim-container">
      <div className="takvim-header">
        <h1>İçerik Takvimi</h1>
        <p>Film, dizi ve anime yayın tarihlerinizi takip edin</p>
      </div>
      
      <div className="takvim-content">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="calc(100vh - 200px)"
          locale="tr"
          firstDay={1}
          buttonText={{
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün'
          }}
          dayMaxEvents={true}
          moreLinkText="daha fazla"
          noEventsText="Gösterilecek etkinlik yok"
          eventDisplay="block"
          displayEventTime={true}
          allDayText="Tüm gün"
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          expandRows={true}
          stickyHeaderDates={true}
          dayHeaderFormat={{ weekday: 'long' }}
        />
      </div>
    </div>
  );
};

export default Takvim;
