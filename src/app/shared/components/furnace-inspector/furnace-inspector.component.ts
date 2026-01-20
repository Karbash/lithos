import { Component, input, output } from '@angular/core';
import { Furnace } from '../furnace-card/furnace-card.component';
import { MixtureBarComponent } from '../mixture-bar/mixture-bar.component';
import { RegistroTurno } from '../../../features/fornos/registros.service';

@Component({
  selector: 'app-furnace-inspector',
  standalone: true,
  imports: [MixtureBarComponent],
  templateUrl: './furnace-inspector.component.html',
  styleUrl: './furnace-inspector.component.scss',
})
export class FurnaceInspectorComponent {
  furnace = input.required<Furnace>();
  registroAberto = input<RegistroTurno | null>(null);
  closeInspector = output<void>();
  registrarTurno = output<void>();

  onClose(): void {
    this.closeInspector.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  getStatusLabel(): string {
    const status = this.furnace().status;
    if (status === 'ativo') return 'Operando';
    if (status === 'manutencao') return 'Manutenção';
    return 'Inativo';
  }

  getAlertIcon(tipo: string): string {
    switch (tipo) {
      case 'temperatura':
        return 'T';
      case 'qualidade':
        return 'Q';
      case 'rendimento':
        return 'R';
      default:
        return 'M';
    }
  }

  onRegistrarTurno(): void {
    this.registrarTurno.emit();
  }
}
