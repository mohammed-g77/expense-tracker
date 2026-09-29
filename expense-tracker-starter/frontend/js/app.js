// Expense Tracker - frontend logic

// PHASE 2
// Your backend from Phase 1 is already running, with real expenses in the
// database (from schema.sql). Build this page directly against it with
// fetch and async/await - there is no in-memory or localStorage stage
// this time, and no sample data file.
//
// A possible structure (change it if you have a better idea):
//   - async function getExpenses()          fetch(API_URL), return the JSON
//   - async function addExpense(data)       fetch(API_URL, { method: "POST", ... })
//   - async function updateExpense(id,data) fetch(API_URL + "/" + id, { method: "PUT", ... })
//   - async function deleteExpense(id)      fetch(API_URL + "/" + id, { method: "DELETE" })
//   - async function refresh()              get the list, then call renderTable and renderSummary
//   - renderTable(list)                     build the table rows from the array the API returned
//   - renderSummary(list)                   update the summary cards
//   - applyFilter()                         re-render with the list filtered by category
//
// Don't forget:
//   - Show a Bootstrap spinner while a request is in flight.
//   - Wrap every fetch call in try/catch, and show a Bootstrap alert on failure.
//   - After add, edit, or delete, call refresh() so the page always shows
//     what the server actually saved - never update the table by hand.
//   - The API is at http://localhost:3000/api/expenses (see the Roadmap).

const API_URL = 'http://localhost:3000/api/expenses';

const tableBody = document.getElementById('expenses-table-body');
const totalElement = document.getElementById('summary-total');
const countElement = document.getElementById('summary-count');
const highestAmountElement = document.getElementById('summary-highest-amount');
const highestTitleElement = document.getElementById('summary-highest-title');
const form = document.getElementById('add-expense-form');
const filterCategory = document.getElementById('filter-category');

let allExpenses = [];

async function loadExpenses() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch data from server');
    
    allExpenses = await response.json();
    renderApp(allExpenses);
  } catch (error) {
    console.error(error);
  }
}

function renderApp(expenses) {
  renderTable(expenses);
  renderSummary(expenses);
}

function renderTable(expenses) {
  tableBody.innerHTML = '';

  if (expenses.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No expenses recorded.</td></tr>`;
    return;
  }

  expenses.forEach(expense => {
    const formattedDate = expense.date ? expense.date.split('T')[0] : '';
    
    let badgeClass = 'bg-secondary';
    if (expense.category === 'Food') badgeClass = 'bg-success';
    else if (expense.category === 'Transport') badgeClass = 'bg-primary';
    else if (expense.category === 'Utilities') badgeClass = 'bg-warning text-dark';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="fw-semibold">${escapeHtml(expense.title)}</td>
      <td>${Number(expense.amount).toFixed(2)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(expense.category)}</span></td>
      <td>${formattedDate}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${expense.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderSummary(expenses) {
  const count = expenses.length;
  countElement.textContent = count;

  if (count === 0) {
    totalElement.textContent = '0.00';
    highestAmountElement.textContent = '0.00';
    highestTitleElement.textContent = '-';
    return;
  }

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  totalElement.textContent = total.toFixed(2);

  let highest = expenses[0];
  expenses.forEach(item => {
    if (Number(item.amount) > Number(highest.amount)) {
      highest = item;
    }
  });

  highestAmountElement.textContent = Number(highest.amount).toFixed(2);
  highestTitleElement.textContent = highest.title;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('expense-title');
  const amountInput = document.getElementById('expense-amount');
  const categoryInput = document.getElementById('expense-category');
  const dateInput = document.getElementById('expense-date');

  let isValid = true;

  if (!titleInput.value.trim()) {
    titleInput.classList.add('is-invalid');
    isValid = false;
  } else {
    titleInput.classList.remove('is-invalid');
  }

  const amountVal = parseFloat(amountInput.value);
  if (isNaN(amountVal) || amountVal <= 0) {
    amountInput.classList.add('is-invalid');
    isValid = false;
  } else {
    amountInput.classList.remove('is-invalid');
  }

  if (!categoryInput.value) {
    categoryInput.classList.add('is-invalid');
    isValid = false;
  } else {
    categoryInput.classList.remove('is-invalid');
  }

  if (!dateInput.value) {
    dateInput.classList.add('is-invalid');
    isValid = false;
  } else {
    dateInput.classList.remove('is-invalid');
  }

  if (!isValid) return;

  const newExpense = {
    title: titleInput.value.trim(),
    amount: amountVal,
    category: categoryInput.value,
    date: dateInput.value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    if (!response.ok) throw new Error('Failed to add expense');

    form.reset();
    loadExpenses();
  } catch (error) {
    console.error(error);
    alert('An error occurred while adding the expense');
  }
});

async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete expense');
    loadExpenses();
  } catch (error) {
    console.error(error);
    alert('An error occurred while deleting');
  }
}

filterCategory.addEventListener('change', (e) => {
  const selectedCategory = e.target.value;
  if (selectedCategory === 'All') {
    renderApp(allExpenses);
  } else {
    const filtered = allExpenses.filter(item => item.category === selectedCategory);
    renderTable(filtered);
    renderSummary(filtered);
  }
});

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

loadExpenses();