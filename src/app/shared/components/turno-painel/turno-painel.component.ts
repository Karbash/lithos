import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegistroTurno, LeituraTurno, RegistrosService } from '../../../features/fornos/registros.service';

@Component({
  selector: 'app-turno-painel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turno-painel.component.html',
  styleUrl: './turno-painel.component.scss',
})
export class TurnoPainelComponent implements OnInit {
  registro = input.required<RegistroTurno>();
  fornoNome = input.required<string>();
  temperaturaAtual = input<number>(0);

  leituraRegistrada = output<LeituraTurno>();
  finalizarTurno = output<void>();

  mostrarFormLeitura = signal(false);
  registrando = signal(false);

  formLeitura = new FormGroup({
    temperatura: new FormControl<number>(0, [Validators.required, Validators.min(0), Validators.max(2000)]),
    observacao: new FormControl(''),
  });

  estatisticas = computed(() => {
    return this.registrosService.calcularEstatisticasTurno(this.registro().id!);
  });

  tempoDecorrido = computed(() => {
    const inicio = this.registro().horaInicio;
    if (!inicio) return '0h 0min';

    const [h, m] = inicio.split(':').map(Number);
    const inicioDate = new Date();
    inicioDate.setHours(h, m, 0, 0);

    const agora = new Date();
    const diffMs = agora.getTime() - inicioDate.getTime();

    if (diffMs < 0) return '0h 0min';

    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHoras}h ${diffMinutos}min`;
  });

  constructor(private registrosService: RegistrosService) {}

  ngOnInit(): void {
    // Preenche temperatura atual como sugestão
    if (this.temperaturaAtual()) {
      this.formLeitura.patchValue({ temperatura: this.temperaturaAtual() });
    }
  }

  abrirFormLeitura(): void {
    this.formLeitura.patchValue({ temperatura: this.temperaturaAtual(), observacao: '' });
    this.mostrarFormLeitura.set(true);
  }

  cancelarLeitura(): void {
    this.mostrarFormLeitura.set(false);
    this.formLeitura.reset();
  }

  registrarLeitura(): void {
    if (this.formLeitura.invalid || !this.registro().id) return;

    this.registrando.set(true);

    const temperatura = this.formLeitura.value.temperatura!;
    const observacao = this.formLeitura.value.observacao || undefined;

    this.registrosService.registrarLeitura(this.registro().id!, temperatura, observacao).subscribe({
      next: (leitura) => {
        if (leitura) {
          this.leituraRegistrada.emit(leitura);
        }
        this.mostrarFormLeitura.set(false);
        this.formLeitura.reset();
        this.registrando.set(false);
      },
      error: () => {
        this.registrando.set(false);
      },
    });
  }

  onFinalizarTurno(): void {
    this.finalizarTurno.emit();
  }

  getTurnoLabel(turno: string): string {
    switch (turno) {
      case 'A':
        return 'Turno A (06:00 - 14:00)';
      case 'B':
        return 'Turno B (14:00 - 22:00)';
      case 'C':
        return 'Turno C (22:00 - 06:00)';
      default:
        return turno;
    }
  }
}
