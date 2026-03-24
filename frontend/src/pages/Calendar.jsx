import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Calendar = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, emailsRes] = await Promise.all([
        api.get('/events'),
        api.get('/events/email-history'),
      ]);
      setEvents(eventsRes.data.events);
      setEmails(emailsRes.data.emails);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      const response = await api.post('/events', formData);
      setSuccess(response.data.message);
      setFormData({ title: '', description: '', eventDate: '', eventTime: '' });
      setShowAddForm(false);
      setSelectedDate(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    clearMessages();

    try {
      await api.delete(`/events/${id}`);
      setSuccess('Event deleted');
      fetchData();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleDateClick = (date) => {
    const dateStr = formatDateISO(date);
    setSelectedDate(dateStr);
    if (isAdmin()) {
      setFormData({ ...formData, eventDate: dateStr });
      setShowAddForm(true);
    }
  };

  // Calendar helpers
  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday=0
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getEventsForDate = (dateStr) => {
    return events.filter((e) => e.event_date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const monthLabel = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Build calendar grid
  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  }

  // Events for selected date
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">Calendar</h1>
        {isAdmin() && (
          <button
            onClick={() => { setShowAddForm(!showAddForm); clearMessages(); }}
            className="btn btn-primary btn-luxury"
          >
            {showAddForm ? 'Cancel' : '+ Add Event'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-scale-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-scale-in flex items-center gap-2">
          <span className="text-lg">&#10003;</span> {success}
        </div>
      )}

      {/* Add event form */}
      {showAddForm && (
        <div className="card mb-6 animate-scale-in border-l-4" style={{ borderLeftColor: 'var(--theme-primary)' }}>
          <h2 className="text-xl font-semibold mb-4">New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Bring in your bakes!"
                required
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 outline-none transition-all"
                style={{ '--tw-ring-color': 'var(--theme-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any additional details..."
                rows={2}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 outline-none transition-all resize-y"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-sm text-neutral-500">All active users will be emailed when you create this event.</p>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-luxury disabled:opacity-50"
            >
              {submitting ? 'Creating & Notifying...' : 'Create Event & Notify Users'}
            </button>
          </form>
        </div>
      )}

      {/* Calendar grid */}
      <div className="card mb-6 overflow-hidden" style={{ borderTop: '4px solid var(--theme-primary)' }}>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-neutral-900">{monthLabel}</h2>
            <button onClick={goToToday} className="text-xs font-medium transition-colors" style={{ color: 'var(--theme-primary)' }}>
              Today
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="bg-neutral-50 min-h-[80px] sm:min-h-[100px]" />;
            }

            const dateStr = formatDateISO(date);
            const dayEvents = getEventsForDate(dateStr);
            const today = isToday(date);
            const past = isPast(date);
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`
                  min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 text-left transition-all relative
                  ${past ? 'bg-white/60' : 'bg-white hover:bg-neutral-50'}
                  ${isSelected ? 'ring-2 ring-inset z-10' : ''}
                `}
                style={isSelected ? { '--tw-ring-color': 'var(--theme-primary)' } : undefined}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium
                    ${today ? 'text-white font-bold' : past ? 'text-neutral-400' : 'text-neutral-700'}
                  `}
                  style={today ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' } : undefined}
                >
                  {date.getDate()}
                </span>

                {/* Event dots / pills */}
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[10px] sm:text-xs leading-tight truncate rounded px-1 py-0.5 font-medium"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                        color: 'var(--theme-primary)',
                      }}
                    >
                      <span className="hidden sm:inline">{evt.title}</span>
                      <span className="sm:hidden">{evt.event_time || '...'}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] font-medium" style={{ color: 'var(--theme-primary)' }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date detail panel */}
      {selectedDate && (
        <div className="card mb-6 animate-scale-in border-l-4" style={{ borderLeftColor: 'var(--theme-primary)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-neutral-900">{formatDate(selectedDate)}</h2>
            <div className="flex items-center gap-2">
              {isAdmin() && (
                <button
                  onClick={() => {
                    setFormData({ ...formData, eventDate: selectedDate });
                    setShowAddForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  + Add event
                </button>
              )}
              <button
                onClick={() => setSelectedDate(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-neutral-400 text-sm">No events on this day</p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg p-4"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 8%, white), color-mix(in srgb, var(--theme-secondary) 8%, white))',
                    border: '1px solid color-mix(in srgb, var(--theme-primary) 25%, transparent)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                      )}
                      {event.event_time && (
                        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--theme-primary)' }}>
                          {event.event_time}
                        </p>
                      )}
                    </div>
                    {isAdmin() && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-400 hover:text-red-600 text-sm ml-3 shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming events list */}
      {events.filter(e => !isPast(new Date(e.event_date + 'T00:00:00'))).length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-2">
            {events
              .filter(e => !isPast(new Date(e.event_date + 'T00:00:00')))
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: 'color-mix(in srgb, var(--theme-primary) 6%, white)',
                    border: '1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                  }}
                  onClick={() => {
                    setSelectedDate(event.event_date);
                    const eventMonth = new Date(event.event_date + 'T00:00:00');
                    setCurrentMonth(new Date(eventMonth.getFullYear(), eventMonth.getMonth(), 1));
                  }}
                >
                  <div
                    className="text-center min-w-[50px] rounded-lg p-2"
                    style={{
                      background: 'linear-gradient(135deg, var(--theme-gradient-start), var(--theme-gradient-end))',
                      color: 'var(--theme-text)',
                    }}
                  >
                    <div className="text-lg font-bold leading-tight">
                      {new Date(event.event_date + 'T00:00:00').getDate()}
                    </div>
                    <div className="text-[10px] uppercase font-semibold opacity-80">
                      {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 truncate">{event.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {formatDate(event.event_date)}
                      {event.event_time && ` at ${event.event_time}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Email history */}
      <div className="card">
        <button
          onClick={() => setShowEmailHistory(!showEmailHistory)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-xl font-semibold">Email History</h2>
          <span className="text-neutral-400 text-sm">
            {showEmailHistory ? 'Hide' : `Show (${emails.length})`}
          </span>
        </button>
        <p className="text-neutral-500 text-sm mt-1">
          Catch up on previous announcements and notifications.
        </p>

        {showEmailHistory && (
          <div className="space-y-2 mt-4">
            {emails.length === 0 ? (
              <p className="text-neutral-400">No emails sent yet</p>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'color-mix(in srgb, var(--theme-primary) 4%, white)',
                    border: '1px solid color-mix(in srgb, var(--theme-primary) 12%, transparent)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-neutral-800 text-sm">{email.subject}</h3>
                    <span className="text-xs text-neutral-400 ml-2 shrink-0">
                      {new Date(email.sent_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 whitespace-pre-line">{email.message}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    Sent by {email.sent_by_name} to {email.recipient_count} user{email.recipient_count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
