import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  constructor(private swUpdate: SwUpdate) {}

  checkForUpdates(): void {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.checkForUpdate();

    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        this.swUpdate.activateUpdate().then(() => window.location.reload());
      }
    });

    setInterval(() => this.swUpdate.checkForUpdate(), 60 * 60 * 1000);
  }
}
