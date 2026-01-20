import { Component, input, output, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegistroTurno } from '../../../features/fornos/registros.service';

@Component({
  selector: 'app-turno-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './turno-modal.component.html',
  styleUrl: './turno-modal.component.scss',
})
export class TurnoModalComponent implements OnInit {
  fornoNome = input.required<string>();
  fornoId = input.required<string>();
  tenantId = input.required<string>();
  registroAberto = input<RegistroTurno | null>(null);

  closeModal = output<void>();
  iniciarTurno = output<Omit<RegistroTurno, 'id'>>();
  finalizarTurno = output<{ id: string; dados: Partial<RegistroTurno> }>();

  modo = signal<'iniciar' | 'finalizar'>('iniciar');

  formIniciar = new FormGroup({
    turno: new FormControl<'A' | 'B' | 'C'>('A', [Validators.required]),
    operador: new FormControl('', [Validators.required]),
    temperaturaInicio: new FormControl(0, [Validators.required, Validators.min(0)]),
    observacoes: new FormControl(''),
  });

  formFinalizar = new FormGroup({
    temperaturaFim: new FormControl(0, [Validators.required, Validators.min(0)]),
    producao: new FormControl(0, [Validators.required, Validators.min(0)]),
    observacoes: new FormControl(''),
  });

  ngOnInit(): void {
    if (this.registroAberto()) {
      this.modo.set('finalizar');
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onIniciar(): void {
    if (this.formIniciar.invalid) return;

    const agora = new Date();
    const registro: Omit<RegistroTurno, 'id'> = {
      fornoId: this.fornoId(),
      data: agora.toISOString().split('T')[0],
      turno: this.formIniciar.value.turno!,
      operador: this.formIniciar.value.operador!,
      horaInicio: agora.toTimeString().slice(0, 5),
      temperaturaInicio: this.formIniciar.value.temperaturaInicio!,
      observacoes: this.formIniciar.value.observacoes || undefined,
      status: 'aberto',
      tenantId: this.tenantId(),
    };

    this.iniciarTurno.emit(registro);
  }

  onFinalizar(): void {
    if (this.formFinalizar.invalid || !this.registroAberto()) return;

    const agora = new Date();
    const dados: Partial<RegistroTurno> = {
      horaFim: agora.toTimeString().slice(0, 5),
      temperaturaFim: this.formFinalizar.value.temperaturaFim!,
      producao: this.formFinalizar.value.producao!,
      observacoes: this.formFinalizar.value.observacoes || this.registroAberto()!.observacoes,
    };

    this.finalizarTurno.emit({ id: this.registroAberto()!.id!, dados });
  }
}
