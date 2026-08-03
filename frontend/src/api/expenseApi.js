import axios from 'axios';

const API_BASE_URL = '/api';

export const createExpense = async (expenseData) => {
  const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await axios.put(`${API_BASE_URL}/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/expenses/${id}`);
  return response.data;
};