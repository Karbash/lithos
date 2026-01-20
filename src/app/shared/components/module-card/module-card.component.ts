import { Component, input, output } from '@angular/core';

export interface ModuleCard {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'app-module-card',
  standalone: true,
  templateUrl: './module-card.component.html',
  styleUrl: './module-card.component.scss',
})
export class ModuleCardComponent {
  card = input.required<ModuleCard>();
  selected = input(false);
  cardClick = output<string>();

  onClick(): void {
    this.cardClick.emit(this.card().id);
  }
}
