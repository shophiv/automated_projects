import axios from 'axios';

const API_BASE_URL = '/api';

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

export const registerUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
  return response.data;
};

export const logoutUser = async (token) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};