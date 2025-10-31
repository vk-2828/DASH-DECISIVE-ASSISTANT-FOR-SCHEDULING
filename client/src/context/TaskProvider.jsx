import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import taskService from '../api/taskService';
import notificationService from '../api/notificationService';
import AuthContext from './AuthProvider';
import { toast } from 'react-toastify';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // --- Master Lists (Raw data from API) ---
  const [tasks, setTasks] = useState([]);
  const [starredTasks, setStarredTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [trashTasks, setTrashTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // --- Search & Loading State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get auth info from AuthContext
  const { token, isAuthenticated } = useContext(AuthContext);

  // --- Core Data Fetching Function ---
  // We use useCallback to stabilize this function, so it doesn't cause unnecessary re-renders
  const refetchAllData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch all data in parallel
      const [all, starred, completed, trash, notifs] = await Promise.all([
        taskService.getAllTasks(token),
        taskService.getStarredTasks(token),
        taskService.getCompletedTasks(token),
        taskService.getDeletedTasks(token),
        notificationService.getNotifications(token),
      ]);
      setTasks(all.data);
      setStarredTasks(starred.data);
      setCompletedTasks(completed.data);
      setTrashTasks(trash.data);
      setNotifications(notifs.data);
    } catch (err) {
      setError('Failed to fetch data.');
      toast.error('Failed to load data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [token]); // This function only changes if the token changes

  // --- Effect to fetch data on login/logout ---
  useEffect(() => {
    if (isAuthenticated) {
      refetchAllData();
    } else {
      // Clear all state on logout
      setTasks([]); setStarredTasks([]); setCompletedTasks([]);
      setTrashTasks([]); setNotifications([]); setLoading(false);
    }
  }, [isAuthenticated, refetchAllData]);

  // --- Task Action Functions ---
  const addTask = useCallback(async (taskData) => {
    try {
      await taskService.createTask(taskData, token);
      await refetchAllData(); // Refetch all lists to ensure sync
      toast.success('Task added successfully!');
    } catch (err) {
      toast.error('Failed to add task.');
      throw err; // Re-throw error for the modal to catch
    }
  }, [token, refetchAllData]);

  const updateTask = useCallback(async (taskId, updateData) => {
    try {
      await taskService.updateTask(taskId, updateData, token);
      await refetchAllData(); // Refetch all lists
      toast.success('Task updated!');
    } catch (err) {
      toast.error('Failed to update task.');
    }
  }, [token, refetchAllData]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskService.deleteTask(taskId, token);
      await refetchAllData(); // Refetch all lists
      toast.info('Task moved to trash.');
    } catch (err) {
      toast.error('Failed to move task to trash.');
    }
  }, [token, refetchAllData]);

  const restoreTask = useCallback(async (taskId) => {
    try {
      await taskService.updateTask(taskId, { isDeleted: false }, token);
      await refetchAllData(); // Refetch all lists
      toast.success('Task restored successfully!');
    } catch (err) {
      toast.error('Failed to restore task.');
    }
  }, [token, refetchAllData]);

  // --- NEW Batch Delete Function ---
  const deleteMultipleTasksPermanently = useCallback(async (taskIds) => {
    if (!taskIds || taskIds.length === 0) return;
    try {
        await taskService.deleteTasksPermanently(taskIds, token);
        await refetchAllData(); // Refresh all lists
        toast.success(`Successfully deleted ${taskIds.length} tasks permanently.`);
    } catch (err) {
        toast.error('Failed to permanently delete tasks.');
    }
  }, [token, refetchAllData]);
  // --- END NEW FUNCTION ---

  // --- Memoized Filtering Logic ---
  const filterTasks = useCallback((taskList) => {
    if (!searchTerm.trim()) return taskList;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return taskList.filter(task =>
      task.title.toLowerCase().includes(lowerCaseSearch) ||
      (task.description && task.description.toLowerCase().includes(lowerCaseSearch))
    );
  }, [searchTerm]);

  const filteredTasks = useMemo(() => filterTasks(tasks), [tasks, filterTasks]);
  const filteredStarredTasks = useMemo(() => filterTasks(starredTasks), [starredTasks, filterTasks]);
  const filteredCompletedTasks = useMemo(() => filterTasks(completedTasks), [completedTasks, filterTasks]);
  const filteredTrashTasks = useMemo(() => filterTasks(trashTasks), [trashTasks, filterTasks]);

  // --- Final Context Value ---
  const value = {
    tasks: filteredTasks,
    starredTasks: filteredStarredTasks,
    completedTasks: filteredCompletedTasks,
    trashTasks: filteredTrashTasks,
    notifications,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    deleteMultipleTasksPermanently, // Expose the new function
    refetchTasks: refetchAllData,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;






