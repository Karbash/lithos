import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operador' | 'laboratorio';
  tenantId: string;
  plantasVinculadas: string[];
  cargo?: string;
  setor?: string;
  dataAdmissao?: string;
  turnoPreferencial?: 'A' | 'B' | 'C';
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number; // segundos
}

interface UserWithPassword extends User {
  password: string;
  token: string; // Token mockado para cada usuário
}

const MOCK_USERS: UserWithPassword[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@email.com',
    password: 'password',
    role: 'admin',
    tenantId: '1',
    plantasVinculadas: ['Planta A', 'Planta B'],
    cargo: 'Gerente de Producao',
    setor: 'Producao',
    dataAdmissao: '2020-03-15',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJyb2xlIjoiYWRtaW4iLCJ0ZW5hbnRJZCI6IjEiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NjQwMH0.admin_mock_signature',
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'password',
    role: 'operador',
    tenantId: '1',
    plantasVinculadas: ['Planta A'],
    cargo: 'Operador de Forno',
    setor: 'Fornos',
    dataAdmissao: '2022-06-01',
    turnoPreferencial: 'A',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwibmFtZSI6IkpvYW8gU2lsdmEiLCJyb2xlIjoib3BlcmFkb3IiLCJ0ZW5hbnRJZCI6IjEiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDA4NjQwMH0.joao_mock_signature',
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@email.com',
    password: 'password',
    role: 'operador',
    tenantId: '1',
    plantasVinculadas: ['Planta B'],
    cargo: 'Operadora de Forno',
    setor: 'Fornos',
    dataAdmissao: '2021-09-12',
    turnoPreferencial: 'A',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwibmFtZSI6Ik1hcmlhIFNhbnRvcyIsInJvbGUiOiJvcGVyYWRvciIsInRlbmFudElkIjoiMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.maria_mock_signature',
  },
  {
    id: '4',
    name: 'Carlos Lima',
    email: 'carlos@email.com',
    password: 'password',
    role: 'operador',
    tenantId: '1',
    plantasVinculadas: ['Planta B'],
    cargo: 'Operador de Forno',
    setor: 'Fornos',
    dataAdmissao: '2023-01-20',
    turnoPreferencial: 'B',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwibmFtZSI6IkNhcmxvcyBMaW1hIiwicm9sZSI6Im9wZXJhZG9yIiwidGVuYW50SWQiOiIxIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9.carlos_mock_signature',
  },
  {
    id: '5',
    name: 'Ana Costa',
    email: 'ana@email.com',
    password: 'password',
    role: 'laboratorio',
    tenantId: '1',
    plantasVinculadas: ['Planta A', 'Planta B'],
    cargo: 'Analista de Laboratorio',
    setor: 'Laboratorio',
    dataAdmissao: '2021-04-10',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwibmFtZSI6IkFuYSBDb3N0YSIsInJvbGUiOiJsYWJvcmF0b3JpbyIsInRlbmFudElkIjoiMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.ana_mock_signature',
  },
  {
    id: '6',
    name: 'Pedro Supervisor',
    email: 'pedro@email.com',
    password: 'password',
    role: 'supervisor',
    tenantId: '1',
    plantasVinculadas: ['Planta A', 'Planta B'],
    cargo: 'Supervisor de Turno',
    setor: 'Producao',
    dataAdmissao: '2019-11-05',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2IiwibmFtZSI6IlBlZHJvIFN1cGVydmlzb3IiLCJyb2xlIjoic3VwZXJ2aXNvciIsInRlbmFudElkIjoiMSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.pedro_mock_signature',
  },
];

const TOKEN_KEY = 'lithos_token';
const USER_KEY = 'lithos_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    this.loadStoredSession();
  }

  /**
   * Carrega sessão armazenada no localStorage
   */
  private loadStoredSession(): void {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.token.set(storedToken);
        this.user.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  /**
   * Limpa dados do localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Salva sessão no localStorage
   */
  private saveSession(user: User, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Login - retorna usuário e token
   */
  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === payload.email && u.password === payload.password,
    );

    if (!foundUser) {
      return throwError(() => new Error('Credenciais invalidas')).pipe(delay(300));
    }

    const { password, token, ...user } = foundUser;

    const response: AuthResponse = {
      user,
      token,
      expiresIn: 86400, // 24 horas
    };

    return of(response).pipe(
      delay(300),
      tap((res) => {
        this.user.set(res.user);
        this.token.set(res.token);
        this.saveSession(res.user, res.token);
      }),
    );
  }

  /**
   * Logout - limpa sessão
   */
  logout(): void {
    this.user.set(null);
    this.token.set(null);
    this.clearStorage();
  }

  getCurrentUser(token: string): Observable<User> {
    for (const user of MOCK_USERS) {
      if (user.token === token) {
        return of(user);
      }
    }
    return throwError(() => new Error('Usuário não encontrado'));
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return this.token() !== null && this.user() !== null;
  }

  /**
   * Retorna o token atual
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Retorna label do perfil
   */
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      operador: 'Operador',
      laboratorio: 'Laboratorio',
    };
    return labels[role] || role;
  }
}
