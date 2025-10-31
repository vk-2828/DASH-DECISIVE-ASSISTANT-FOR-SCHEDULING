import React from 'react';
import useTasks from '../hooks/useTasks';
import moment from 'moment'; // We need moment.js to check the dates

// --- SVG Icons (No changes) ---
const StarIcon = ({ isStarred }) => ( <svg className={`w-5 h-5 cursor-pointer ${isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> );
const EditIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg> );
const TrashIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
const ClockIcon = () => ( <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> );
const RestoreIcon = () => ( <svg className="w-5 h-5 text-gray-400 hover:text-green-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15l-4-4 4-4M21 10l-4 4-4-4"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15V3" /></svg> );
const WarningIcon = () => ( <svg className="w-4 h-4 mr-1 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.332-.21 3.031-1.742 3.031H4.42c-1.532 0-2.492-1.699-1.742-3.031l5.58-9.92zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg> );
// --- End Icons ---


const TaskItem = ({ task, onEdit, onViewDetails, selectionMode = false, isSelected = false, onSelectTask = () => {} }) => {
  const { updateTask, deleteTask, restoreTask } = useTasks();

  // --- NEW: Logic to check if task is overdue for purging ---
  const isOverdueForPurge = task.dueDate && moment().diff(moment(task.dueDate), 'days') > 7;
  const showWarning = task.isDeleted && isOverdueForPurge;

  const PriorityBadge = ({ priority }) => { /* ... (no changes) ... */ };

  // --- Handlers ---
  const handleToggleComplete = (e) => { e.stopPropagation(); updateTask(task._id, { isCompleted: !task.isCompleted }); };
  const handleToggleStar = (e) => { e.stopPropagation(); updateTask(task._id, { isStarred: !task.isStarred }); };
  const handleEdit = (e) => { e.stopPropagation(); onEdit(task); };
  const handleDelete = (e) => { e.stopPropagation(); if (window.confirm(`Move "${task.title}" to the trash?`)) { deleteTask(task._id); } };
  const handleRestore = (e) => { e.stopPropagation(); restoreTask(task._id); };

  // --- NEW: Checkbox logic is now dynamic ---
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Stop click from opening details
    if (selectionMode) {
      // If we are in selection mode (TrashPage), call the selection handler
      onSelectTask(task._id);
    } else {
      // Otherwise, just toggle the completion status
      handleToggleComplete(e);
    }
  };
  
  // The checkbox is 'checked' if it's selected in selection mode, OR if the task is completed
  const isCheckboxChecked = selectionMode ? isSelected : task.isCompleted;

  return (
    // --- NEW: Added dynamic classes for warning and selection ---
    <div 
      onClick={() => onViewDetails(task)} 
      className={`
        bg-white rounded-lg shadow-md border flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer 
        ${showWarning ? 'border-red-400' : 'border-gray-200'} 
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
      `}
    >
      {/* Card Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={isCheckboxChecked}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()} // Stop propagation here too
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
            // Disable the 'complete' checkbox if the task is in the trash
            disabled={task.isDeleted && !selectionMode} 
          />
          <div className="ml-4">
            <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
            {task.description && (<p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>)}
          </div>
        </div>
        {!task.isDeleted && (<button onClick={handleToggleStar} className="p-1"><StarIcon isStarred={task.isStarred} /></button>)}
      </div>

      {/* Card Footer */}
      <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-4 text-sm">
            {task.dueDate && (
                <div className="flex items-center text-gray-600">
                    <ClockIcon />
                    <span>{moment(task.dueDate).format('MMM D, YYYY [at] h:mm A')}</span>
                </div>
            )}
            <PriorityBadge priority={task.priority} />
        </div>
        
        <div className="flex items-center space-x-2">
            {/* --- NEW: Show Warning Icon if needed --- */}
            {showWarning && (
              <div className="flex items-center text-xs text-red-600" title={`Overdue. Will be permanently deleted ${moment(task.dueDate).add(7, 'days').fromNow()}.`}>
                <WarningIcon />
              </div>
            )}
            
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

// Re-add the memoized PriorityBadge to avoid re-renders.
const PriorityBadge = ({ priority }) => {
    let colorClass, text;
    if (priority > 75) { [colorClass, text] = ['bg-red-100 text-red-800', 'High']; }
    else if (priority > 40) { [colorClass, text] = ['bg-yellow-100 text-yellow-800', 'Medium']; }
    else { [colorClass, text] = ['bg-green-100 text-green-800', 'Low']; }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{text} Priority</span>;
};

export default TaskItem;






