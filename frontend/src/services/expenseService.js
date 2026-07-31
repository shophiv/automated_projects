import axios from 'axios';

const API_URL = 'http://localhost:5000/api/expenses';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getExpenses = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data.data;
};

const createExpense = async (expenseData) => {
  const response = await axios.post(API_URL, expenseData, getAuthHeader());
  return response.data.data;
};

const updateExpense = async (id, expenseData) => {
  const response = await axios.put(`${API_URL}/${id}`, expenseData, getAuthHeader());
  return response.data.data;
};

const deleteExpense = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

const expenseService = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};

export default expenseService;