import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';
import EditTaskModal from './EditTaskModal'; // Import the Edit modal

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const StarredTasksPage = () => {
  const { starredTasks, loading, error } = useTasks();

  // --- NEW: Add state management for the Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setTaskToEdit(null);
    setIsEditModalOpen(false);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Starred Tasks</h1>
      </div>
      
      {/* --- NEW: Pass the onEdit function to the TaskList --- */}
      <TaskList tasks={starredTasks} onEdit={handleOpenEditModal} />

      {/* --- NEW: Render the EditTaskModal --- */}
      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={taskToEdit}
      />
    </div>
  );
};

export default StarredTasksPage;