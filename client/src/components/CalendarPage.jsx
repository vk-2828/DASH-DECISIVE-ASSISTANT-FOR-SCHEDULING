import React, { useMemo, useState, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import useTasks from '../hooks/useTasks';
import CalendarToolbar from './CalendarToolbar'; // Import our new custom toolbar
import './CalendarPage.css'; // We still use our custom styles

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { tasks, loading, error } = useTasks();

  // --- NEW: State to manually control the calendar ---
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Memoize events
  const events = useMemo(() => {
    return tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task._id,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
      }));
  }, [tasks]);

  // --- NEW: Handlers that allow our toolbar to control the calendar ---
  const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView) => setView(newView), [setView]);
  const handleSelectSlot = useCallback(({ start }) => setSelectedDate(start), [setSelectedDate]);

  // Memoize selected tasks
  const selectedTasks = useMemo(() => {
    return tasks.filter(task => 
      task.dueDate && moment(task.dueDate).isSame(selectedDate, 'day')
    );
  }, [tasks, selectedDate]);

  if (loading) return <div className="text-center py-10">Loading Calendar...</div>;
  if (error) return <div className="text-center py-10 text-red-500 font-semibold">{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar Section */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '75vh' }}
          selectable
          onSelectSlot={handleSelectSlot}
          
          // --- NEW: Connecting our state and handlers ---
          view={view}
          date={date}
          onView={handleView}
          onNavigate={handleNavigate}
          // --- End New ---

          views={['month', 'week']} // We can also add 'day' and 'agenda'
          components={{
            // Tell the calendar to use our custom toolbar
            toolbar: CalendarToolbar, 
          }}
        />
      </div>

      {/* Selected Date Tasks Section (Right Panel) */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tasks for <span className="text-blue-600">{moment(selectedDate).format('MMMM D, YYYY')}</span>
            </h2>
            {selectedTasks.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {selectedTasks.map(task => (
                  <li key={task._id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="font-medium text-gray-900">{task.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No tasks due on this day.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;








// import React, { useMemo, useState, useCallback } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import useTasks from '../hooks/useTasks';
// import './CalendarPage.css';

// const localizer = momentLocalizer(moment);

// const CustomToolbar = ({ label, onNavigate }) => {
//   return (
//     <div className="flex items-center justify-between mb-6">
//       <div className="flex items-center space-x-2">
//         <button type="button" onClick={() => onNavigate('PREV')} className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">&larr;</button>
//         <button type="button" onClick={() => onNavigate('TODAY')} className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Today</button>
//         <button type="button" onClick={() => onNavigate('NEXT')} className="px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">&rarr;</button>
//       </div>
//       <h2 className="text-2xl font-bold text-gray-800">{label}</h2>
//       <div className="w-32"></div>
//     </div>
//   );
// };

// const CalendarPage = () => {
//   const { tasks, loading, error } = useTasks();
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   const events = useMemo(() => tasks.filter(task => task.dueDate).map(task => ({
//     id: task._id, title: task.title, start: new Date(task.dueDate), end: new Date(task.dueDate), allDay: true,
//   })), [tasks]);

//   const handleSelectSlot = useCallback(({ start }) => setSelectedDate(start), []);

//   const selectedTasks = useMemo(() => tasks.filter(task => 
//     task.dueDate && moment(task.dueDate).isSame(selectedDate, 'day')
//   ), [tasks, selectedDate]);

//   if (loading) return <div>Loading Calendar...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//       <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
//         <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: '75vh' }} selectable onSelectSlot={handleSelectSlot} view="month" views={['month']} components={{ toolbar: CustomToolbar }} />
//       </div>
//       <div className="lg:col-span-1">
//         <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Tasks for <span className="text-blue-600">{moment(selectedDate).format('MMMM D, YYYY')}</span></h2>
//             {selectedTasks.length > 0 ? (
//               <ul className="space-y-3 max-h-96 overflow-y-auto">{selectedTasks.map(task => (<li key={task._id} className="p-3 bg-gray-50 rounded-md border border-gray-200"><p className="font-medium text-gray-900">{task.title}</p></li>))}</ul>
//             ) : (<p className="text-sm text-gray-500 mt-4">No tasks due on this day.</p>)}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CalendarPage;