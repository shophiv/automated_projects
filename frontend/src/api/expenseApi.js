import axios from 'axios';

const API_BASE_URL = '/api';

export const createExpense = async (expenseData) => {
  const response = await axios.post(`${API_BASE_URL}/expenses`, expenseData);
  return response.data;
};