import { Component, input, output, computed } from '@angular/core';
import { MixtureBarComponent, MixtureItem } from '../mixture-bar/mixture-bar.component';

export interface FurnaceAlert {
  tipo: 'temperatura' | 'qualidade' | 'rendimento' | 'manutencao';
  mensagem: string;
  severidade: 'info' | 'warning' | 'critical';
}

export interface FurnaceLabResult {
  data: string;
  aprovado: boolean;
  cao: number;
}

export interface Furnace {
  id: string;
  nome: string;
  planta: string;
  tipo: string;
  capacidade: number;
  status: 'ativo' | 'inativo' | 'manutencao';
  temperaturaAtual: number;
  temperaturaMeta: number;
  temperaturaHistorico: number[];
  rendimentoAtual: number;
  rendimentoMeta: number;
  desvioMeta: number;
  operador?: string;
  turnoAtual?: string;
  tempoOperacao?: string;
  mistura?: MixtureItem[];
  ultimoLaudo?: FurnaceLabResult;
  alertas?: FurnaceAlert[];
  mediaMovel?: number;
  desvioPadrao?: number;
}

@Component({
  selector: 'app-furnace-card',
  standalone: true,
  imports: [MixtureBarComponent],
  templateUrl: './furnace-card.component.html',
  styleUrl: './furnace-card.component.scss',
})
export class FurnaceCardComponent {
  furnace = input.required<Furnace>();
  canEdit = input<boolean>(true); // Permissão para editar
  cardClick = output<string>();
  editClick = output<string>();

  alertCount = computed(() => this.furnace().alertas?.length ?? 0);
  criticalAlerts = computed(
    () => this.furnace().alertas?.filter((a) => a.severidade === 'critical').length ?? 0,
  );

  desvioClass = computed(() => {
    const desvio = Math.abs(this.furnace().desvioMeta);
    if (desvio <= 2) return 'desvio-ok';
    if (desvio <= 5) return 'desvio-warning';
    return 'desvio-critical';
  });

  onClick(): void {
    this.cardClick.emit(this.furnace().id);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.furnace().id);
  }

  getStatusLabel(): string {
    const status = this.furnace().status;
    if (status === 'ativo') return 'Operando';
    if (status === 'manutencao') return 'Manutenção';
    return 'Inativo';
  }

  getTempColor(): string {
    const temp = this.furnace().temperaturaAtual;
    const meta = this.furnace().temperaturaMeta;
    const diff = Math.abs(temp - meta);
    const tolerance = meta * 0.05; // 5% tolerance

    if (diff <= tolerance) return '#22c55e'; // Verde - OK
    if (diff <= tolerance * 2) return '#eab308'; // Amarelo - Atenção
    return '#ef4444'; // Vermelho - Crítico
  }

  getTempPercentage(): number {
    const temp = this.furnace().temperaturaAtual;
    const max = 1500;
    return Math.min((temp / max) * 100, 100);
  }

  getMetaPercentage(): number {
    const meta = this.furnace().temperaturaMeta;
    const max = 1500;
    return Math.min((meta / max) * 100, 100);
  }

  // Expor Math para uso no template
  Math = Math;
}
