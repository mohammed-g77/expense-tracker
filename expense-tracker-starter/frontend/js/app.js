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

const loadingSpinner = document.getElementById('loading-spinner');
const alertContainer = document.getElementById('alert-container');

const editForm = document.getElementById('edit-expense-form');

let allExpenses = [];
let editingExpenseId = null;

 //  Spinner
function showSpinner() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('d-none');
    }
}

function hideSpinner() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('d-none');
    }
}

//   Alerts
function showAlert(message, type = 'danger') {
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${escapeHtml(message)}
            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>
        </div>
    `;
}

//   GET Expenses 
async function getExpenses() {

    const response = await fetch(API_URL);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || 'Failed to load expenses'
        );
    }

    return data;
}


//   Refresh
async function refresh() {
    showSpinner();
    try {
        allExpenses = await getExpenses();
        applyFilter();
    } catch (error) {
        console.error(error);

        showAlert(
            'Unable to connect to the server. Make sure the backend is running.',
            'danger'
        );
    } finally {
        hideSpinner();
    }
}


//   Render App
function renderApp(expenses) {

    renderTable(expenses);

    // Summary always uses ALL expenses
    renderSummary(allExpenses);
}


//   Render Table
function renderTable(expenses) {
    tableBody.innerHTML = '';
    if (expenses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted py-4">
                    No expenses recorded.
                </td>
            </tr>
        `;
        return;
    }

    expenses.forEach(expense => {
        let badgeClass = 'bg-secondary';

        if (expense.category === 'Food') {
            badgeClass = 'bg-success';

        } else if (expense.category === 'Transport') {
            badgeClass = 'bg-primary';

        } else if (expense.category === 'Bills') {
            badgeClass = 'bg-warning text-dark';

        } else if (expense.category === 'Entertainment') {
            badgeClass = 'bg-danger';

        } else if (expense.category === 'Other') {
            badgeClass = 'bg-secondary';
        }

        const row = document.createElement('tr');

        row.innerHTML = `

            <td class="fw-semibold">
                ${escapeHtml(expense.title)}
            </td>

            <td>
                ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                <span class="badge ${badgeClass}">
                    ${escapeHtml(expense.category)}
                </span>
            </td>

            <td>
                ${escapeHtml(expense.date)}
            </td>

            <td class="text-end">
                <button
                    class="btn btn-sm btn-outline-primary me-1"
                    onclick="openEditModal(${expense.id})">
                    Edit
                </button>

                <button
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>

            </td>
        `;
        tableBody.appendChild(row);
    });
}

//   Render Summary
function renderSummary(expenses) {
    const count = expenses.length;
    countElement.textContent = count;

    if (count === 0) {
        totalElement.textContent = '0.00';
        highestAmountElement.textContent = '0.00';
        highestTitleElement.textContent = '-';

        return;
    }

    const total = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount),
        0
    );

    totalElement.textContent =
        total.toFixed(2);

    let highest = expenses[0];

    expenses.forEach(expense => {
        if (
            Number(expense.amount) >
            Number(highest.amount)
        ) {
            highest = expense;
        }
    });

    highestAmountElement.textContent =
        Number(highest.amount).toFixed(2);

    highestTitleElement.textContent =
        highest.title;
}

  // Filter
function applyFilter() {

    const selectedCategory =
        filterCategory.value;

    if (selectedCategory === 'All') {
        renderApp(allExpenses);
        return;
    }

    const filteredExpenses =
        allExpenses.filter(
            expense =>
                expense.category === selectedCategory
        );
    renderApp(filteredExpenses);
}

filterCategory.addEventListener(
    'change',
    applyFilter
);

  // ADD Expense
