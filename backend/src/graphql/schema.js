const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: String!
    updated_at: String!
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    created_at: String!
    updated_at: String!
  }

  type AuthPayload {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type EmployeeListPayload {
    success: Boolean!
    message: String!
    employees: [Employee!]
    count: Int
  }

  type EmployeePayload {
    success: Boolean!
    message: String!
    employee: Employee
  }

  type MessagePayload {
    success: Boolean!
    message: String!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    usernameOrEmail: String!
    password: String!
  }

  input AddEmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
  }

  input UpdateEmployeeInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
    employee_photo: String
  }

  type Query {
    login(input: LoginInput!): AuthPayload!
    getAllEmployees: EmployeeListPayload!
    getEmployeeByEid(eid: ID!): EmployeePayload!
    getEmployeesByDesignationOrDepartment(designation: String, department: String): EmployeeListPayload!
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    addEmployee(input: AddEmployeeInput!): EmployeePayload!
    updateEmployee(eid: ID!, input: UpdateEmployeeInput!): EmployeePayload!
    deleteEmployee(eid: ID!): MessagePayload!
  }
`;

module.exports = typeDefs;
