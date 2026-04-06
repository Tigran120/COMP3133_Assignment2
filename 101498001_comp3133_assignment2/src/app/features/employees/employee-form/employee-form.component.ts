import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employees = inject(EmployeeService);
  private readonly upload = inject(UploadService);

  readonly genders = ['Male', 'Female', 'Other'] as const;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['Male' as string, [Validators.required]],
    designation: ['', [Validators.required]],
    salary: [1000, [Validators.required, Validators.min(1000)]],
    date_of_joining: ['', [Validators.required]],
    department: ['', [Validators.required]],
  });

  employeeId: string | null = null;
  isEdit = false;
  existingPhotoUrl: string | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  submitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.employeeId;
    if (this.isEdit && this.employeeId) {
      this.employees.getById(this.employeeId).subscribe({
        next: (res) => {
          if (!res.success || !res.employee) {
            this.errorMessage = res.message;
            return;
          }
          const e = res.employee;
          this.existingPhotoUrl = e.employee_photo;
          const d = e.date_of_joining ? String(e.date_of_joining).slice(0, 10) : '';
          this.form.patchValue({
            first_name: e.first_name,
            last_name: e.last_name,
            email: e.email,
            gender: e.gender,
            designation: e.designation,
            salary: e.salary,
            date_of_joining: d,
            department: e.department,
          });
        },
        error: () => (this.errorMessage = 'Failed to load employee.'),
      });
    }
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = file ?? null;
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  cancel(): void {
    void this.router.navigate(['/employees']);
  }

  private buildPayload(photoUrl: string | null | undefined): Record<string, unknown> {
    const v = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      first_name: v.first_name,
      last_name: v.last_name,
      email: v.email,
      gender: v.gender,
      designation: v.designation,
      salary: Number(v.salary),
      date_of_joining: v.date_of_joining,
      department: v.department,
    };
    const resolvedPhoto = photoUrl ?? this.existingPhotoUrl;
    if (resolvedPhoto) {
      payload['employee_photo'] = resolvedPhoto;
    }
    return payload;
  }

  private submitPayload(payload: Record<string, unknown>): void {
    if (this.isEdit && this.employeeId) {
      this.employees.update(this.employeeId, payload).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            void this.router.navigate(['/employees']);
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Update failed.';
        },
      });
    } else {
      this.employees.add(payload).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            void this.router.navigate(['/employees']);
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Could not add employee.';
        },
      });
    }
  }

  save(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;

    if (this.selectedFile) {
      this.upload.uploadProfilePhoto(this.selectedFile).subscribe({
        next: (res) => {
          if (!res.success || !res.url) {
            this.submitting = false;
            this.errorMessage =
              res.message ||
              'Image upload failed. Configure Cloudinary on the server or save without choosing a new file.';
            return;
          }
          this.submitPayload(this.buildPayload(res.url));
        },
        error: () => {
          this.submitting = false;
          this.errorMessage = 'Image upload failed (network or server).';
        },
      });
    } else {
      this.submitPayload(this.buildPayload(null));
    }
  }
}
