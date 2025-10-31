import React, { useState } from 'react';
import useTasks from '../hooks/useTasks';
import TaskList from './TaskList';
import EditTaskModal from './EditTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { toast } from 'react-toastify';

const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const TrashPage = () => {
  // Get the filtered list and the new delete function
  const { trashTasks, loading, error, deleteMultipleTasksPermanently } = useTasks();

  // --- NEW: State to manage selected tasks ---
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states (no changes)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToView, setTaskToView] = useState(null);

  const handleOpenEditModal = (task) => { setTaskToEdit(task); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setTaskToEdit(null); setIsEditModalOpen(false); };
  const handleOpenDetailModal = (task) => { setTaskToView(task); setIsDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setTaskToView(null); setIsDetailModalOpen(false); };

  // --- NEW: Functions to handle selection ---
  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(trashTasks.map(task => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  // --- NEW: Function to delete selected tasks ---
  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${selectedTasks.length} tasks? This action cannot be undone.`)) {
        setIsDeleting(true);
        await deleteMultipleTasksPermanently(selectedTasks);
        setSelectedTasks([]); // Clear selection
        setIsDeleting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-center py-10 text-red-500 font-semibold">{error}</div>;

  const isAllSelected = trashTasks.length > 0 && selectedTasks.length === trashTasks.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trash</h1>
        {/* --- NEW: Delete Button --- */}
        {selectedTasks.length > 0 && (
            <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
            >
                {isDeleting ? 'Deleting...' : `Delete ${selectedTasks.length} Permanently`}
            </button>
        )}
      </div>

      {/* --- NEW: Selection Header --- */}
      {trashTasks.length > 0 && (
        <div className="flex items-center p-2 mb-4 bg-white rounded-md shadow-sm border">
            <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                checked={isAllSelected}
                onChange={handleSelectAll}
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
                Select All ({selectedTasks.length} selected)
            </label>
        </div>
      )}

      {/* --- NEW: Pass selection props to TaskList --- */}
      <TaskList 
        tasks={trashTasks} 
        onEdit={handleOpenEditModal} 
        onViewDetails={handleOpenDetailModal}
        // Pass down selection state and handler
        selectionMode={true} 
        selectedTasks={selectedTasks}
        onSelectTask={handleSelectTask}
      />

      <EditTaskModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} task={taskToEdit} />
      <TaskDetailModal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} task={taskToView} />
    </div>
  );
};

export default TrashPage;




