import { Component, input, output } from '@angular/core';
import { Furnace } from '../furnace-card/furnace-card.component';
import { MixtureBarComponent } from '../mixture-bar/mixture-bar.component';
import { RegistroTurno, LeituraTurno } from '../../../features/fornos/registros.service';
import { TurnoPainelComponent } from '../turno-painel/turno-painel.component';

@Component({
  selector: 'app-furnace-inspector',
  standalone: true,
  imports: [MixtureBarComponent, TurnoPainelComponent],
  templateUrl: './furnace-inspector.component.html',
  styleUrl: './furnace-inspector.component.scss',
})
export class FurnaceInspectorComponent {
  furnace = input.required<Furnace>();
  registroAberto = input<RegistroTurno | null>(null);
  canEdit = input<boolean>(false); // Permissão para editar forno
  closeInspector = output<void>();
  registrarTurno = output<void>();
  editarForno = output<string>();
  leituraRegistrada = output<{ fornoId: string; leitura: LeituraTurno }>();

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

  onLeituraRegistrada(leitura: LeituraTurno): void {
    this.leituraRegistrada.emit({ fornoId: this.furnace().id, leitura });
  }

  onEditarForno(): void {
    this.editarForno.emit(this.furnace().id);
  }
}
