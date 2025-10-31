import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import TaskDetailModal from './TaskDetailModal';

// A simple, reusable loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AllTasksPage = () => {
  // Get the global state and functions using our custom hook
  // 'tasks' here is the *filtered* list, thanks to our updated TaskProvider
  const { tasks, loading, error, addTask } = useTasks();

  // State to control the "Add New Task" modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State to control the "Edit Task" modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null); // This will hold the task being edited

  // State to control the "Task Details" modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState(null);

  // Function to open the edit modal with the correct task data
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  // Function to close the edit modal
  const handleCloseEditModal = () => {
    setTaskToEdit(null);
    setIsEditModalOpen(false);
  };

  // Functions to open and close the details modal
  const handleOpenDetailModal = (task) => {
    setTaskToView(task);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setTaskToView(null);
    setIsDetailModalOpen(false);
  };

  // 1. Handle the loading state
  if (loading) {
    return <Spinner />;
  }

  // 2. Handle the error state
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-semibold">{error}</p>
        <p className="text-gray-500 mt-2">Could not load tasks. Please try refreshing the page.</p>
      </div>
    );
  }

  // 3. Render the page
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

      {/* We pass the filtered list and the modal handlers down to the TaskList */}
      <TaskList 
        tasks={tasks} 
        onEdit={handleOpenEditModal} 
        onViewDetails={handleOpenDetailModal} 
      />

      {/* Render all three modals */}
      {/* They will only be visible when their 'isOpen' prop is true */}
      
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











