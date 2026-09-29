# Expense Tracker

A full-stack expense tracker with a Bootstrap interface, an Express REST API, and PostgreSQL persistence. Expenses can be created, viewed, edited, deleted, filtered by category, and summarized.

## Requirements

- Node.js and npm
- PostgreSQL, with `psql` available on your command line

## Database setup

From the project root, create the database and load the schema and sample rows:

```sh
psql -U postgres -c "CREATE DATABASE expense_tracker;"
psql -U postgres -d expense_tracker -f backend/schema.sql
```

Create `backend/.env` with the connection settings for your local PostgreSQL installation. Change the username, password, host, or port if yours differ:

```dotenv
DB_USER=postgres
DB_HOST=localhost
DB_NAME=expense_tracker
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=3000
```

The `.env` file is ignored by Git and should not be committed.

## Run the app

1. Open a terminal in the project root and start the API:

   ```sh
   cd backend
   npm install
   npm start
   ```

2. Open `frontend/index.html` in a browser. Keep the API terminal running. The frontend requests `http://localhost:3000/api/expenses`.

## API checks with Thunder Client

With the backend running, send requests to `http://localhost:3000/api/expenses`:

- `GET` the base URL to list expenses.
- `GET` the base URL followed by an existing ID to retrieve one expense.
- `POST` the base URL with JSON: `{"title":"Lunch","amount":4.5,"category":"Food","date":"2026-01-15"}`.
- `PUT` the base URL followed by the new ID with the same JSON fields and updated values.
- `DELETE` the base URL followed by the ID.

The API accepts these categories: `Food`, `Transport`, `Bills`, `Entertainment`, and `Other`.

## Feature status

- [x] Add an expense with client-side and API validation
- [x] View and delete expenses
- [x] Edit expenses
- [x] Filter by category
- [x] Summary cards for total, count, and highest expense
- [x] Persist expenses in PostgreSQL

The feature list describes the checked-in implementation. Database-backed runtime behavior still depends on the local PostgreSQL setup and should be verified with the API checks above.
