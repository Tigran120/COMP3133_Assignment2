import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    usernameOrEmail: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitting = false;
  errorMessage: string | null = null;

  submit(): void {
    this.errorMessage = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { usernameOrEmail, password } = this.form.getRawValue();
    this.auth.login(usernameOrEmail, password).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.ok) {
          void this.router.navigate(['/employees']);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Network error. Is the API running?';
      },
    });
  }
}
