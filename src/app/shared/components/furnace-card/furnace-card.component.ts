import { Component, input, output, computed } from '@angular/core';
import { TemperatureGaugeComponent } from '../temperature-gauge/temperature-gauge.component';
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
  imports: [TemperatureGaugeComponent, MixtureBarComponent],
  templateUrl: './furnace-card.component.html',
  styleUrl: './furnace-card.component.scss',
})
export class FurnaceCardComponent {
  furnace = input.required<Furnace>();
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
}
