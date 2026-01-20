import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

/**
 * Layout principal da aplicação - VS Code Style
 *
 * Fornece o layout base com header, main content e footer
 * idêntico ao Visual Studio Code, ocupando toda a tela.
 *
 * @example
 * ```html
 * <app-main-layout>
 *   <!-- Conteúdo será renderizado aqui -->
 * </app-main-layout>
 * ```
 */
@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    /** Título da aplicação exibido na title bar */
    appTitle = 'Lithos';

    /** Status de conectividade */
    isOnline = navigator.onLine;

    /** Cache disponível */
    hasCache = false;

    /** Versão da aplicação */
    appVersion = 'v1.0.0';

    /** Ano atual para direitos autorais */
    currentYear = new Date().getFullYear();

    /** Nome da empresa */
    companyName = 'Silver Lake';

    /** Texto completo dos direitos autorais */
    copyrightText = `${this.companyName} @ ${this.currentYear} - Todos os direitos reservados`;

    /** Usuário logado (mock) */
    user: { name: string; email: string } | null = { name: 'João Silva', email: 'joao@email.com' };

    /** Estado do menu do usuário */
    menuOpen = false;

    /** Listener para mudanças de conectividade */
    private onlineListener: (() => void) | null = null;
    private offlineListener: (() => void) | null = null;

    /**
     * @param router Serviço de roteamento do Angular
     */
    constructor(private router: Router) { }

    ngOnInit(): void {
        // Monitora status de conectividade
        this.onlineListener = () => this.isOnline = true;
        this.offlineListener = () => this.isOnline = false;

        window.addEventListener('online', this.onlineListener);
        window.addEventListener('offline', this.offlineListener);

        // Fecha menu ao clicar fora
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-menu')) {
                this.menuOpen = false;
            }
        });

        // Verifica se tem cache disponível
        this.checkCacheAvailability();
    }

    ngOnDestroy(): void {
        // Remove listeners
        if (this.onlineListener) {
            window.removeEventListener('online', this.onlineListener);
        }
        if (this.offlineListener) {
            window.removeEventListener('offline', this.offlineListener);
        }
    }

    /**
     * Verifica se o Cache API está disponível
     */
    private async checkCacheAvailability(): Promise<void> {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                this.hasCache = cacheNames.length > 0;
            } catch {
                this.hasCache = false;
            }
        } else {
            this.hasCache = false;
        }
    }

    /**
     * Retorna ícone e texto para status de conectividade
     */
    get connectivityStatus(): { colorClass: string; text: string } {
        return this.isOnline
            ? { colorClass: 'status-green', text: 'Online' }
            : { colorClass: 'status-red', text: 'Offline' };
    }
    /**
     * Retorna classe de cor e texto para status de cache
     */
    get cacheStatus(): { colorClass: string; text: string } {
        return this.hasCache
            ? { colorClass: 'status-green', text: 'Cache disponível' }
            : { colorClass: 'status-red', text: 'Cache indisponível' };
    }

    /**
     * Alterna a visibilidade do menu do usuário
     */
    toggleMenu(): void {
        this.menuOpen = !this.menuOpen;
    }

    /**
     * Navega para a página de perfil
     */
    goToProfile(): void {
        this.menuOpen = false;
        // Navega para a página de perfil
        this.router.navigate(['/perfil']);
    }

    /**
     * Faz logout do usuário
     */
    logout(): void {
        this.menuOpen = false;
        // Remove dados do usuário
        this.user = null;
        // Redireciona para página de login
        this.router.navigate(['/login']);
    }
}
