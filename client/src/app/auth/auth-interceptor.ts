import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    console.log("Interceptor works!");

    const authService = inject(AuthService); // Inyectamos el servicio manualmente
    const authToken = authService.getToken();
    
    console.log("Interceptor Token:", authToken);

    if (!authToken) {
        console.warn("No Auth Token found, sending request without authentication.");
        return next(req);
    }

    const authRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${authToken}`
        }
    });

    return next(authRequest);
};