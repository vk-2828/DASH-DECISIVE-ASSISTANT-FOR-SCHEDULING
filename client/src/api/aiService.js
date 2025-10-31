import axios from 'axios';

// The base URL for our AI backend routes
const API_URL = 'http://localhost:4000/api/ai';

// Helper function to create an axios instance with the auth token
const getApiClient = () => {
  const token = localStorage.getItem('token'); // Get token from storage
  if (!token) {
    console.error('No token found for AI service request.');
    // In a real app, you might trigger a logout or redirect here
    return axios.create({ baseURL: API_URL }); // Return basic instance to avoid crash
  }
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the header
    },
  });
};

// --- API Functions ---

// 1. Function to ask the AI assistant a question
const askAI = async (question) => {
  const api = getApiClient();
  // Make a POST request to the '/ask' endpoint
  const response = await api.post('/ask', { question });
  return response.data; // Return the response data (which should contain the 'answer')
};

// 2. Function to create a task from natural language text
const createTaskFromText = async (textInput) => {
  const api = getApiClient();
  // Make a POST request to the '/create-task-text' endpoint
  const response = await api.post('/create-task-text', { textInput });
  return response.data; // Return the response data (message and the new 'task' object)
};

// Bundle functions for export
const aiService = {
  askAI,
  createTaskFromText,
};

export default aiService;






