import axios from 'axios';

const API_URL = 'https://dash-decisive-assistant-for-scheduling.onrender.com/api/notifications';

const getApiClient = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getNotifications = (token) => {
  const api = getApiClient(token);
  return api.get('/');
};

const notificationService = {
  getNotifications,
};

export default notificationService;