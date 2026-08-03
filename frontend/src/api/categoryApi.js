import axios from 'axios';

const API_BASE_URL = '/api';

export const getCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/categories`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axios.post(`${API_BASE_URL}/categories`, categoryData);
  return response.data;
};