form.addEventListener(
    'submit',
    async event => {
        event.preventDefault();
        const titleInput =
            document.getElementById('expense-title');
        const amountInput =
            document.getElementById('expense-amount');
        const categoryInput =
            document.getElementById('expense-category');
        const dateInput =
            document.getElementById('expense-date');
        let isValid = true;

        titleInput.classList.remove('is-invalid');
        amountInput.classList.remove('is-invalid');
        categoryInput.classList.remove('is-invalid');
        dateInput.classList.remove('is-invalid');

        if (!titleInput.value.trim() || titleInput.value.trim().length > 100) {

            titleInput.classList.add('is-invalid');

            isValid = false;
        }

        const amount =
            Number(amountInput.value);
        if (
            !amountInput.value ||
            !Number.isFinite(amount) ||
            amount < 0.01 ||
            amount > 99999999.99
        ) {
            amountInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!categoryInput.value) {
            categoryInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!dateInput.value) {
            dateInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            showAlert(
                'Please fix the invalid fields.',
                'warning'
            );
            return;
        }

        const expenseData = {
            title:
                titleInput.value.trim(),
            amount:
                amount,
            category:
                categoryInput.value,
            date:
                dateInput.value
        };
        showSpinner();

        try {
            const response =
                await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type':
                            'application/json'
                    },
                    body:
                        JSON.stringify(expenseData)
                });

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    'Failed to add expense'
                );
            }
            form.reset();

            showAlert(
                'Expense added successfully.',
                'success'
            );

            await refresh();

        } catch (error) {
            console.error(error);
            showAlert(
                error.message ||
                'Failed to add expense.',
                'danger'
            );

        } finally {
            hideSpinner();
        }
    }
);

   // DELETE Expense
async function deleteExpense(id) {
    const confirmed =
        confirm(
            'Are you sure you want to delete this expense?'
        );

    if (!confirmed) {
        return;
    }
    
    showSpinner();
    try {
        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: 'DELETE'
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                'Failed to delete expense'
            );
        }
        showAlert(
            'Expense deleted successfully.',
            'success'
        );
        await refresh();

    } catch (error) {
        console.error(error);
        showAlert(
            error.message ||
            'Failed to delete expense.',
            'danger'
        );
    } finally {
        hideSpinner();
    }
}

  // OPEN EDIT MODAL
function openEditModal(id) {
    const expense =
        allExpenses.find(
            item => item.id === id
        );

    if (!expense) {
        showAlert(
            'Expense not found.',
            'danger'
        );
        return;
    }
    editingExpenseId = id;

    document.getElementById(
        'edit-expense-title'
    ).value = expense.title;

    document.getElementById(
        'edit-expense-amount'
    ).value = expense.amount;

    document.getElementById(
        'edit-expense-category'
    ).value = expense.category;

    document.getElementById(
        'edit-expense-date'
    ).value = expense.date;

    const modalElement =
        document.getElementById(
            'editExpenseModal'
        );

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );
    modal.show();
}

   // UPDATE Expense
editForm.addEventListener(
    'submit',
    async event => {
        event.preventDefault();

        const titleInput =
            document.getElementById(
                'edit-expense-title'
            );
        const amountInput =
            document.getElementById(
                'edit-expense-amount'
            );
        const categoryInput =
            document.getElementById(
                'edit-expense-category'
            );
        const dateInput =
            document.getElementById(
                'edit-expense-date'
            );

        let isValid = true;

        titleInput.classList.remove('is-invalid');
        amountInput.classList.remove('is-invalid');
        categoryInput.classList.remove('is-invalid');
        dateInput.classList.remove('is-invalid');

        if (!titleInput.value.trim() || titleInput.value.trim().length > 100) {
            titleInput.classList.add('is-invalid');
            isValid = false;
        }
        const amount =
            Number(amountInput.value);

        if (
            !amountInput.value ||
            !Number.isFinite(amount) ||
            amount < 0.01 ||
            amount > 99999999.99
        ) {
            amountInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!categoryInput.value) {
            categoryInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!dateInput.value) {
            dateInput.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            showAlert(
                'Please fix the invalid fields.',
                'warning'
            );
            return;
        }
        const updatedExpense = {
            title:
                titleInput.value.trim(),
            amount:
                amount,
            category:
                categoryInput.value,
            date:
                dateInput.value
        };
        showSpinner();

        try {
            const response =
                await fetch(
                    `${API_URL}/${editingExpenseId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type':
                                'application/json'
                        },
                        body:
                            JSON.stringify(
                                updatedExpense
                            )
                    }
                );
            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    'Failed to update expense'
                );
            }
            const modalElement =
                document.getElementById(
                    'editExpenseModal'
                );
            const modal =
                bootstrap.Modal.getInstance(
                    modalElement
                );
            modal.hide();

            showAlert(
                'Expense updated successfully.',
                'success'
            );

            await refresh();
        } catch (error) {
            console.error(error);
            showAlert(
                error.message ||
                'Failed to update expense.',
                'danger'
            );
        } finally {
            hideSpinner();
        }
    }
);
// Escape HTML
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

 //  START
refresh();