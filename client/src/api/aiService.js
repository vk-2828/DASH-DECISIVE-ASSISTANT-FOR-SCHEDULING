import axios from 'axios';

const API_URL = 'http://localhost:4000/api/ai';

// Helper function to create an axios instance with the auth token
const getApiClient = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found for AI service request.');
    return axios.create({ baseURL: API_URL });
  }
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// --- THIS IS THE NEW UNIFIED FUNCTION ---
// It calls the new '/command' endpoint for all AI interactions
const sendAiCommand = async (textInput) => {
  const api = getApiClient();
  const response = await api.post('/command', { textInput });
  return response.data; // Return the full response (e.g., { message: "..." } or { task: {...} })
};

// --- We also keep the 'askAI' function for now, but point it to the new command ---
// This ensures our old chat component doesn't break before we update it
const askAI = async (question) => {
  const api = getApiClient();
  const response = await api.post('/ask', { question });
  return response.data;
}


const aiService = {
  sendAiCommand,
  askAI // We still export this for the help assistant
};

export default aiService;









// import axios from 'axios';

// // The base URL for our AI backend routes
// const API_URL = 'http://localhost:4000/api/ai';

// // Helper function to create an axios instance with the auth token
// const getApiClient = () => {
//   const token = localStorage.getItem('token'); // Get token from storage
//   if (!token) {
//     console.error('No token found for AI service request.');
//     // In a real app, you might trigger a logout or redirect here
//     return axios.create({ baseURL: API_URL }); // Return basic instance to avoid crash
//   }
//   return axios.create({
//     baseURL: API_URL,
//     headers: {
//       Authorization: `Bearer ${token}`, // Include the token in the header
//     },
//   });
// };

// // --- API Functions ---

// // 1. Function to ask the AI assistant a question
// const askAI = async (question) => {
//   const api = getApiClient();
//   // Make a POST request to the '/ask' endpoint
//   const response = await api.post('/ask', { question });
//   return response.data; // Return the response data (which should contain the 'answer')
// };

// // 2. Function to create a task from natural language text
// const createTaskFromText = async (textInput) => {
//   const api = getApiClient();
//   // Make a POST request to the '/create-task-text' endpoint
//   const response = await api.post('/create-task-text', { textInput });
//   return response.data; // Return the response data (message and the new 'task' object)
// };

// // Bundle functions for export
// const aiService = {
//   askAI,
//   createTaskFromText,
// };

// export default aiService;






