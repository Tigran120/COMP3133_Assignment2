import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  submitting = false;
  errorMessage: string | null = null;

  submit(): void {
    this.errorMessage = null;
    const { password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { username, email } = this.form.getRawValue();
    this.auth.signup(username, email, password).subscribe({
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
