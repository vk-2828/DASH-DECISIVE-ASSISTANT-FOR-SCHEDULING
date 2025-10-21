import React, { createContext, useState, useEffect, useContext } from 'react';
import taskService from '../api/taskService';
import notificationService from '../api/notificationService'; // <-- Import new service
import AuthContext from './AuthProvider';
import { toast } from 'react-toastify';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [starredTasks, setStarredTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [trashTasks, setTrashTasks] = useState([]);
  const [notifications, setNotifications] = useState([]); // <-- NEW: State for notifications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useContext(AuthContext);

  const refetchAllData = async () => { // Renamed for clarity
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const [all, starred, completed, trash, notifs] = await Promise.all([
        taskService.getAllTasks(token),
        taskService.getStarredTasks(token),
        taskService.getCompletedTasks(token),
        taskService.getDeletedTasks(token),
        notificationService.getNotifications(token), // <-- Fetch notifications
      ]);
      setTasks(all.data);
      setStarredTasks(starred.data);
      setCompletedTasks(completed.data);
      setTrashTasks(trash.data);
      setNotifications(notifs.data); // <-- Set notifications state
    } catch (err) {
      setError('Failed to fetch data.');
      toast.error('Failed to load data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refetchAllData();
    } else {
      setTasks([]); setStarredTasks([]); setCompletedTasks([]); setTrashTasks([]); setNotifications([]); setLoading(false);
    }
  }, [token, isAuthenticated]);

  const addTask = async (taskData) => {
    try {
      await taskService.createTask(taskData, token);
      await refetchAllData(); // Refetch all data to keep everything in sync
      toast.success('Task added successfully!');
    } catch (err) {
      toast.error('Failed to add task.'); throw err;
    }
  };

  const updateTask = async (taskId, updateData) => {
    try {
      await taskService.updateTask(taskId, updateData, token);
      await refetchAllData();
      toast.success('Task updated!');
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId, token);
      await refetchAllData();
      toast.info('Task moved to trash.');
    } catch (err) {
      toast.error('Failed to move task to trash.');
    }
  };

  const restoreTask = async (taskId) => {
    try {
      await taskService.updateTask(taskId, { isDeleted: false }, token);
      await refetchAllData();
      toast.success('Task restored successfully!');
    } catch (err) {
      toast.error('Failed to restore task.');
    }
  };

  const value = {
    tasks, starredTasks, completedTasks, trashTasks, notifications, // <-- Expose notifications
    loading, error, addTask, updateTask, deleteTask, restoreTask, refetchTasks: refetchAllData,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;