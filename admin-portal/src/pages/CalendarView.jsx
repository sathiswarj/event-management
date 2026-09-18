import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/requests', { withCredentials: true });
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        console.error("Expected array but got:", typeof data);
        setRequests([]);
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };


  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  // Find events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    return requests.filter(req => {
      if (!req.eventDate) return false;
      const eventDate = new Date(req.eventDate);
      return eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
    });
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Event Calendar</h1>
          <p className="text-gray-500 mt-1">View all booked and requested events by date.</p>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <button onClick={goToToday} className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-3 py-1 rounded-md transition-colors border border-amber-200">
            Today
          </button>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium w-36 text-center text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((date, index) => {
            const events = getEventsForDate(date);
            const isToday = date && new Date().toDateString() === date.toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-100 relative ${!date ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30 transition-colors'
                  }`}
              >
                {date && (
                  <>
                    <div className={`flex justify-between items-start mb-2`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${isToday ? 'bg-amber-500 text-white font-bold shadow-sm' : 'text-gray-700 font-medium'
                        }`}>
                        {date.getDate()}
                      </span>
                      {events.length > 0 && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {events.length} event{events.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                      {events.map(event => (
                        <div
                          key={event._id}
                          className={`text-xs p-1.5 rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] ${event.status === 'Approved' || event.status === 'Confirmed' || event.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-100'
                            }`}
                          title={`${event.title} - ${event.user?.name} (${event.status})`}
                        >
                          <div className="flex items-center gap-1 font-medium">
                            {event.status === 'Approved' || event.status === 'Confirmed' || event.status === 'Completed' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500 justify-end">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span>Confirmed / Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span>Pending / Requested</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
