import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Leitura individual durante o turno
export interface LeituraTurno {
  id: string;
  registroId: string;
  hora: string;
  temperatura: number;
  observacao?: string;
}

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
  // Leituras feitas durante o turno
  leituras?: LeituraTurno[];
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
    leituras: [
      { id: 'l1', registroId: '1', hora: '08:00', temperatura: 1242 },
      { id: 'l2', registroId: '1', hora: '10:00', temperatura: 1245 },
      { id: 'l3', registroId: '1', hora: '12:00', temperatura: 1247 },
    ],
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
    horaFim: '14:00',
    temperaturaFim: 1320,
    producao: 52,
    leituras: [],
  },
  {
    id: '3',
    fornoId: '1',
    data: '2026-01-20',
    turno: 'A',
    operador: 'João Silva',
    horaInicio: '06:00',
    temperaturaInicio: 1245,
    status: 'aberto',
    tenantId: '1',
    leituras: [
      { id: 'l4', registroId: '3', hora: '08:00', temperatura: 1248, observacao: 'Estável' },
      { id: 'l5', registroId: '3', hora: '10:00', temperatura: 1250 },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class RegistrosService {
  private registros = signal<RegistroTurno[]>(structuredClone(MOCK_REGISTROS));
  private nextId = 100;
  private nextLeituraId = 1000;

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

  getAberto(fornoId: string): Observable<RegistroTurno | null> {
    const registro = this.registros().find((r) => r.fornoId === fornoId && r.status === 'aberto');
    return of(registro || null).pipe(delay(200));
  }

  iniciarTurno(registro: Omit<RegistroTurno, 'id' | 'leituras'>): Observable<RegistroTurno> {
    const newRegistro: RegistroTurno = {
      ...registro,
      id: String(this.nextId++),
      leituras: [],
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

  // ============================================
  // LEITURAS DURANTE O TURNO
  // ============================================

  /**
   * Registra uma leitura de temperatura durante o turno
   */
  registrarLeitura(
    registroId: string,
    temperatura: number,
    observacao?: string,
  ): Observable<LeituraTurno | null> {
    const agora = new Date();
    const novaLeitura: LeituraTurno = {
      id: String(this.nextLeituraId++),
      registroId,
      hora: agora.toTimeString().slice(0, 5),
      temperatura,
      observacao,
    };

    let leituraAdicionada: LeituraTurno | null = null;

    this.registros.update((list) =>
      list.map((r) => {
        if (r.id === registroId && r.status === 'aberto') {
          leituraAdicionada = novaLeitura;
          return {
            ...r,
            leituras: [...(r.leituras || []), novaLeitura],
          };
        }
        return r;
      }),
    );

    return of(leituraAdicionada).pipe(delay(200));
  }

  /**
   * Obtém todas as leituras de um registro
   */
  getLeituras(registroId: string): Observable<LeituraTurno[]> {
    const registro = this.registros().find((r) => r.id === registroId);
    return of(registro?.leituras || []).pipe(delay(100));
  }

  /**
   * Calcula estatísticas das leituras do turno
   */
  calcularEstatisticasTurno(registroId: string): {
    mediaTemperatura: number;
    minTemperatura: number;
    maxTemperatura: number;
    totalLeituras: number;
  } {
    const registro = this.registros().find((r) => r.id === registroId);
    const leituras = registro?.leituras || [];

    if (leituras.length === 0) {
      return {
        mediaTemperatura: registro?.temperaturaInicio || 0,
        minTemperatura: registro?.temperaturaInicio || 0,
        maxTemperatura: registro?.temperaturaInicio || 0,
        totalLeituras: 0,
      };
    }

    const temperaturas = leituras.map((l) => l.temperatura);
    const soma = temperaturas.reduce((acc, t) => acc + t, 0);

    return {
      mediaTemperatura: Math.round((soma / temperaturas.length) * 10) / 10,
      minTemperatura: Math.min(...temperaturas),
      maxTemperatura: Math.max(...temperaturas),
      totalLeituras: leituras.length,
    };
  }

  /**
   * Atualiza observações do turno
   */
  atualizarObservacoes(registroId: string, observacoes: string): Observable<RegistroTurno | null> {
    let updated: RegistroTurno | null = null;

    this.registros.update((list) =>
      list.map((r) => {
        if (r.id === registroId) {
          updated = { ...r, observacoes };
          return updated;
        }
        return r;
      }),
    );

    return of(updated).pipe(delay(200));
  }

  // ============================================
  // CONSULTAS POR OPERADOR
  // ============================================

  /**
   * Busca todos os turnos de um operador
   */
  getByOperador(nomeOperador: string): Observable<RegistroTurno[]> {
    const filtered = this.registros()
      .filter((r) => r.operador.toLowerCase() === nomeOperador.toLowerCase())
      .sort((a, b) => {
        const dateCompare = b.data.localeCompare(a.data);
        if (dateCompare !== 0) return dateCompare;
        return b.horaInicio.localeCompare(a.horaInicio);
      });
    return of(filtered).pipe(delay(200));
  }

  /**
   * Busca turno ativo de um operador (em qualquer forno)
   */
  getTurnoAtivoOperador(nomeOperador: string): Observable<RegistroTurno | null> {
    const registro = this.registros().find(
      (r) => r.operador.toLowerCase() === nomeOperador.toLowerCase() && r.status === 'aberto',
    );
    return of(registro || null).pipe(delay(200));
  }

  /**
   * Calcula estatísticas do operador
   */
  getEstatisticasOperador(nomeOperador: string): Observable<{
    totalTurnos: number;
    turnosAbertos: number;
    turnosFechados: number;
    producaoTotal: number;
    mediaProducao: number;
    ultimoTurno: RegistroTurno | null;
  }> {
    const turnos = this.registros().filter(
      (r) => r.operador.toLowerCase() === nomeOperador.toLowerCase(),
    );

    const turnosFechados = turnos.filter((t) => t.status === 'fechado');
    const producaoTotal = turnosFechados.reduce((acc, t) => acc + (t.producao || 0), 0);

    const stats = {
      totalTurnos: turnos.length,
      turnosAbertos: turnos.filter((t) => t.status === 'aberto').length,
      turnosFechados: turnosFechados.length,
      producaoTotal: Math.round(producaoTotal * 10) / 10,
      mediaProducao:
        turnosFechados.length > 0
          ? Math.round((producaoTotal / turnosFechados.length) * 10) / 10
          : 0,
      ultimoTurno:
        turnos.sort(
          (a, b) => b.data.localeCompare(a.data) || b.horaInicio.localeCompare(a.horaInicio),
        )[0] || null,
    };

    return of(stats).pipe(delay(200));
  }
}
