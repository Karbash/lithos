import { Component, inject, signal, OnInit } from '@angular/core';
import { FornosService } from './fornos.service';
import { RegistrosService, RegistroTurno } from './registros.service';
import {
  FurnaceCardComponent,
  Furnace,
} from '../../shared/components/furnace-card/furnace-card.component';
import { FurnaceInspectorComponent } from '../../shared/components/furnace-inspector/furnace-inspector.component';
import { TurnoModalComponent } from '../../shared/components/turno-modal/turno-modal.component';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-fornos',
  standalone: true,
  imports: [
    FurnaceCardComponent,
    FurnaceInspectorComponent,
    TurnoModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './fornos.component.html',
  styleUrl: './fornos.component.scss',
})
export class FornosComponent implements OnInit {
  private fornosService = inject(FornosService);
  private registrosService = inject(RegistrosService);

  fornos = signal<Furnace[]>([]);
  loading = signal(true);
  showModal = signal(false);
  showTurnoModal = signal(false);
  editingId = signal<string | null>(null);
  selectedFurnace = signal<Furnace | null>(null);
  registroAberto = signal<RegistroTurno | null>(null);

  form = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    planta: new FormControl('', [Validators.required]),
    tipo: new FormControl('', [Validators.required]),
    capacidade: new FormControl(0, [Validators.required, Validators.min(1)]),
    status: new FormControl<'ativo' | 'inativo' | 'manutencao'>('ativo', [Validators.required]),
    temperaturaAtual: new FormControl(0, [Validators.required]),
    temperaturaMeta: new FormControl(1250, [Validators.required]),
    rendimentoMeta: new FormControl(90, [Validators.required]),
  });

  ngOnInit(): void {
    this.loadFornos();
  }

  loadFornos(): void {
    this.loading.set(true);
    this.fornosService.getAll().subscribe({
      next: (data) => {
        this.fornos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openInspector(id: string): void {
    const forno = this.fornos().find((f) => f.id === id);
    if (forno) {
      this.selectedFurnace.set(forno);
      this.loadRegistroAberto(id);
    }
  }

  closeInspector(): void {
    this.selectedFurnace.set(null);
    this.registroAberto.set(null);
  }

  loadRegistroAberto(fornoId: string): void {
    this.registrosService.getAberto(fornoId).subscribe({
      next: (registros) => {
        this.registroAberto.set(registros.length > 0 ? registros[0] : null);
      },
    });
  }

  openTurnoModal(): void {
    this.showTurnoModal.set(true);
  }

  closeTurnoModal(): void {
    this.showTurnoModal.set(false);
  }

  onIniciarTurno(registro: Omit<RegistroTurno, 'id'>): void {
    this.registrosService.iniciarTurno(registro).subscribe({
      next: (novoRegistro) => {
        this.registroAberto.set(novoRegistro);
        this.closeTurnoModal();
        this.loadFornos();
      },
    });
  }

  onFinalizarTurno(event: { id: string; dados: Partial<RegistroTurno> }): void {
    this.registrosService.finalizarTurno(event.id, event.dados).subscribe({
      next: () => {
        this.registroAberto.set(null);
        this.closeTurnoModal();
        this.loadFornos();
      },
    });
  }

  openModal(id?: string): void {
    if (id) {
      this.editingId.set(id);
      const forno = this.fornos().find((f) => f.id === id);
      if (forno) {
        this.form.patchValue({
          nome: forno.nome,
          planta: forno.planta,
          tipo: forno.tipo,
          capacidade: forno.capacidade,
          status: forno.status,
          temperaturaAtual: forno.temperaturaAtual,
          temperaturaMeta: forno.temperaturaMeta,
          rendimentoMeta: forno.rendimentoMeta,
        });
      }
    } else {
      this.editingId.set(null);
      this.form.reset({
        status: 'ativo',
        temperaturaAtual: 0,
        capacidade: 0,
        temperaturaMeta: 1250,
        rendimentoMeta: 90,
      });
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const data = {
      nome: this.form.value.nome ?? '',
      planta: this.form.value.planta ?? '',
      tipo: this.form.value.tipo ?? '',
      capacidade: this.form.value.capacidade ?? 0,
      status: this.form.value.status ?? 'ativo',
      temperaturaAtual: this.form.value.temperaturaAtual ?? 0,
      temperaturaMeta: this.form.value.temperaturaMeta ?? 1250,
      temperaturaHistorico: [],
      rendimentoAtual: 0,
      rendimentoMeta: this.form.value.rendimentoMeta ?? 90,
      desvioMeta: 0,
      mediaMovel: 0,
      desvioPadrao: 0,
      mistura: [],
      alertas: [],
      tenantId: '1',
    };

    if (this.editingId()) {
      this.fornosService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.closeModal();
          this.loadFornos();
        },
      });
    } else {
      this.fornosService.create(data).subscribe({
        next: () => {
          this.closeModal();
          this.loadFornos();
        },
      });
    }
  }

  onCardClick(id: string): void {
    this.openInspector(id);
  }

  onEditClick(id: string): void {
    this.openModal(id);
  }

  get totalFornos(): number {
    return this.fornos().length;
  }

  get fornosAtivos(): number {
    return this.fornos().filter((f) => f.status === 'ativo').length;
  }

  get alertasCriticos(): number {
    return this.fornos().reduce(
      (acc, f) => acc + (f.alertas?.filter((a) => a.severidade === 'critical').length ?? 0),
      0,
    );
  }
}
