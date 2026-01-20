import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-temperature-gauge',
  standalone: true,
  templateUrl: './temperature-gauge.component.html',
  styleUrl: './temperature-gauge.component.scss',
})
export class TemperatureGaugeComponent {
  temperature = input(0);
  min = input(0);
  max = input(1500);

  percentage = computed(() => {
    const range = this.max() - this.min();
    const value = Math.max(this.min(), Math.min(this.max(), this.temperature()));
    return ((value - this.min()) / range) * 100;
  });

  color = computed(() => {
    const pct = this.percentage();
    if (pct < 30) return '#3b82f6';
    if (pct < 60) return '#22c55e';
    if (pct < 80) return '#eab308';
    return '#ef4444';
  });
}
