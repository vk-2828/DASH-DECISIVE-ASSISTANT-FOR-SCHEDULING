import axios from 'axios';

const API_URL = 'http://localhost:4000/api/tasks';

// This function creates a configured axios instance that includes the user's token
const getApiClient = (token) => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return api;
};

// --- API Functions ---

const getAllTasks = (token) => {
  const api = getApiClient(token);
  return api.get('/');
};

const createTask = (taskData, token) => {
  const api = getApiClient(token);
  return api.post('/', taskData);
};

// --- NEW: Function to update any part of a task ---
const updateTask = (taskId, updateData, token) => {
  const api = getApiClient(token);
  return api.put(`/${taskId}`, updateData);
};

// --- NEW: Function to "soft delete" a task ---
const deleteTask = (taskId, token) => {
  const api = getApiClient(token);
  return api.delete(`/${taskId}`);
};


const getStarredTasks = (token) => {
  const api = getApiClient(token);
  return api.get('/starred');
};

const getCompletedTasks = (token) => {
  const api = getApiClient(token);
  return api.get('/completed');
};

const getDeletedTasks = (token) => {
  const api = getApiClient(token);
  return api.get('/deleted');
};


const taskService = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getStarredTasks,
  getCompletedTasks,
  getDeletedTasks,
};

export default taskService;