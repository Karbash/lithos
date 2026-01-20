import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth';
import { RegistrosService, RegistroTurno } from '../fornos/registros.service';
import { FornosService } from '../fornos/fornos.service';
import { Furnace } from '../../shared/components/furnace-card/furnace-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private registrosService = inject(RegistrosService);
  private fornosService = inject(FornosService);
  private router = inject(Router);

  user = this.authService.user;
  loading = signal(true);

  // Turno ativo
  turnoAtivo = signal<RegistroTurno | null>(null);
  fornoTurnoAtivo = signal<Furnace | null>(null);

  // Estatísticas
  estatisticas = signal<{
    totalTurnos: number;
    turnosFechados: number;
    producaoTotal: number;
    mediaProducao: number;
  } | null>(null);

  // Histórico de turnos
  historicoTurnos = signal<RegistroTurno[]>([]);

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const usuario = this.user();
    if (!usuario) {
      this.loading.set(false);
      return;
    }

    // Buscar turno ativo
    this.registrosService.getTurnoAtivoOperador(usuario.name).subscribe({
      next: (turno) => {
        this.turnoAtivo.set(turno);
        if (turno) {
          // Buscar dados do forno do turno ativo
          this.fornosService.getById(turno.fornoId).subscribe({
            next: (forno) => this.fornoTurnoAtivo.set(forno || null),
          });
        }
      },
    });

    // Buscar estatísticas
    this.registrosService.getEstatisticasOperador(usuario.name).subscribe({
      next: (stats) => {
        this.estatisticas.set(stats);
      },
    });

    // Buscar histórico
    this.registrosService.getByOperador(usuario.name).subscribe({
      next: (turnos) => {
        this.historicoTurnos.set(turnos.slice(0, 10)); // últimos 10
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getRoleLabel(role: string): string {
    return this.authService.getRoleLabel(role);
  }

  getTurnoLabel(turno: string): string {
    const labels: Record<string, string> = {
      A: '06:00 - 14:00',
      B: '14:00 - 22:00',
      C: '22:00 - 06:00',
    };
    return labels[turno] || turno;
  }

  getStatusClass(status: string): string {
    return status === 'aberto' ? 'status-aberto' : 'status-fechado';
  }

  irParaForno(fornoId: string): void {
    this.router.navigate(['/fornos'], { queryParams: { forno: fornoId } });
  }

  calcularTempoTurno(horaInicio: string): string {
    const [h, m] = horaInicio.split(':').map(Number);
    const inicio = new Date();
    inicio.setHours(h, m, 0, 0);

    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();

    if (diffMs < 0) return '0h 0min';

    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${horas}h ${minutos}min`;
  }
}
