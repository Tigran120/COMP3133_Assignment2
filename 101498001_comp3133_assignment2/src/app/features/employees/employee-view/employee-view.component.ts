import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { IsoDatePipe } from '../../../shared/pipes/iso-date.pipe';
import { SalaryCadPipe } from '../../../shared/pipes/salary-cad.pipe';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [RouterLink, IsoDatePipe, SalaryCadPipe],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.scss',
})
export class EmployeeViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);

  employee: Employee | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/employees']);
      return;
    }
    this.employeeService.getById(id).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.employee) {
          this.employee = res.employee;
        } else {
          this.error = res.message;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load employee.';
      },
    });
  }
}
