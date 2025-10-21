import React from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';

// A simple loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const TrashPage = () => {
  // Get the global state, but we only need the 'trashTasks' list
  const { trashTasks, loading, error } = useTasks();

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trash</h1>
        {/* We can add an "Empty Trash" button here later */}
      </div>
      <TaskList tasks={trashTasks} />
    </div>
  );
};

export default TrashPage;