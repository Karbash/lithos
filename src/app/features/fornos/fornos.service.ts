import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Furnace } from '../../shared/components/furnace-card/furnace-card.component';

export interface FurnaceCreate {
  nome: string;
  planta: string;
  tipo: string;
  capacidade: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  temperaturaAtual: number;
  tenantId: string;
}

const MOCK_FORNOS: Furnace[] = [
  {
    id: '1',
    nome: 'Forno 01',
    planta: 'Planta A',
    tipo: 'Rotativo',
    capacidade: 500,
    status: 'ativo',
    temperaturaAtual: 1248,
    temperaturaMeta: 1250,
    temperaturaHistorico: [1245, 1252, 1248, 1255, 1240, 1238, 1250, 1248, 1252, 1245, 1248, 1250],
    rendimentoAtual: 89.5,
    rendimentoMeta: 90,
    desvioMeta: -0.5,
    operador: 'João Silva',
    turnoAtual: 'A',
    tempoOperacao: '6h 32min',
    mediaMovel: 1247,
    desvioPadrao: 5.2,
    mistura: [
      { nome: 'Calcário', percentual: 70, cor: '#3b82f6' },
      { nome: 'Argila', percentual: 30, cor: '#22c55e' },
    ],
    ultimoLaudo: {
      data: '2024-01-15',
      aprovado: true,
      cao: 92.5,
    },
    alertas: [],
  },
  {
    id: '2',
    nome: 'Forno 02',
    planta: 'Planta A',
    tipo: 'Vertical',
    capacidade: 300,
    status: 'manutencao',
    temperaturaAtual: 0,
    temperaturaMeta: 1200,
    temperaturaHistorico: [1180, 1195, 1150, 1120, 1080, 950, 800, 500, 200, 0, 0, 0],
    rendimentoAtual: 0,
    rendimentoMeta: 88,
    desvioMeta: -88,
    operador: undefined,
    turnoAtual: undefined,
    tempoOperacao: undefined,
    mediaMovel: 680,
    desvioPadrao: 420,
    mistura: [],
    ultimoLaudo: {
      data: '2024-01-14',
      aprovado: false,
      cao: 85.2,
    },
    alertas: [
      {
        tipo: 'manutencao',
        mensagem: 'Manutenção preventiva programada',
        severidade: 'info',
      },
    ],
  },
  {
    id: '3',
    nome: 'Forno 03',
    planta: 'Planta B',
    tipo: 'Rotativo',
    capacidade: 450,
    status: 'ativo',
    temperaturaAtual: 1320,
    temperaturaMeta: 1250,
    temperaturaHistorico: [1260, 1275, 1290, 1305, 1310, 1315, 1318, 1320, 1322, 1318, 1320, 1320],
    rendimentoAtual: 92.3,
    rendimentoMeta: 90,
    desvioMeta: 2.3,
    operador: 'Maria Santos',
    turnoAtual: 'A',
    tempoOperacao: '4h 15min',
    mediaMovel: 1306,
    desvioPadrao: 18.5,
    mistura: [
      { nome: 'Calcário', percentual: 65, cor: '#3b82f6' },
      { nome: 'Argila', percentual: 25, cor: '#22c55e' },
      { nome: 'Silica', percentual: 10, cor: '#a855f7' },
    ],
    ultimoLaudo: {
      data: '2024-01-15',
      aprovado: true,
      cao: 94.1,
    },
    alertas: [
      {
        tipo: 'temperatura',
        mensagem: 'Temperatura 70°C acima da meta',
        severidade: 'warning',
      },
      {
        tipo: 'temperatura',
        mensagem: 'Tendência de alta nas últimas 6h',
        severidade: 'info',
      },
    ],
  },
  {
    id: '4',
    nome: 'Forno 04',
    planta: 'Planta B',
    tipo: 'Horizontal',
    capacidade: 600,
    status: 'ativo',
    temperaturaAtual: 1150,
    temperaturaMeta: 1250,
    temperaturaHistorico: [1240, 1235, 1220, 1210, 1200, 1190, 1180, 1170, 1160, 1155, 1152, 1150],
    rendimentoAtual: 82.1,
    rendimentoMeta: 90,
    desvioMeta: -7.9,
    operador: 'Carlos Lima',
    turnoAtual: 'B',
    tempoOperacao: '2h 45min',
    mediaMovel: 1193,
    desvioPadrao: 32.4,
    mistura: [
      { nome: 'Calcário', percentual: 75, cor: '#3b82f6' },
      { nome: 'Argila', percentual: 25, cor: '#22c55e' },
    ],
    ultimoLaudo: {
      data: '2024-01-15',
      aprovado: false,
      cao: 88.3,
    },
    alertas: [
      {
        tipo: 'temperatura',
        mensagem: 'Temperatura 100°C abaixo da meta',
        severidade: 'critical',
      },
      {
        tipo: 'rendimento',
        mensagem: 'Rendimento 7.9% abaixo da meta',
        severidade: 'critical',
      },
      {
        tipo: 'qualidade',
        mensagem: 'Último laudo reprovado',
        severidade: 'warning',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class FornosService {
  private fornos = signal<Furnace[]>(structuredClone(MOCK_FORNOS));
  private nextId = 5;

  getAll(): Observable<Furnace[]> {
    return of(this.fornos()).pipe(delay(200));
  }

  getById(id: string): Observable<Furnace> {
    const forno = this.fornos().find((f) => f.id === id);
    return of(forno as Furnace).pipe(delay(200));
  }

  create(forno: FurnaceCreate): Observable<Furnace> {
    const newForno: Furnace = {
      ...forno,
      id: String(this.nextId++),
      temperaturaMeta: 1250,
      temperaturaHistorico: [],
      rendimentoAtual: 0,
      rendimentoMeta: 90,
      desvioMeta: 0,
      alertas: [],
    };
    this.fornos.update((list) => [...list, newForno]);
    return of(newForno).pipe(delay(200));
  }

  update(id: string, forno: Partial<Furnace>): Observable<Furnace> {
    let updated: Furnace | undefined;
    this.fornos.update((list) =>
      list.map((f) => {
        if (f.id === id) {
          updated = { ...f, ...forno };
          return updated;
        }
        return f;
      }),
    );
    return of(updated as Furnace).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    this.fornos.update((list) => list.filter((f) => f.id !== id));
    return of(undefined).pipe(delay(200));
  }
}
