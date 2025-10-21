import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import TaskDetailModal from './TaskDetailModal'; // Import the new details modal

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AllTasksPage = () => {
  const { tasks, loading, error, addTask } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  // --- NEW: State to control the "Task Details" modal ---
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState(null);

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setTaskToEdit(null);
    setIsEditModalOpen(false);
  };

  // --- NEW: Functions to open and close the details modal ---
  const handleOpenDetailModal = (task) => {
    setTaskToView(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setTaskToView(null);
    setIsDetailModalOpen(false);
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <p className="text-gray-500 mt-2">Could not load tasks. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Tasks</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          + Add New Task
        </button>
      </div>

      {/* --- NEW: We now pass BOTH onEdit and onViewDetails down to the TaskList --- */}
      <TaskList 
        tasks={tasks} 
        onEdit={handleOpenEditModal} 
        onViewDetails={handleOpenDetailModal} 
      />

      {/* Render all three modals, they will only be visible when their 'isOpen' prop is true */}
      <AddTaskModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
      />
      <EditTaskModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        task={taskToEdit}
      />
      <TaskDetailModal 
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        task={taskToView}
      />
    </div>
  );
};

export default AllTasksPage;