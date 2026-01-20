import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Furnace } from '../../shared/components/furnace-card/furnace-card.component';

export interface FurnaceCreate {
  nome: string;
  planta: string;
  tipo: string;
  capacidade: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  temperaturaAtual: number;
  temperaturaMeta: number;
  rendimentoMeta: number;
  tenantId: string;
}

// Dados brutos do mock - sem valores calculados
interface FurnaceRaw {
  id: string;
  nome: string;
  planta: string;
  tipo: string;
  capacidade: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  temperaturaAtual: number;
  temperaturaMeta: number;
  temperaturaHistorico: number[]; // últimas 24 leituras (a cada 1h)
  rendimentoAtual: number;
  rendimentoMeta: number;
  operador?: string;
  turnoAtual?: string;
  tempoOperacao?: string;
  mistura?: { nome: string; percentual: number; cor: string }[];
  ultimoLaudo?: { data: string; aprovado: boolean; cao: number };
  alertas?: { tipo: string; mensagem: string; severidade: string }[];
}

// Mock com dados brutos - os cálculos serão feitos pelo serviço
const MOCK_FORNOS_RAW: FurnaceRaw[] = [
  {
    id: '1',
    nome: 'Forno 01',
    planta: 'Planta A',
    tipo: 'Rotativo',
    capacidade: 500,
    status: 'ativo',
    temperaturaAtual: 1248,
    temperaturaMeta: 1250,
    // Histórico estável próximo da meta
    temperaturaHistorico: [
      1245, 1252, 1248, 1255, 1240, 1238, 1250, 1248, 1252, 1245, 1248, 1250, 1247, 1249, 1251,
      1248, 1246, 1250, 1252, 1248, 1247, 1249, 1250, 1248,
    ],
    rendimentoAtual: 89.5,
    rendimentoMeta: 90,
    operador: 'João Silva',
    turnoAtual: 'A',
    tempoOperacao: '6h 32min',
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
    // Histórico mostrando queda até parar
    temperaturaHistorico: [
      1180, 1195, 1150, 1120, 1080, 950, 800, 500, 200, 100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0,
    ],
    rendimentoAtual: 0,
    rendimentoMeta: 88,
    operador: undefined,
    turnoAtual: undefined,
    tempoOperacao: undefined,
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
    // Histórico com tendência de alta (problema)
    temperaturaHistorico: [
      1250, 1255, 1260, 1268, 1275, 1282, 1290, 1298, 1305, 1310, 1315, 1318, 1320, 1322, 1325,
      1320, 1318, 1320, 1322, 1320, 1318, 1320, 1322, 1320,
    ],
    rendimentoAtual: 92.3,
    rendimentoMeta: 90,
    operador: 'Maria Santos',
    turnoAtual: 'A',
    tempoOperacao: '4h 15min',
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
        mensagem: 'Temperatura acima da meta',
        severidade: 'warning',
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
    // Histórico com tendência de queda (problema crítico)
    temperaturaHistorico: [
      1250, 1248, 1245, 1240, 1235, 1225, 1220, 1210, 1200, 1195, 1190, 1185, 1180, 1175, 1170,
      1165, 1160, 1158, 1155, 1153, 1152, 1151, 1150, 1150,
    ],
    rendimentoAtual: 82.1,
    rendimentoMeta: 90,
    operador: 'Carlos Lima',
    turnoAtual: 'B',
    tempoOperacao: '2h 45min',
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
        mensagem: 'Temperatura abaixo da meta',
        severidade: 'critical',
      },
      {
        tipo: 'rendimento',
        mensagem: 'Rendimento abaixo da meta',
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
  private fornosRaw = signal<FurnaceRaw[]>(structuredClone(MOCK_FORNOS_RAW));
  private nextId = 5;

  // ============================================
  // FUNÇÕES DE CÁLCULO
  // ============================================

  /**
   * Calcula a média móvel de um array de valores
   * @param valores Array de números
   * @param janela Tamanho da janela (padrão: todos os valores)
   */
  calcularMediaMovel(valores: number[], janela?: number): number {
    if (!valores || valores.length === 0) return 0;

    const dados = janela ? valores.slice(-janela) : valores;
    const valoresValidos = dados.filter((v) => v > 0); // ignora zeros (forno parado)

    if (valoresValidos.length === 0) return 0;

    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    return Math.round((soma / valoresValidos.length) * 10) / 10;
  }

  /**
   * Calcula o desvio padrão de um array de valores
   * @param valores Array de números
   */
  calcularDesvioPadrao(valores: number[]): number {
    if (!valores || valores.length === 0) return 0;

    const valoresValidos = valores.filter((v) => v > 0);
    if (valoresValidos.length < 2) return 0;

    const media = valoresValidos.reduce((acc, val) => acc + val, 0) / valoresValidos.length;
    const somaQuadrados = valoresValidos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);
    const variancia = somaQuadrados / valoresValidos.length;

    return Math.round(Math.sqrt(variancia) * 10) / 10;
  }

  /**
   * Calcula o desvio percentual em relação à meta
   * @param atual Valor atual
   * @param meta Valor meta
   */
  calcularDesvioMeta(atual: number, meta: number): number {
    if (meta === 0) return 0;
    const desvio = atual - meta;
    return Math.round((desvio / meta) * 1000) / 10; // Percentual com 1 casa decimal
  }

  /**
   * Calcula o desvio absoluto (diferença simples)
   */
  calcularDesvioAbsoluto(atual: number, meta: number): number {
    return Math.round((atual - meta) * 10) / 10;
  }

  // ============================================
  // TRANSFORMAÇÃO DE DADOS
  // ============================================

  /**
   * Transforma dados brutos em Furnace com valores calculados
   */
  private calcularMetricas(raw: FurnaceRaw): Furnace {
    const mediaMovel = this.calcularMediaMovel(raw.temperaturaHistorico, 12); // últimas 12h
    const desvioPadrao = this.calcularDesvioPadrao(raw.temperaturaHistorico);
    const desvioMeta = this.calcularDesvioAbsoluto(raw.rendimentoAtual, raw.rendimentoMeta);

    return {
      ...raw,
      mediaMovel,
      desvioPadrao,
      desvioMeta,
    } as Furnace;
  }

  /**
   * Gera alertas automaticamente baseado nos dados
   */
  private gerarAlertasAutomaticos(forno: Furnace): Furnace {
    const alertas = [...(forno.alertas || [])];

    // Alerta de temperatura
    const diffTemp = Math.abs(forno.temperaturaAtual - forno.temperaturaMeta);
    const toleranciaTemp = forno.temperaturaMeta * 0.05; // 5%

    if (forno.status === 'ativo' && diffTemp > toleranciaTemp * 2) {
      const jaTemAlertaTemp = alertas.some((a) => a.tipo === 'temperatura');
      if (!jaTemAlertaTemp) {
        alertas.push({
          tipo: 'temperatura',
          mensagem:
            forno.temperaturaAtual > forno.temperaturaMeta
              ? `Temperatura ${Math.round(diffTemp)}°C acima da meta`
              : `Temperatura ${Math.round(diffTemp)}°C abaixo da meta`,
          severidade: diffTemp > toleranciaTemp * 3 ? 'critical' : 'warning',
        });
      }
    }

    // Alerta de rendimento
    if (forno.status === 'ativo' && forno.desvioMeta < -5) {
      const jaTemAlertaRend = alertas.some((a) => a.tipo === 'rendimento');
      if (!jaTemAlertaRend) {
        alertas.push({
          tipo: 'rendimento',
          mensagem: `Rendimento ${Math.abs(forno.desvioMeta)}% abaixo da meta`,
          severidade: forno.desvioMeta < -10 ? 'critical' : 'warning',
        });
      }
    }

    return { ...forno, alertas };
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  getAll(): Observable<Furnace[]> {
    const fornos = this.fornosRaw().map((raw) => {
      const comMetricas = this.calcularMetricas(raw);
      return this.gerarAlertasAutomaticos(comMetricas);
    });
    return of(fornos).pipe(delay(200));
  }

  getById(id: string): Observable<Furnace | undefined> {
    const raw = this.fornosRaw().find((f) => f.id === id);
    if (!raw) return of(undefined).pipe(delay(200));

    const comMetricas = this.calcularMetricas(raw);
    const comAlertas = this.gerarAlertasAutomaticos(comMetricas);
    return of(comAlertas).pipe(delay(200));
  }

  create(forno: FurnaceCreate): Observable<Furnace> {
    const newRaw: FurnaceRaw = {
      ...forno,
      id: String(this.nextId++),
      temperaturaHistorico: [forno.temperaturaAtual],
      rendimentoAtual: 0,
      alertas: [],
    };

    this.fornosRaw.update((list) => [...list, newRaw]);

    const comMetricas = this.calcularMetricas(newRaw);
    return of(comMetricas).pipe(delay(200));
  }

  update(id: string, dados: Partial<FurnaceRaw>): Observable<Furnace | undefined> {
    let updated: FurnaceRaw | undefined;

    this.fornosRaw.update((list) =>
      list.map((f) => {
        if (f.id === id) {
          updated = { ...f, ...dados };

          // Se atualizou temperatura, adiciona ao histórico
          if (dados.temperaturaAtual !== undefined) {
            updated.temperaturaHistorico = [
              ...f.temperaturaHistorico.slice(-23),
              dados.temperaturaAtual,
            ];
          }

          return updated;
        }
        return f;
      }),
    );

    if (!updated) return of(undefined).pipe(delay(200));

    const comMetricas = this.calcularMetricas(updated);
    const comAlertas = this.gerarAlertasAutomaticos(comMetricas);
    return of(comAlertas).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    this.fornosRaw.update((list) => list.filter((f) => f.id !== id));
    return of(undefined).pipe(delay(200));
  }

  // ============================================
  // MÉTODOS UTILITÁRIOS
  // ============================================

  /**
   * Atualiza a temperatura de um forno (simulação de sensor)
   */
  atualizarTemperatura(id: string, novaTemperatura: number): Observable<Furnace | undefined> {
    return this.update(id, { temperaturaAtual: novaTemperatura });
  }

  /**
   * Atualiza o rendimento de um forno
   */
  atualizarRendimento(id: string, novoRendimento: number): Observable<Furnace | undefined> {
    return this.update(id, { rendimentoAtual: novoRendimento });
  }
}
