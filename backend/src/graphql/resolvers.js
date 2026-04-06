const { GraphQLError } = require('graphql');
const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('../utils/authContext');
const {
  runValidation,
  signupValidations,
  loginValidations,
  addEmployeeValidations,
  updateEmployeeValidations,
} = require('../utils/validators');

const signToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

const requireAuth = (ctx) => {
  if (!ctx?.userId) {
    throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  }
};

const formatUser = (u) =>
  u
    ? {
        _id: u._id.toString(),
        username: u.username,
        email: u.email,
        created_at: u.created_at?.toISOString?.() || u.created_at,
        updated_at: u.updated_at?.toISOString?.() || u.updated_at,
      }
    : null;

const formatEmployee = (e) =>
  e
    ? {
        _id: e._id.toString(),
        first_name: e.first_name,
        last_name: e.last_name,
        email: e.email,
        gender: e.gender,
        designation: e.designation,
        salary: e.salary,
        date_of_joining: e.date_of_joining?.toISOString?.() || e.date_of_joining,
        department: e.department,
        employee_photo: e.employee_photo || null,
        created_at: e.created_at?.toISOString?.() || e.created_at,
        updated_at: e.updated_at?.toISOString?.() || e.updated_at,
      }
    : null;

const resolvers = {
  Query: {
    async login(_, { input }) {
      const { errors, data } = await runValidation(loginValidations)(input);
      if (errors) {
        return {
          success: false,
          message: errors.map((e) => e.msg).join('; '),
          token: null,
          user: null,
        };
      }
      const isEmail = data.usernameOrEmail.includes('@');
      const user = await User.findOne(
        isEmail ? { email: data.usernameOrEmail } : { username: data.usernameOrEmail }
      );
      if (!user) {
        return { success: false, message: 'Invalid username/email or password', token: null, user: null };
      }
      const match = await user.comparePassword(data.password);
      if (!match) {
        return { success: false, message: 'Invalid username/email or password', token: null, user: null };
      }
      const token = signToken(user._id);
      return {
        success: true,
        message: 'Login successful',
        token,
        user: formatUser(user),
      };
    },

    async getAllEmployees(_, __, ctx) {
      requireAuth(ctx);
      try {
        const employees = await Employee.find().sort({ created_at: -1 });
        return {
          success: true,
          message: 'Employees retrieved successfully',
          employees: employees.map(formatEmployee),
          count: employees.length,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Failed to fetch employees',
          employees: [],
          count: 0,
        };
      }
    },

    async getEmployeeByEid(_, { eid }, ctx) {
      requireAuth(ctx);
      if (!mongoose.Types.ObjectId.isValid(eid)) {
        return { success: false, message: 'Invalid employee ID', employee: null };
      }
      const employee = await Employee.findById(eid);
      if (!employee) {
        return { success: false, message: 'Employee not found', employee: null };
      }
      return {
        success: true,
        message: 'Employee retrieved successfully',
        employee: formatEmployee(employee),
      };
    },

    async getEmployeesByDesignationOrDepartment(_, { designation, department }, ctx) {
      requireAuth(ctx);
      if (!designation && !department) {
        return {
          success: false,
          message: 'Provide at least designation or department',
          employees: [],
          count: 0,
        };
      }
      const parts = [];
      if (designation) parts.push({ designation: new RegExp(designation, 'i') });
      if (department) parts.push({ department: new RegExp(department, 'i') });
      const filter = parts.length === 1 ? parts[0] : { $or: parts };
      try {
        const employees = await Employee.find(filter).sort({ created_at: -1 });
        return {
          success: true,
          message: 'Employees retrieved successfully',
          employees: employees.map(formatEmployee),
          count: employees.length,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Failed to fetch employees',
          employees: [],
          count: 0,
        };
      }
    },
  },

  Mutation: {
    async signup(_, { input }) {
      const { errors, data } = await runValidation(signupValidations)(input);
      if (errors) {
        return {
          success: false,
          message: errors.map((e) => e.msg).join('; '),
          token: null,
          user: null,
        };
      }
      const existing = await User.findOne({
        $or: [{ username: data.username }, { email: data.email }],
      });
      if (existing) {
        return {
          success: false,
          message: existing.username === data.username ? 'Username already taken' : 'Email already registered',
          token: null,
          user: null,
        };
      }
      const user = await User.create({ username: data.username, email: data.email, password: data.password });
      const token = signToken(user._id);
      return {
        success: true,
        message: 'Account created successfully',
        token,
        user: formatUser(user),
      };
    },

    async addEmployee(_, { input }, ctx) {
      requireAuth(ctx);
      const { errors, data } = await runValidation(addEmployeeValidations)(input);
      if (errors) {
        return { success: false, message: errors.map((e) => e.msg).join('; '), employee: null };
      }
      const existing = await Employee.findOne({ email: data.email });
      if (existing) {
        return { success: false, message: 'Employee with this email already exists', employee: null };
      }
      const payload = {
        ...data,
        date_of_joining: new Date(data.date_of_joining),
        employee_photo: data.employee_photo || null,
      };
      const employee = await Employee.create(payload);
      return {
        success: true,
        message: 'Employee added successfully',
        employee: formatEmployee(employee),
      };
    },

    async updateEmployee(_, { eid, input }, ctx) {
      requireAuth(ctx);
      if (!mongoose.Types.ObjectId.isValid(eid)) {
        return { success: false, message: 'Invalid employee ID', employee: null };
      }
      const hasInput = input && Object.keys(input).length > 0;
      if (hasInput) {
        const { errors } = await runValidation(updateEmployeeValidations)(input);
        if (errors && errors.length > 0) {
          return { success: false, message: errors.map((e) => e.msg).join('; '), employee: null };
        }
      }
      const employee = await Employee.findById(eid);
      if (!employee) {
        return { success: false, message: 'Employee not found', employee: null };
      }
      const updates = { ...input };
      if (updates.date_of_joining) updates.date_of_joining = new Date(updates.date_of_joining);
      Object.assign(employee, updates);
      await employee.save();
      return {
        success: true,
        message: 'Employee updated successfully',
        employee: formatEmployee(employee),
      };
    },

    async deleteEmployee(_, { eid }, ctx) {
      requireAuth(ctx);
      if (!mongoose.Types.ObjectId.isValid(eid)) {
        return { success: false, message: 'Invalid employee ID' };
      }
      const result = await Employee.findByIdAndDelete(eid);
      if (!result) {
        return { success: false, message: 'Employee not found' };
      }
      return { success: true, message: 'Employee deleted successfully' };
    },
  },
};

module.exports = resolvers;
