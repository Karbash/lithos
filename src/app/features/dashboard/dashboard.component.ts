import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModuleCardComponent,
  ModuleCard,
} from '../../shared/components/module-card/module-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ModuleCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);

  selectedCard = signal<string | null>(null);

  modules: ModuleCard[] = [
    {
      id: 'insumos',
      icon: 'ite',
      color: '#3b82f6',
      title: 'Insumos',
      description: 'Cadastro e controle de qualidade de matérias-primas.',
      active: true,
    },
    {
      id: 'fornos',
      icon: 'sta',
      color: '#f97316',
      title: 'Fornos',
      description: 'Gestão e monitoramento de fornos por planta.',
      active: true,
    },
    {
      id: 'producao',
      icon: 'pro',
      color: '#22c55e',
      title: 'Produção',
      description: 'Controle de produção, rendimento e variação térmica.',
      active: true,
    },
    {
      id: 'blending',
      icon: 'mix',
      color: '#a855f7',
      title: 'Blending',
      description: 'Motor de mistura automática e sugestões de composição.',
      active: true,
    },
    {
      id: 'laboratorio',
      icon: 'lab',
      color: '#06b6d4',
      title: 'Laboratório',
      description: 'Laudos laboratoriais e recalibração de coeficientes.',
      active: true,
    },
    {
      id: 'indicadores',
      icon: 'kpi',
      color: '#eab308',
      title: 'Indicadores',
      description: 'KPIs, estatísticas e análise de desvios.',
      active: true,
    },
    {
      id: 'custodia',
      icon: 'coc',
      color: '#ec4899',
      title: 'Cadeia de Custódia',
      description: 'Rastreabilidade completa do material desde a origem.',
      active: true,
    },
    {
      id: 'qualidade',
      icon: 'qc',
      color: '#14b8a6',
      title: 'Controle de Qualidade',
      description: 'Inspeções, não conformidades e ações corretivas.',
      active: true,
    },
    {
      id: 'config',
      icon: 'cfg',
      color: '#64748b',
      title: 'Configurações',
      description: 'Parâmetros do sistema e regras de decisão.',
      active: false,
    },
  ];

  private routes: Record<string, string> = {
    fornos: '/fornos',
  };

  onCardClick(id: string): void {
    const module = this.modules.find((m) => m.id === id);
    if (!module?.active) return;

    if (this.routes[id]) {
      this.router.navigate([this.routes[id]]);
    } else {
      this.selectedCard.set(this.selectedCard() === id ? null : id);
    }
  }
}
