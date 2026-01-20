import { Component, input } from '@angular/core';

export interface MixtureItem {
  nome: string;
  percentual: number;
  cor: string;
}

@Component({
  selector: 'app-mixture-bar',
  standalone: true,
  templateUrl: './mixture-bar.component.html',
  styleUrl: './mixture-bar.component.scss',
})
export class MixtureBarComponent {
  items = input<MixtureItem[]>([]);
}
