import React from 'react';
import TaskItem from './TaskItem';

// --- The component now accepts an 'onViewDetails' function as a prop ---
const TaskList = ({ tasks, onEdit, onViewDetails }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new task.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        // --- Each TaskItem now receives BOTH functions ---
        <TaskItem 
          key={task._id} 
          task={task} 
          onEdit={onEdit} 
          onViewDetails={onViewDetails} 
        />
      ))}
    </div>
  );
};

export default TaskList;