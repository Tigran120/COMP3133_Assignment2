import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { IsoDatePipe } from '../../../shared/pipes/iso-date.pipe';
import { SalaryCadPipe } from '../../../shared/pipes/salary-cad.pipe';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IsoDatePipe, SalaryCadPipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly searchForm = this.fb.nonNullable.group({
    department: [''],
    position: [''],
  });

  employees: Employee[] = [];
  loading = true;
  error: string | null = null;
  searchMessage: string | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = null;
    this.searchMessage = null;
    this.employeeService.refetchAll().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.employees = res.employees ?? [];
        } else {
          this.error = res.message;
          this.employees = [];
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load employees.';
        this.employees = [];
      },
    });
  }

  search(): void {
    const { department, position } = this.searchForm.getRawValue();
    const dept = department.trim();
    const pos = position.trim();
    if (!dept && !pos) {
      this.searchMessage = 'Enter a department and/or position to search.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.searchMessage = null;
    this.employeeService.search(pos || null, dept || null).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.employees = res.employees ?? [];
          this.searchMessage = `Found ${res.count} employee(s).`;
        } else {
          this.error = res.message;
          this.employees = [];
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Search failed.';
      },
    });
  }

  clearSearch(): void {
    this.searchForm.reset({ department: '', position: '' });
    this.loadAll();
  }

  deleteEmployee(emp: Employee): void {
    if (!confirm(`Delete ${emp.first_name} ${emp.last_name}?`)) return;
    this.employeeService.delete(emp._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.employees = this.employees.filter((e) => e._id !== emp._id);
        } else {
          alert(res.message);
        }
      },
      error: () => alert('Delete failed.'),
    });
  }

  view(id: string): void {
    void this.router.navigate(['/view-employee', id]);
  }

  edit(id: string): void {
    void this.router.navigate(['/update-employee', id]);
  }
}
