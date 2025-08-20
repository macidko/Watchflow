import React, { useState, useEffect } from 'react';
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
      const { apiData, pageId } = content;

      // Yayın tarihini etkinlik olarak ekle
      if (apiData?.releaseDate && apiData?.title) {
        calendarEvents.push({
          id: `release-${content.id}`,
          title: `📅 ${apiData.title}`,
          start: apiData.releaseDate,
          allDay: true,
          backgroundColor: pageId === 'film' ? '#ff6b6b' : pageId === 'dizi' ? '#4ecdc4' : '#45b7d1',
          borderColor: 'transparent',
          textColor: 'white'
        });
      }

      // Sonraki bölüm tarihini ekle (eğer varsa)
      if (apiData?.relations?.nextEpisode?.airDate && apiData?.title) {
        calendarEvents.push({
          id: `next-episode-${content.id}`,
          title: `🎬 ${apiData.title} - Yeni Bölüm`,
          start: apiData.relations.nextEpisode.airDate,
          allDay: false,
          backgroundColor: '#ffa726',
          borderColor: 'transparent',
          textColor: 'white'
        });
      }

      // Sezon sonraki tarihini ekle (eğer varsa)
      if (apiData?.relations?.nextSeason?.airDate && apiData?.title) {
        calendarEvents.push({
          id: `next-season-${content.id}`,
          title: `🎭 ${apiData.title} - Yeni Sezon`,
          start: apiData.relations.nextSeason.airDate,
          allDay: true,
          backgroundColor: '#9c27b0',
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
