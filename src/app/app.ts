import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaUpdateService } from './core/services/pwa-update';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(private pwaUpdate: PwaUpdateService) {}

  ngOnInit(): void {
    this.pwaUpdate.checkForUpdates();
  }
}
