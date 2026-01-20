import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  user = signal<User | null>(null);

  login(payload: { email: string; password: string }): Observable<User> {
    return this.http
      .get<UserResponse[]>(`${this.apiUrl}/users`, {
        params: { email: payload.email, password: payload.password },
      })
      .pipe(
        map((users) => {
          if (users.length === 0) {
            throw new Error('Invalid credentials');
          }
          const { password, ...user } = users[0];
          this.user.set(user);
          return user;
        }),
        catchError(() => throwError(() => new Error('Invalid credentials'))),
      );
  }

  logout(): void {
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }
}
