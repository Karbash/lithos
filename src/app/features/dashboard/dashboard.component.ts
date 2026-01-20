import { Component, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModuleCardComponent,
  ModuleCard,
} from '../../shared/components/module-card/module-card.component';
import { AuthService } from '../../core/services/auth';
import { PermissionsService, ModuleId } from '../../core/services/permissions';

interface ModuleDefinition {
  id: ModuleId;
  icon: string;
  color: string;
  title: string;
  description: string;
  route?: string;
}

// Definição de todos os módulos do sistema
const ALL_MODULES: ModuleDefinition[] = [
  {
    id: 'fornos',
    icon: 'sta',
    color: '#f97316',
    title: 'Fornos',
    description: 'Gestao e monitoramento de fornos por planta.',
    route: '/fornos',
  },
  {
    id: 'producao',
    icon: 'pro',
    color: '#22c55e',
    title: 'Producao',
    description: 'Controle de producao, rendimento e variacao termica.',
  },
  {
    id: 'insumos',
    icon: 'ite',
    color: '#3b82f6',
    title: 'Insumos',
    description: 'Cadastro e controle de qualidade de materias-primas.',
  },
  {
    id: 'blending',
    icon: 'mix',
    color: '#a855f7',
    title: 'Blending',
    description: 'Motor de mistura automatica e sugestoes de composicao.',
  },
  {
    id: 'laboratorio',
    icon: 'lab',
    color: '#06b6d4',
    title: 'Laboratorio',
    description: 'Laudos laboratoriais e recalibracao de coeficientes.',
  },
  {
    id: 'indicadores',
    icon: 'kpi',
    color: '#eab308',
    title: 'Indicadores',
    description: 'KPIs, estatisticas e analise de desvios.',
  },
  {
    id: 'custodia',
    icon: 'coc',
    color: '#ec4899',
    title: 'Cadeia de Custodia',
    description: 'Rastreabilidade completa do material desde a origem.',
  },
  {
    id: 'qualidade',
    icon: 'qc',
    color: '#14b8a6',
    title: 'Controle de Qualidade',
    description: 'Inspecoes, nao conformidades e acoes corretivas.',
  },
  {
    id: 'config',
    icon: 'cfg',
    color: '#64748b',
    title: 'Configuracoes',
    description: 'Parametros do sistema e regras de decisao.',
  },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ModuleCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionsService = inject(PermissionsService);

  selectedCard = signal<string | null>(null);

  user = this.authService.user;

  // Módulos filtrados por permissão do usuário
  modules = computed<ModuleCard[]>(() => {
    const visibleModuleIds = this.permissionsService.getVisibleModules();

    return ALL_MODULES.filter((m) => visibleModuleIds.includes(m.id)).map((m) => ({
      id: m.id,
      icon: m.icon,
      color: m.color,
      title: m.title,
      description: m.description,
      active: !!m.route, // Ativo se tem rota definida
    }));
  });

  // Rotas dos módulos
  private routes: Record<string, string> = {
    fornos: '/fornos',
  };

  getRoleLabel(): string {
    return this.authService.getRoleLabel(this.user()?.role || '');
  }

  onCardClick(id: string): void {
    const module = this.modules().find((m) => m.id === id);
    if (!module?.active) return;

    if (this.routes[id]) {
      this.router.navigate([this.routes[id]]);
    } else {
      this.selectedCard.set(this.selectedCard() === id ? null : id);
    }
  }
}
