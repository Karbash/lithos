import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallService } from '../../core/services/pwa-install';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  appTitle = 'Lithos';
  appVersion = 'v1.0.0';
  copyrightText = `Silver Lake @ ${new Date().getFullYear()}`;

  isOnline = signal(false);
  hasCache = signal(false);
  canInstall = signal(false);

  constructor(private pwaInstall: PwaInstallService) {}

  private connectivityInterval: ReturnType<typeof setInterval> | null = null;
  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;

  connectivityStatus = computed(() =>
    this.isOnline()
      ? { colorClass: 'status-online', text: 'Online' }
      : { colorClass: 'status-offline', text: 'Offline' },
  );

  cacheStatus = computed(() =>
    this.hasCache()
      ? { colorClass: 'status-online', text: 'Cache' }
      : { colorClass: 'status-offline', text: 'No Cache' },
  );

  ngOnInit(): void {
    this.checkRealConnectivity();
    this.connectivityInterval = setInterval(() => this.checkRealConnectivity(), 5000);

    this.onlineListener = () => this.checkRealConnectivity();
    this.offlineListener = () => this.isOnline.set(false);

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);

    this.checkCacheAvailability();

    this.pwaInstall.installPromptAvailable$.subscribe((available) => {
      this.canInstall.set(available);
    });
  }

  installApp(): void {
    this.pwaInstall.promptInstall();
  }

  ngOnDestroy(): void {
    if (this.connectivityInterval) clearInterval(this.connectivityInterval);
    if (this.onlineListener) window.removeEventListener('online', this.onlineListener);
    if (this.offlineListener) window.removeEventListener('offline', this.offlineListener);
  }

  private async checkRealConnectivity(): Promise<void> {
    if (!navigator.onLine) {
      this.isOnline.set(false);
      return;
    }

    try {
      await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
      });
      this.isOnline.set(true);
    } catch {
      this.isOnline.set(false);
    }
  }

  private async checkCacheAvailability(): Promise<void> {
    if (!('caches' in window)) {
      this.hasCache.set(false);
      return;
    }

    try {
      const cacheNames = await caches.keys();
      this.hasCache.set(cacheNames.length > 0);
    } catch {
      this.hasCache.set(false);
    }
  }
}
