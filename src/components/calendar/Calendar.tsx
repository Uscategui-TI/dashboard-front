"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import Tippy from "@tippyjs/react";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/shared/ui/modal";
import { ImageUpload } from "../form/form-elements/ImageUpload";
import { FieldValues, useForm } from "react-hook-form";
import "tippy.js/dist/tippy.css";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    imageUrl?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventData, setEventData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    level: "",
    urlMedia: ""
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  
  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const {
    watch,
    reset,
    formState: { errors: errorsGeneral },
  } = useForm<FieldValues>({ defaultValues: {} });
  
  const urlMedia = watch("urlMedia");
  
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${authUrl}/api/messages/events`);
      if (!response.ok) throw new Error("Error al cargar eventos");
  
      const data = await response.json();
  
      const formattedEvents: CalendarEvent[] = data.all.map((event: any) => ({
        id: event.id.toString(),
        title: event.eventName,
        start: event.startDate,
        end: event.endDate,
        allDay: true,
        extendedProps: {
          calendar: event.color,
          imageUrl: event.imageUrl,
        },
      }));
  
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const createEvent = async () => {
    try {
      const response = await fetch(`${authUrl}/api/messages/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: eventData.title,
          color: eventData.level,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          imageUrl: eventData.urlMedia,
        }),
      });
  
      if (!response.ok) throw new Error("Error al guardar el evento");
  
      console.log("🌐 URL DE LA IMAGEN:", urlMedia);
  
      await fetchEvents();
      closeModal();
      resetModalFields();
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert("Hubo un problema al guardar el evento.");
    }
  };
  
  const handleAddOrUpdateEvent = async () => {

    console.log(eventData.urlMedia)
    console.log(urlMedia)
    if (selectedEvent) {
      try {
        const response = await fetch(`${authUrl}/api/messages/update/${selectedEvent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: eventData.title,
            color: eventData.level,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            imageUrl: eventData.urlMedia,
          }),
        });
  
        if (!response.ok) throw new Error("Error al actualizar el evento");
  
        await fetchEvents();
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Error al actualizar el evento:", error);
        alert("Hubo un problema al actualizar el evento.");
      }
    } else {
      createEvent();
    }
  };
  
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventData((prev) => ({
      ...prev,
      startDate: selectInfo.startStr,
      endDate: selectInfo.endStr || selectInfo.startStr,
    }));
    openModal();
  };
  
  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    console.log(event.extendedProps.imageUrl)
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventData({
      title: event.title,
      startDate: event.start?.toISOString().split("T")[0] || "",
      endDate: event.end?.toISOString().split("T")[0] || "",
      level: event.extendedProps.calendar,
      urlMedia: event.extendedProps.imageUrl
    });
    openModal();
  };
  
  const resetModalFields = () => {
    setEventData({
      title: "",
      startDate: "",
      endDate: "",
      level: "",
      urlMedia: ""
    });
    setSelectedEvent(null);
    reset();
  };
  

  const renderEventContent = (eventInfo: EventContentArg) => {
    const calendarType = eventInfo.event.extendedProps.calendar?.toLowerCase() || "primary";

    const imageUrl = eventInfo.event.extendedProps.imageUrl;
  
    const content = (
      <div className={`event-fc-color flex fc-event-main fc-bg-${calendarType} p-1 rounded-sm`}>
        <div className="fc-daygrid-event-dot"></div>
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{eventInfo.event.title}</div>
      </div>
    );
  
    // Mostrar tooltip con imagen si existe
    if (imageUrl) {
      return (
        <Tippy content={<img src={imageUrl} alt="evento" width={150} />}>
          <div>{content}</div>
        </Tippy>
      );
    }
  
    return content;
  };
  

  return (
<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
  <div className="custom-calendar">
    <FullCalendar
      ref={calendarRef}
      locale={esLocale}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next addEventButton",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      events={events}
      selectable
      select={handleDateSelect}
      eventClick={handleEventClick}
      eventContent={renderEventContent}
      customButtons={{
        addEventButton: {
          text: "Agregar Evento",
          click: openModal,
        },
      }}
    />
  </div>

  <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
      <div>
        <h5 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
          {selectedEvent ? "Editar evento" : "Añadir evento"}
        </h5>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Planifica tu próximo Evento: programa o edita un evento para mantenerte al día.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
            Título del evento
          </label>
          <input
            type="text"
            value={eventData.title || ""}
            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        <div>
          <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
            Color del evento
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            {Object.entries(calendarsEvents).map(([key, value]) => (
              <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400" htmlFor={`modal${key}`}>
                <input
                  className="sr-only"
                  type="radio"
                  name="event-level"
                  value={key}
                  id={`modal${key}`}
                  checked={eventData.level === key}
                  onChange={() => setEventData({ ...eventData, level: key })}
                />
                <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full dark:border-gray-700">
                  <span className={`h-2 w-2 rounded-full bg-white ${eventData.level === key ? "block" : "hidden"}`} />
                </span>
                {key}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-full">
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={eventData.startDate || ""}
              onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>

          <div className="w-full">
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
              Fecha final
            </label>
            <input
              type="date"
              value={eventData.endDate || ""}
              onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">
            Adjunta imagen del evento
          </label>
          <ImageUpload
           onChange={(value) =>
            setEventData(prev => ({
              ...prev,
              urlMedia: value || ""
            }))
          }
            value={eventData.urlMedia || undefined}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={closeModal}
          type="button"
          className="flex w-full sm:w-auto justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Cerrar
        </button>
        <button
          onClick={handleAddOrUpdateEvent}
          type="button"
          className="flex w-full sm:w-auto justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {selectedEvent ? "Actualizar cambios" : "Añadir evento"}
        </button>
      </div>
    </div>
  </Modal>
</div>

  );
};


export default Calendar;