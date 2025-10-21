// import React from 'react';
// import moment from 'moment';

// const TaskDetailModal = ({ task, isOpen, onClose }) => {
//   if (!isOpen || !task) return null;

//   const PriorityBadge = ({ priority }) => {
//     let colorClass, text;
//     if (priority > 75) { [colorClass, text] = ['bg-red-100 text-red-800', 'High']; }
//     else if (priority > 40) { [colorClass, text] = ['bg-yellow-100 text-yellow-800', 'Medium']; }
//     else { [colorClass, text] = ['bg-green-100 text-green-800', 'Low']; }
//     return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}>{text}</span>;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
//         <div className="p-6">
//           <div className="flex justify-between items-start">
//             <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
//           </div>

//           {task.description && (
//             <p className="mt-2 text-base text-gray-600">{task.description}</p>
//           )}

//           <div className="mt-6 border-t border-gray-200 pt-6">
//             <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Status</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{task.isCompleted ? 'Completed' : 'Pending'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Priority</dt>
//                 <dd className="mt-1 text-sm text-gray-900"><PriorityBadge priority={task.priority} /></dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Due Date</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{task.dueDate ? moment(task.dueDate).format('MMMM D, YYYY') : 'Not set'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Created</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{moment(task.createdAt).format('MMMM D, YYYY')}</dd>
//               </div>
//               <div className="sm:col-span-2">
//                 <dt className="text-sm font-medium text-gray-500">Reminders</dt>
//                 <dd className="mt-1 text-sm text-gray-900">
//                   {task.alarms && task.alarms.length > 0 ? (
//                     <ul className="list-disc list-inside space-y-1">
//                       {task.alarms.map((alarm, index) => (
//                         <li key={index}>
//                           {moment(alarm.time).format('MMMM D, YYYY [at] h:mm A')}
//                           {alarm.repeatDaily && <span className="ml-2 text-xs font-semibold text-blue-600">(Repeats Daily)</span>}
//                         </li>
//                       ))}
//                     </ul>
//                   ) : 'No reminders set'}
//                 </dd>
//               </div>
//             </dl>
//           </div>
//         </div>
//         <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
//           <button
//             type="button"
//             onClick={onClose}
//             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskDetailModal;



















import React from 'react';
import moment from 'moment';

const TaskDetailModal = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  const PriorityBadge = ({ priority }) => {
    let colorClass, text;
    if (priority > 75) { [colorClass, text] = ['bg-red-100 text-red-800', 'High']; }
    else if (priority > 40) { [colorClass, text] = ['bg-yellow-100 text-yellow-800', 'Medium']; }
    else { [colorClass, text] = ['bg-green-100 text-green-800', 'Low']; }
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}>{text}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
          </div>

          {task.description && (
            <p className="mt-2 text-base text-gray-600">{task.description}</p>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{task.isCompleted ? 'Completed' : 'Pending'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1 text-sm text-gray-900"><PriorityBadge priority={task.priority} /></dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{task.dueDate ? moment(task.dueDate).format('MMMM D, YYYY') : 'Not set'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{moment(task.createdAt).format('MMMM D, YYYY')}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Reminders</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {task.alarms && task.alarms.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {task.alarms.map((alarm, index) => (
                        <li key={index}>
                          {moment(alarm.time).format('MMMM D, YYYY [at] h:mm A')}
                          {alarm.repeatDaily && <span className="ml-2 text-xs font-semibold text-blue-600">(Repeats Daily)</span>}
                        </li>
                      ))}
                    </ul>
                  ) : 'No reminders set'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;