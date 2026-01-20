import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistroTurno {
  id?: string;
  fornoId: string;
  data: string;
  turno: 'A' | 'B' | 'C';
  operador: string;
  horaInicio: string;
  horaFim?: string;
  temperaturaInicio: number;
  temperaturaFim?: number;
  producao?: number;
  observacoes?: string;
  status: 'aberto' | 'fechado';
  tenantId: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegistrosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getByForno(fornoId: string): Observable<RegistroTurno[]> {
    return this.http.get<RegistroTurno[]>(`${this.apiUrl}/registros?fornoId=${fornoId}&_sort=data,horaInicio&_order=desc,desc`);
  }

  getAberto(fornoId: string): Observable<RegistroTurno[]> {
    return this.http.get<RegistroTurno[]>(`${this.apiUrl}/registros?fornoId=${fornoId}&status=aberto`);
  }

  iniciarTurno(registro: Omit<RegistroTurno, 'id'>): Observable<RegistroTurno> {
    return this.http.post<RegistroTurno>(`${this.apiUrl}/registros`, registro);
  }

  finalizarTurno(id: string, dados: Partial<RegistroTurno>): Observable<RegistroTurno> {
    return this.http.patch<RegistroTurno>(`${this.apiUrl}/registros/${id}`, {
      ...dados,
      status: 'fechado',
    });
  }
}
