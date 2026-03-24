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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + 'T00:00:00') >= today;
  };

  const upcomingEvents = events.filter((e) => isUpcoming(e.event_date));
  const pastEvents = events.filter((e) => !isUpcoming(e.event_date));

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
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

      {showAddForm && (
        <div className="card mb-6 animate-scale-in">
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
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any additional details..."
                rows={2}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-y"
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
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time (optional)</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
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

      <div className="space-y-6">
        {/* Upcoming events */}
        <div className="card stagger-item" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-neutral-500">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-primary-700">
                        {new Date(event.event_date + 'T00:00:00').getDate()}
                      </div>
                      <div className="text-xs text-primary-500 uppercase font-medium">
                        {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-neutral-600 mt-0.5">{event.description}</p>
                      )}
                      <p className="text-xs text-primary-600 mt-1">
                        {formatDate(event.event_date)}
                        {event.event_time && ` at ${event.event_time}`}
                      </p>
                    </div>
                  </div>
                  {isAdmin() && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-600 text-sm ml-2 shrink-0"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past events */}
        {pastEvents.length > 0 && (
          <div className="card stagger-item" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold mb-4">Past Events</h2>
            <div className="space-y-2">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between bg-neutral-50 border border-neutral-200 rounded-lg p-3 opacity-75"
                >
                  <div>
                    <h3 className="font-medium text-neutral-700">{event.title}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(event.event_date)}
                      {event.event_time && ` at ${event.event_time}`}
                    </p>
                  </div>
                  {isAdmin() && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-600 text-sm ml-2 shrink-0"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email history - catch-up for new users */}
        <div className="card stagger-item" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => setShowEmailHistory(!showEmailHistory)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-xl font-semibold">Email History</h2>
            <span className="text-neutral-400 text-sm">
              {showEmailHistory ? 'Hide' : `Show (${emails.length})`}
            </span>
          </button>
          <p className="text-neutral-500 text-sm mt-1 mb-3">
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
                    className="bg-neutral-50 border border-neutral-200 rounded-lg p-3"
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
    </div>
  );
};

export default Calendar;
