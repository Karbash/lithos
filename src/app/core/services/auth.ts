import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserWithPassword extends User {
  password: string;
}

const MOCK_USERS: UserWithPassword[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@email.com',
    password: 'password',
    role: 'admin',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);

  login(payload: { email: string; password: string }): Observable<User> {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === payload.email && u.password === payload.password,
    );

    if (!foundUser) {
      return throwError(() => new Error('Invalid credentials')).pipe(delay(300));
    }

    const { password, ...user } = foundUser;
    this.user.set(user);
    return of(user).pipe(delay(300));
  }

  logout(): void {
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }
}
