import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ExpenseItem from './ExpenseItem';

export default function ExpenseList({ expenses, setExpenses, categories }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses(expenses.map(exp => exp._id === updatedExpense._id ? updatedExpense : exp));
  };

  const handleExpenseDeleted = (deletedId) => {
    setExpenses(expenses.filter(exp => exp._id !== deletedId));
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description?.toLowerCase().includes(search.toLowerCase()) ||
                          exp.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          exp.amount.toString().includes(search);
    const matchesCategory = selectedCategory ? exp.category?._id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-900">Your Expenses</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No expenses found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredExpenses.map(expense => (
            <ExpenseItem
              key={expense._id}
              expense={expense}
              categories={categories}
              onExpenseUpdated={handleExpenseUpdated}
              onExpenseDeleted={handleExpenseDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}