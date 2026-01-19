import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

interface Card {
  id: string;
  color: string;
  title: string;
  version: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  selectedCard: string | null = null;

  cards: Card[] = [
    {
      id: 'inventory',
      color: '#3b82f6',
      title: 'Gestão de Estoque',
      version: 'v1.0.0',
      description:
        'Controle completo de inventário, entradas e saídas de produtos com relatórios detalhados.',
      active: true,
    },
    {
      id: 'sales',
      color: '#22c55e',
      title: 'Vendas e Pedidos',
      version: 'v1.0.0',
      description: 'Gerencie vendas, pedidos e acompanhe o desempenho comercial em tempo real.',
      active: true,
    },
    {
      id: 'reports',
      color: '#a855f7',
      title: 'Relatórios e Analytics',
      version: 'v1.0.0',
      description: 'Dashboards interativos e relatórios personalizados para tomada de decisão.',
      active: false,
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  selectCard(id: string): void {
    this.selectedCard = this.selectedCard === id ? null : id;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
