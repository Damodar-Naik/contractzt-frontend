# Production preview link

https://contractzy.damodarnaik.online/

# Contractzy Frontend

Angular 19 frontend for evaluating a contract workflow application with role-based access, status transitions, audit history, and change comparison.

## What This Project Covers

- Login with seeded evaluation accounts
- Role-based access for `admin`, `bu`, and `viewer`
- Contract listing with search and pagination
- Contract creation for permitted roles
- Contract detail view with:
  - status badges
  - status transitions
  - inline description editing in allowed states
  - audit history
  - audit diff comparison modal for updated contracts

## Tech Stack

- Angular 19
- Standalone components
- Tailwind CSS
- RxJS
- Monaco Diff Editor via `monaco-editor` and `ngx-monaco-editor-v2`

## Prerequisites

Make sure the following are available before running the app:

- Node.js 20+ recommended
- npm 10+ recommended
- The backend API running locally at `http://localhost:3000/api`

This frontend reads its API base URL from [environment.ts]

Current value:

```ts
apiUrl: 'http://localhost:3000/api'
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Angular dev server:

```bash
npm start
```

3. Open the app:

```text
http://localhost:4200
```

## Build

To create a production build:

```bash
npm run build
```

Build output is generated in:

```text
dist/frontend
```

## Evaluation Accounts

The login screen includes seeded test accounts. Use the following:

- `admin@contractzy.com`
- `bu@contractzy.com`
- `viewer@contractzy.com`

Universal password:

```text
Password123!
```

## Suggested Evaluation Flow

### 1. Authentication and Routing

- Open the app at `http://localhost:4200`
- Unauthenticated users should be redirected to `/auth/login`
- After login, users land on `/contracts`

### 2. Role-Based Access

Use each account to verify behavior differences:

- `admin`
  - can view contracts
  - can create contracts
  - can edit contract description in `draft` and `pending_review`
  - can approve or reject contracts in `pending_review`
- `bu`
  - can view contracts
  - can create contracts
  - can edit contract description in `draft` and `pending_review`
  - can submit drafts for review
  - can approve or reject contracts in `pending_review`
- `viewer`
  - can view contracts
  - cannot create contracts
  - cannot edit contracts
  - cannot review contracts

### 3. Contract List

Verify the contracts list page supports:

- status color coding
- search by title
- pagination
- role-based action buttons

### 4. Contract Detail

Open a contract and verify:

- status badge matches the current state
- audit history is visible
- description can be edited only when the contract is in:
  - `draft`
  - `pending_review`

### 5. Audit Diff Comparison

For audit entries with action `CONTRACT_UPDATED`:

- click `Compare Changes`
- a modal should open
- the left side shows the previous value
- the right side shows the updated value
- values are presented as human-readable text, not raw JSON

## Important App Behaviors

### Auth Persistence

- Access token and refresh token are stored in `localStorage`
- User information is also stored in `localStorage`
- Requests automatically attach the bearer token
- On `401`, the app attempts token refresh before logging the user out

### Editable Contract Rule

The UI matches the backend rule:

- only `admin` and `bu` can edit
- only contracts in `draft` or `pending_review` can be edited

### Audit Diff Rendering

The comparison modal uses Monaco Diff Editor.
Single-field audit payloads such as description updates are intentionally shown as plain text for non-technical evaluators rather than raw JSON objects.

## Project Scripts

- `npm start` - runs the development server
- `npm run build` - creates a production build
- `npm run watch` - rebuilds in watch mode
- `npm test` - runs unit tests