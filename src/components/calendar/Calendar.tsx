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
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "../form/form-elements/ImageUpload";
import { FieldValues, useForm } from "react-hook-form";
import "tippy.js/dist/tippy.css";
import axios from "axios";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    imageUrl?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_PRESET;

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: errorsGeneral }
  } = useForm<FieldValues>({ defaultValues: {} });

  const setCustomValue = (id: any, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const urlMedia = watch('urlMedia');

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${authUrl}/api/messages/events`);
      if (!response.ok) throw new Error("Error al cargar eventos");

      const data = await response.json();

      const formattedEvents: CalendarEvent[] = data.map((event: any) => ({
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
          eventName: eventTitle,
          color: eventLevel,
          startDate: eventStartDate,
          endDate: eventEndDate,
          imageUrl: urlMedia, // ✅ Aquí ya viene la URL directa de Cloudinary
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
    if (selectedEvent) {
      try {
        const response = await fetch(`${authUrl}/api/messages/update/${selectedEvent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: eventTitle,
            color: eventLevel,
            startDate: eventStartDate,
            endDate: eventEndDate,
            imageUrl: urlMedia,
          }),
        });
  
        if (!response.ok) throw new Error("Error al actualizar el evento");
  
        await fetchEvents(); // Recargar eventos
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Error al actualizar el evento:", error);
        alert("Hubo un problema al actualizar el evento.");
      }
    } else {
      createEvent(); // creación si no hay evento seleccionado
    }
  };
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
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
          selectable={true}
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

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Editar evento" : "Añadir evento"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Planifica tu próximo Evento: programa o edita un evento para mantenerte al día.
            </p>
          </div>

          <div className="mt-8">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Título del evento
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />

            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Color del evento
              </label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <div key={key} className="n-chk">
                    <label
                      className="flex items-center text-sm text-gray-700 dark:text-gray-400"
                      htmlFor={`modal${key}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="event-level"
                        value={key}
                        id={`modal${key}`}
                        checked={eventLevel === key}
                        onChange={() => setEventLevel(key)}
                      />
                      <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full dark:border-gray-700">
                        <span className={`h-2 w-2 rounded-full bg-white ${eventLevel === key ? "block" : "hidden"}`} />
                      </span>
                      {key}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-6 w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div className="mt-6 w-full">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Fecha final
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Adjunta imagen del evento
              </label>
              <ImageUpload
                onChange={(value) => setCustomValue('urlMedia', value)}
                value={urlMedia || undefined}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cerrar
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {selectedEvent ? "Actualizar cambios" : "Añadir evento"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;