import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

const MOCK_REGISTROS: RegistroTurno[] = [
  {
    id: '1',
    fornoId: '1',
    data: '2024-01-15',
    turno: 'A',
    operador: 'João Silva',
    horaInicio: '06:00',
    horaFim: '14:00',
    temperaturaInicio: 1240,
    temperaturaFim: 1248,
    producao: 58.5,
    observacoes: 'Turno sem intercorrências',
    status: 'fechado',
    tenantId: '1',
  },
  {
    id: '2',
    fornoId: '3',
    data: '2024-01-15',
    turno: 'A',
    operador: 'Maria Santos',
    horaInicio: '06:00',
    temperaturaInicio: 1305,
    status: 'fechado',
    tenantId: '1',
    horaFim: '22:20',
    temperaturaFim: 1360,
    producao: 2,
  },
  {
    id: '3d62',
    fornoId: '3',
    data: '2026-01-20',
    turno: 'A',
    operador: 'Jordane Almeida',
    horaInicio: '22:21',
    temperaturaInicio: 1300,
    status: 'aberto',
    tenantId: '1',
  },
];

@Injectable({
  providedIn: 'root',
})
export class RegistrosService {
  private registros = signal<RegistroTurno[]>(structuredClone(MOCK_REGISTROS));
  private nextId = 100;

  getByForno(fornoId: string): Observable<RegistroTurno[]> {
    const filtered = this.registros()
      .filter((r) => r.fornoId === fornoId)
      .sort((a, b) => {
        const dateCompare = b.data.localeCompare(a.data);
        if (dateCompare !== 0) return dateCompare;
        return b.horaInicio.localeCompare(a.horaInicio);
      });
    return of(filtered).pipe(delay(200));
  }

  getAberto(fornoId: string): Observable<RegistroTurno[]> {
    const filtered = this.registros().filter((r) => r.fornoId === fornoId && r.status === 'aberto');
    return of(filtered).pipe(delay(200));
  }

  iniciarTurno(registro: Omit<RegistroTurno, 'id'>): Observable<RegistroTurno> {
    const newRegistro: RegistroTurno = {
      ...registro,
      id: String(this.nextId++),
    };
    this.registros.update((list) => [...list, newRegistro]);
    return of(newRegistro).pipe(delay(200));
  }

  finalizarTurno(id: string, dados: Partial<RegistroTurno>): Observable<RegistroTurno> {
    let updated: RegistroTurno | undefined;
    this.registros.update((list) =>
      list.map((r) => {
        if (r.id === id) {
          updated = { ...r, ...dados, status: 'fechado' };
          return updated;
        }
        return r;
      }),
    );
    return of(updated as RegistroTurno).pipe(delay(200));
  }
}
