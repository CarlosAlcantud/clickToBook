
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
        const userRole = authService.getUserRole();

        const allowedRoles = route.data['roles'] as string[];

        const router = inject(Router);

        if (!isAuth) {
            //window.alert("No estás logueado");
            console.log("Llamo a guard: " + isAuth);
            router.navigate(['/auth/login']);
            return isAuth;
        }

        if (allowedRoles && !allowedRoles.includes(userRole)){
            //window.alert("No estás autorizado para acceder a esta página");
            router.navigate(['/']);
            return true;
        }

        return isAuth;

    }

