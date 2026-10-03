# Expense Tracker

A full-stack expense tracker with a Bootstrap interface, an Express REST API, and PostgreSQL persistence. Expenses can be created, viewed, edited, deleted, filtered by category, searched by title, filtered by month, exported as CSV, and summarized.

## GitHub Repository
https://github.com/mohammed-g77/expense-tracker

## Requirements

- Node.js and npm
- PostgreSQL, with `psql` available on your command line

## Database setup

From the project root, create the database:

```sh
psql -U postgres -c "CREATE DATABASE expense_tracker;"
```

Load the schema and sample rows:

```sh
psql -U postgres -d expense_tracker -f backend/schema.sql
```

Create `backend/.env` with the connection settings for your local PostgreSQL installation.

Example:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
```

Change the values if your local PostgreSQL configuration is different.

The `.env` file is ignored by Git and should not be committed.

## Run the app

1. Open a terminal in the project root and start the API:

```sh
cd backend
npm install
npm start
```

2. Open `frontend/index.html` in a browser.

3. Keep the API terminal running.

The frontend requests:

```text
http://localhost:3000/api/expenses
```

## API checks with Thunder Client

With the backend running, send requests to:

```text
http://localhost:3000/api/expenses
```

Available operations:

- `GET` the base URL to list expenses.
- `GET` the base URL followed by an existing ID to retrieve one expense.
- `POST` the base URL with JSON:

```json
{
  "title": "Lunch",
  "amount": 4.5,
  "category": "Food",
  "date": "2026-01-15"
}
```

- `PUT` the base URL followed by an existing ID with updated values.
- `DELETE` the base URL followed by the ID.

The API accepts these categories:

- `Food`
- `Transport`
- `Bills`
- `Entertainment`
- `Other`

## Feature status

### Required features

- [x] Add an expense with client-side and API validation
- [x] View expenses
- [x] Delete expenses
- [x] Edit expenses
- [x] Filter by category
- [x] Summary cards for total, count, and highest expense
- [x] Persist expenses in PostgreSQL
- [x] Bootstrap spinner during requests
- [x] Bootstrap alerts for errors and successful operations
- [x] Responsive interface

### Bonus features

- [x] Search expenses by title
- [x] Filter expenses by month
- [x] Export expenses as a CSV file

The feature list describes the checked-in implementation. Database-backed runtime behavior still depends on the local PostgreSQL setup and should be verified with the API checks above.

## Screenshots

### Main Expense Tracker

![Expense Tracker](screenshots/expense-tracker.png)

### Edit Expense

![Edit Expense](screenshots/edit-expense.png)

## Hardest Problem I Faced and How I Solved It

The hardest problem was keeping the summary cards accurate while filtering the table. I kept the full API response in `allExpenses`, filtered only the rows shown in the table, and calculated the summaries from the full list.

I also made sure that after every successful add, edit, or delete operation, the page fetches the expense list again from the server. This keeps the interface synchronized with the data actually saved in PostgreSQL.

## Project Structure

```text
Expense-Tracker/
├── backend/
│   ├── .env
│   ├── schema.sql
│   ├── package.json
│   └── server files
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── screenshots/
│   ├── expense-tracker.png
│   └── edit-expense.png
└── README.md
```

Do not commit `backend/.env` or `node_modules/`.
