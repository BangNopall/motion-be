# MOTION Backend (MOTION 2023)

This project is the backend API for MOTION 2023, built with Node.js, Express.js, and Supabase. It manages student organization data, including members, reports (rapor), activities, and ministries (kementerian).

## Project Overview

- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** External auth service integration with local user validation in Supabase.
- **File Storage:** Supabase Storage (bucket: `motion24_bucket`) for user photos.
- **Architecture:** Standard MVC-like structure:
  - `controllers/`: Handles request/response logic.
  - `models/`: Manages database interactions via Supabase client.
  - `routers/`: Defines API endpoints and middleware (e.g., `multer`).
  - `constants/`: Configuration, JWT settings, and standard result formats.
  - `supabase/`: Contains SQL migrations and seeds.

## Building and Running

### Prerequisites

- Node.js (v18+ recommended for `--watch` and `node:test`)
- npm or yarn

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    Create a `.env` file in the root directory and populate it with:
    ```env
    PORT=5000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    EXTERNAL_AUTH_URL=https://rest-api.bemfilkomub.cloud/auth
    ```

### Development

- **Run in development mode (with watch):**
  ```bash
  npm run server
  ```
- **Run in production mode:**
  ```bash
  npm start
  ```
- **Run tests:**
  ```bash
  npm test
  ```

## Development Conventions

### Code Style

- Use `async/await` for asynchronous operations.
- Controllers should use the standard success/error helpers:
  ```javascript
  const { success, error } = require("../constants/result");
  // success(res, data) or error(res, message)
  ```
- Models should return a status object:
  ```javascript
  return { status: "ok", data };
  // or
  return { status: "err", msg: error };
  ```

### Database naming

- Most tables are prefixed with `motion24_` (e.g., `motion24_anggotaBEM`, `motion24_kegiatan`).
- Use the `supabase` client exported from `constants/config.js`.

### Testing

- Tests are located in the `tests/` directory.
- Use the built-in `node:test` runner.
- Mocking is handled via a custom `loadWithMocks` utility in `tests/models.test.js` to isolate units from Supabase and external APIs.

### API Endpoints

- `/users`: Member management and authentication.
- `/aspek`, `/rapor`: Reporting and assessment data.
- `/kementerian`, `/jabatan`: Organizational structure.
- `/proker`, `/kegiatan`: Program and activity tracking.
- `/bestStaff`: Recognition system.
