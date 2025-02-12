
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (
    
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> => {
        
        const authService = inject(AuthService);
        const isAuth = authService.getIsAuth();
        const router = inject(Router);
        if (!isAuth) {
            console.log("Llamo a guard: " + isAuth);
            router.navigate(['/auth/login']);

        }
        return isAuth;

    }

