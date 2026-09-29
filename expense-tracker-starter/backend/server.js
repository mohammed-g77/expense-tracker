// Expense Tracker - backend (Express API + PostgreSQL)
//
// PHASE 1
// Setup:
//   1. Create a database named expense_tracker and run schema.sql on it.
//   2. Copy .env.example to a new file named .env and write your PostgreSQL password.
//   3. npm install express cors pg dotenv
// Run:    node server.js   (restart it every time you change this file)
//
// Endpoints you need to build:
//   GET    /api/expenses        return all expenses
//   GET    /api/expenses/:id    return one expense (404 if not found)
//   POST   /api/expenses        add an expense (201, or 400 if the data is invalid)
//   PUT    /api/expenses/:id    update an expense (200, 400, or 404)
//   DELETE /api/expenses/:id    delete an expense (200, or 404)
//
// Tips:
//   - Create one Pool (from the "pg" library) with the values from .env,
//     and use pool.query(...) in every route.
//   - ALWAYS send the values as parameters: pool.query("... WHERE id = $1", [id]).
//     NEVER build the SQL text by joining strings with data from the user.
//   - Use RETURNING to get the new (or updated) row back from INSERT and UPDATE.
//   - The database creates the id. The client never sends one.
//   - pg returns NUMERIC as text and DATE as a JavaScript Date, so fix both in your SELECT.
//     Hint: amount::float8 and to_char(date, 'YYYY-MM-DD').
//   - Validate the data before the query, and answer 400 with a message that explains the problem.
//   - Check the id before the query. A text like "abc" makes PostgreSQL throw an error.
//   - Enable CORS so the frontend can talk to the server.
//   - Test every endpoint with Thunder Client BEFORE you connect the frontend.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const allowedCategories = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Other'
];

function validateExpense(data) {
  const { title, amount, category, date } = data;

  if (
    typeof title !== 'string' ||
    title.trim() === ''
  ) {
    return 'Title is required';
  }

  if (
    amount === undefined ||
    amount === null ||
    amount === '' ||
    typeof amount === 'boolean' ||
    Number.isNaN(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return 'Amount must be a number greater than 0';
  }

  if (!allowedCategories.includes(category)) {
    return 'Invalid category';
  }

  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return 'Date must be in YYYY-MM-DD format';
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return null;
}

function validateId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

const expenseSelect = `
  SELECT
    id,
    title,
    amount::float8 AS amount,
    category,
    to_char(date, 'YYYY-MM-DD') AS date
  FROM expenses
`;


/*
  GET /api/expenses

  Returns all expenses.
*/
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      `${expenseSelect} ORDER BY date DESC, id DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


/*
  GET /api/expenses/:id

  Returns one expense.
*/
app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (!validateId(id)) {
    return res.status(404).json({
      error: 'Expense not found'
    });
  }

  try {
    const result = await pool.query(
      `${expenseSelect} WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


/*
  POST /api/expenses

  Adds a new expense.
*/
app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  const validationError = validateExpense(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  try {
    const query = `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const values = [
      title.trim(),
      Number(amount),
      category,
      date
    ];

    const result = await pool.query(query, values);

    const newExpense = await pool.query(
      `${expenseSelect} WHERE id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


/*
  PUT /api/expenses/:id

  Updates an existing expense.
*/
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  if (!validateId(id)) {
    return res.status(404).json({
      error: 'Expense not found'
    });
  }

  const validationError = validateExpense(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  try {
    const query = `
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        date = $4
      WHERE id = $5
      RETURNING id
    `;

    const values = [
      title.trim(),
      Number(amount),
      category,
      date,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }

    const updatedExpense = await pool.query(
      `${expenseSelect} WHERE id = $1`,
      [id]
    );

    res.status(200).json(updatedExpense.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


/*
  DELETE /api/expenses/:id

  Deletes an existing expense.
*/
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (!validateId(id)) {
    return res.status(404).json({
      error: 'Expense not found'
    });
  }

  try {
    const query = `
      DELETE FROM expenses
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Expense not found'
      });
    }

    res.status(200).json({
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});