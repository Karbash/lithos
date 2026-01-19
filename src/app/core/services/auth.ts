import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(payload: { email: string; password: string }): Observable<{ token: string }> {
    if (payload.email === 'admin@email.com' && payload.password === 'password') {
      return of({ token: 'admin-token' });
    }
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Invalid credentials' }),
    );
  }

  logout() {
    // Implement logout logic here
  }
}
