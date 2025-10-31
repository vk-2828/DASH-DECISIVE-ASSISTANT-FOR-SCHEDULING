import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';
import EditTaskModal from './EditTaskModal';
import TaskDetailModal from './TaskDetailModal'; // Import the detail modal

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const CompletedTasksPage = () => {
  // --- THIS IS THE KEY CHANGE ---
  // We now get 'completedTasks', which is the *filtered* version from the provider.
  const { completedTasks, loading, error } = useTasks();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState(null);

  const handleOpenEditModal = (task) => { setTaskToEdit(task); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setTaskToEdit(null); setIsEditModalOpen(false); };
  const handleOpenDetailModal = (task) => { setTaskToView(task); setIsDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setTaskToView(null); setIsDetailModalOpen(false); };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Completed Tasks</h1>
      </div>
      
      <TaskList 
        tasks={completedTasks} // Pass the filtered list
        onEdit={handleOpenEditModal} 
        onViewDetails={handleOpenDetailModal} 
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

export default CompletedTasksPage;






