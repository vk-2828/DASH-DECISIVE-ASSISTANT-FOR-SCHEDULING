import React from 'react';
import useTasks from '../hooks/useTasks';
import moment from 'moment'; // Import moment for easy date formatting

// --- SVG Icons (no changes) ---
const StarIcon = ({ isStarred }) => ( <svg className={`w-5 h-5 cursor-pointer ${isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> );
const EditIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg> );
const TrashIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
const ClockIcon = () => ( <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> );
const RestoreIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15l-4-4 4-4M21 10l-4 4-4-4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15V3" /></svg> );


const TaskItem = ({ task, onEdit, onViewDetails }) => {
  const { updateTask, deleteTask, restoreTask } = useTasks();

  const PriorityBadge = ({ priority }) => {
    let colorClass, text;
    if (priority > 75) { [colorClass, text] = ['bg-red-100 text-red-800', 'High']; }
    else if (priority > 40) { [colorClass, text] = ['bg-yellow-100 text-yellow-800', 'Medium']; }
    else { [colorClass, text] = ['bg-green-100 text-green-800', 'Low']; }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{text} Priority</span>;
  };

  const handleToggleComplete = (e) => { e.stopPropagation(); updateTask(task._id, { isCompleted: !task.isCompleted }); };
  const handleToggleStar = (e) => { e.stopPropagation(); updateTask(task._id, { isStarred: !task.isStarred }); };
  const handleEdit = (e) => { e.stopPropagation(); onEdit(task); };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Move "${task.title}" to the trash?`)) { deleteTask(task._id); }
  };
  const handleRestore = (e) => { e.stopPropagation(); restoreTask(task._id); };

  return (
    <div onClick={() => onViewDetails(task)} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col hover:shadow-lg hover:border-blue-500 transition-all duration-200 cursor-pointer">
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start">
          <input type="checkbox" checked={task.isCompleted} onChange={handleToggleComplete} onClick={(e) => e.stopPropagation()} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer" disabled={task.isDeleted} />
          <div className="ml-4">
            <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
            {task.description && (<p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>)}
          </div>
        </div>
        {!task.isDeleted && (<button onClick={handleToggleStar} className="p-1"><StarIcon isStarred={task.isStarred} /></button>)}
      </div>
      <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-4 text-sm">
            {/* --- NEW: Display the time along with the date --- */}
            {task.dueDate && (
                <div className="flex items-center text-gray-600">
                    <ClockIcon />
                    {/* Use moment.js to format the date and time beautifully */}
                    <span>{moment(task.dueDate).format('MMM D, YYYY [at] h:mm A')}</span>
                </div>
            )}
            <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center space-x-2">
            {task.isDeleted ? (
                <button onClick={handleRestore} className="p-1" title="Restore Task"><RestoreIcon /></button>
            ) : (
                <>
                    <button onClick={handleEdit} className="p-1" title="Edit Task"><EditIcon /></button>
                    <button onClick={handleDelete} className="p-1" title="Move to Trash"><TrashIcon /></button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;










// import React from 'react';
// import useTasks from '../hooks/useTasks';

// // --- SVG Icons (no changes here) ---
// const StarIcon = ({ isStarred }) => ( <svg className={`w-5 h-5 cursor-pointer ${isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> );
// const EditIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg> );
// const TrashIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
// const ClockIcon = () => ( <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> );
// const RestoreIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15l-4-4 4-4M21 10l-4 4-4-4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15V3" /></svg> );

// // --- The component now accepts an 'onViewDetails' function ---
// const TaskItem = ({ task, onEdit, onViewDetails }) => {
//   const { updateTask, deleteTask, restoreTask } = useTasks();

//   const PriorityBadge = ({ priority }) => { /* ... (no changes here) ... */ };

//   // --- Button handlers now stop event propagation ---
//   const handleToggleComplete = (e) => { e.stopPropagation(); updateTask(task._id, { isCompleted: !task.isCompleted }); };
//   const handleToggleStar = (e) => { e.stopPropagation(); updateTask(task._id, { isStarred: !task.isStarred }); };
//   const handleEdit = (e) => { e.stopPropagation(); onEdit(task); };
//   const handleDelete = (e) => {
//     e.stopPropagation();
//     if (window.confirm(`Move "${task.title}" to the trash?`)) { deleteTask(task._id); }
//   };
//   const handleRestore = (e) => { e.stopPropagation(); restoreTask(task._id); };

//   return (
//     // --- The entire card is now a clickable button that opens the details modal ---
//     <div onClick={() => onViewDetails(task)} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col hover:shadow-lg hover:border-blue-500 transition-all duration-200 cursor-pointer">
//       <div className="p-4 flex items-start justify-between">
//         <div className="flex items-start">
//           <input type="checkbox" checked={task.isCompleted} onChange={handleToggleComplete} onClick={(e) => e.stopPropagation()} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer" disabled={task.isDeleted} />
//           <div className="ml-4">
//             <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
//             {task.description && (<p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>)}
//           </div>
//         </div>
//         {!task.isDeleted && (<button onClick={handleToggleStar} className="p-1"><StarIcon isStarred={task.isStarred} /></button>)}
//       </div>
//       <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50 rounded-b-lg">
//         <div className="flex items-center space-x-4 text-sm">
//             {task.dueDate && (<div className="flex items-center text-gray-600"><ClockIcon /><span>{new Date(task.dueDate).toLocaleDateString()}</span></div>)}
//             <PriorityBadge priority={task.priority} />
//         </div>
//         <div className="flex items-center space-x-2">
//             {task.isDeleted ? (
//                 <button onClick={handleRestore} className="p-1" title="Restore Task"><RestoreIcon /></button>
//             ) : (
//                 <>
//                     <button onClick={handleEdit} className="p-1" title="Edit Task"><EditIcon /></button>
//                     <button onClick={handleDelete} className="p-1" title="Move to Trash"><TrashIcon /></button>
//                 </>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Re-add the memoized PriorityBadge to avoid re-renders.
// TaskItem.whyDidYouRender = true; 
// const PriorityBadge = ({ priority }) => {
//     let colorClass, text;
//     if (priority > 75) { [colorClass, text] = ['bg-red-100 text-red-800', 'High']; }
//     else if (priority > 40) { [colorClass, text] = ['bg-yellow-100 text-yellow-800', 'Medium']; }
//     else { [colorClass, text] = ['bg-green-100 text-green-800', 'Low']; }
//     return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{text} Priority</span>;
// };


// export default TaskItem;