import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { Employee } from '../models/employee.model';

const EMPLOYEE_FRAGMENT = gql`
  fragment EmployeeFields on Employee {
    _id
    first_name
    last_name
    email
    gender
    designation
    salary
    date_of_joining
    department
    employee_photo
  }
`;

const GET_ALL = gql`
  ${EMPLOYEE_FRAGMENT}
  query GetAllEmployees {
    getAllEmployees {
      success
      message
      count
      employees {
        ...EmployeeFields
      }
    }
  }
`;

const SEARCH = gql`
  ${EMPLOYEE_FRAGMENT}
  query SearchEmployees($designation: String, $department: String) {
    getEmployeesByDesignationOrDepartment(designation: $designation, department: $department) {
      success
      message
      count
      employees {
        ...EmployeeFields
      }
    }
  }
`;

const GET_ONE = gql`
  ${EMPLOYEE_FRAGMENT}
  query GetEmployee($eid: ID!) {
    getEmployeeByEid(eid: $eid) {
      success
      message
      employee {
        ...EmployeeFields
      }
    }
  }
`;

const ADD = gql`
  ${EMPLOYEE_FRAGMENT}
  mutation AddEmployee($input: AddEmployeeInput!) {
    addEmployee(input: $input) {
      success
      message
      employee {
        ...EmployeeFields
      }
    }
  }
`;

const UPDATE = gql`
  ${EMPLOYEE_FRAGMENT}
  mutation UpdateEmployee($eid: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(eid: $eid, input: $input) {
      success
      message
      employee {
        ...EmployeeFields
      }
    }
  }
`;

const DELETE = gql`
  mutation DeleteEmployee($eid: ID!) {
    deleteEmployee(eid: $eid) {
      success
      message
    }
  }
`;

export interface EmployeeListResult {
  success: boolean;
  message: string;
  employees: Employee[];
  count: number;
}

export interface EmployeeOneResult {
  success: boolean;
  message: string;
  employee: Employee | null;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly apollo = inject(Apollo);

  refetchAll(): Observable<EmployeeListResult> {
    return this.apollo
      .query<{ getAllEmployees: EmployeeListResult }>({ query: GET_ALL, fetchPolicy: 'network-only' })
      .pipe(map((r) => r.data!.getAllEmployees));
  }

  search(designation: string | null, department: string | null): Observable<EmployeeListResult> {
    const d = designation?.trim() || null;
    const p = department?.trim() || null;
    return this.apollo
      .query<{ getEmployeesByDesignationOrDepartment: EmployeeListResult }>({
        query: SEARCH,
        variables: { designation: d, department: p },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data!.getEmployeesByDesignationOrDepartment));
  }

  getById(id: string): Observable<EmployeeOneResult> {
    return this.apollo
      .query<{ getEmployeeByEid: EmployeeOneResult }>({
        query: GET_ONE,
        variables: { eid: id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((r) => r.data!.getEmployeeByEid));
  }

  add(input: Record<string, unknown>): Observable<EmployeeOneResult> {
    return this.apollo
      .mutate<{ addEmployee: EmployeeOneResult }>({
        mutation: ADD,
        variables: { input },
      })
      .pipe(map((r) => r.data!.addEmployee));
  }

  update(id: string, input: Record<string, unknown>): Observable<EmployeeOneResult> {
    return this.apollo
      .mutate<{ updateEmployee: EmployeeOneResult }>({
        mutation: UPDATE,
        variables: { eid: id, input },
      })
      .pipe(map((r) => r.data!.updateEmployee));
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.apollo
      .mutate<{ deleteEmployee: { success: boolean; message: string } }>({
        mutation: DELETE,
        variables: { eid: id },
      })
      .pipe(map((r) => r.data!.deleteEmployee));
  }
}
