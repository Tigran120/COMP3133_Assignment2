# COMP3133 Assignment 1 – Employee Management (GraphQL API)

Node + Express + Apollo + MongoDB. GraphQL API for users and employees.

**Repo:** COMP3133_101498001_Assignment1  
**DB name:** `comp3133_101498001_Assigment1`

## Run it

```bash
npm install
npm start
```

Add a `.env` with your MongoDB URL (see `.env.example`). If you use Atlas, put your connection string in `MONGODB_URI`.

Then open **http://localhost:4000/graphql** and use GraphiQL to run queries and mutations.

## What’s in the API

- **signup** / **login** – user account
- **getAllEmployees** – list everyone
- **addEmployee** / **updateEmployee** / **deleteEmployee** – CRUD by employee id
- **getEmployeeByEid** – one employee by id
- **getEmployeesByDesignationOrDepartment** – filter by job or department

Photos: `POST /api/upload` with a file, then use the returned URL in `addEmployee` or `updateEmployee` as `employee_photo`. Needs Cloudinary env vars; without them you can still add employees, just no photo.

## Test login

Create a user with **signup**, then use the same username/email and password in **login**. See `SAMPLE_DATA_TO_ENTER.md` for copy-paste examples.

## Stack

Node, Express, Apollo Server, MongoDB (Mongoose), bcryptjs, JWT, express-validator, Cloudinary + Multer for uploads.
