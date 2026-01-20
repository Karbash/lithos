import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  appTitle = 'Lithos';
  appVersion = 'v1.0.0';
  copyrightText = `Silver Lake @ ${new Date().getFullYear()}`;

  isOnline = signal(navigator.onLine);
  hasCache = signal(false);
  menuOpen = signal(false);

  user = this.authService.user;

  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;
  private clickOutsideListener: ((e: MouseEvent) => void) | null = null;

  connectivityStatus = computed(() =>
    this.isOnline()
      ? { colorClass: 'status-online', text: 'Online' }
      : { colorClass: 'status-offline', text: 'Offline' },
  );

  cacheStatus = computed(() =>
    this.hasCache()
      ? { colorClass: 'status-online', text: 'Cache' }
      : { colorClass: 'status-offline', text: 'Sem Cache' },
  );

  ngOnInit(): void {
    this.onlineListener = () => this.isOnline.set(true);
    this.offlineListener = () => this.isOnline.set(false);

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);

    this.clickOutsideListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.menuOpen.set(false);
      }
    };
    document.addEventListener('click', this.clickOutsideListener);

    this.checkCacheAvailability();
  }

  ngOnDestroy(): void {
    if (this.onlineListener) window.removeEventListener('online', this.onlineListener);
    if (this.offlineListener) window.removeEventListener('offline', this.offlineListener);
    if (this.clickOutsideListener) document.removeEventListener('click', this.clickOutsideListener);
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

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  goToProfile(): void {
    this.menuOpen.set(false);
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
