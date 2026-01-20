import { Router, RedirectCommand, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../core/services/auth';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    const router = inject(Router);
    const url = router.parseUrl('/login');
    return new RedirectCommand(url);
  }
};
