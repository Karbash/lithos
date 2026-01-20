import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  authError = signal<string | null>(null);
  loading = signal(false);

  onSubmit(): void {
    this.authError.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);

    const email = this.loginForm.value.email ?? '';
    const password = this.loginForm.value.password ?? '';

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.authService.getCurrentUser(response.token).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.authError.set('Usuário não encontrado');
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.authError.set(err.message || 'Credenciais inválidas');
        this.loading.set(false);
      },
    });
  }
}
