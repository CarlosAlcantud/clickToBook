import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";
import { BehaviorSubject, Subject } from "rxjs";
import { Router } from "@angular/router";
@Injectable({providedIn: 'root'})
export class AuthService {
    private tokenTimer: ReturnType<typeof setTimeout>;
    private token: string;

   
    private isAuthenticated = false;
    private role = '';
    private isWorker = false;
    private isClient = false;
    private isAdmin = false;

    private authStatusListener = new BehaviorSubject<boolean>(this.isAuthenticated);
    private workerStatusListener = new BehaviorSubject<boolean>(this.isWorker);
    private clientStatusListener = new BehaviorSubject<boolean>(this.isClient);
    private adminStatusListener = new BehaviorSubject<boolean>(this.isAdmin);
    

    constructor(private http:HttpClient, private router: Router) {

        this.token = '';
        this.tokenTimer = setTimeout(() => {}, 0);
    }
    
    getUserRole(){
        return this.role;
    }
    
    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }
    
    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getWorkerStatusListener() {
        return this.workerStatusListener.asObservable();
    }

    getClientStatusListener() {
        return this.clientStatusListener.asObservable();
    }

    getAdminStatusListener() {
        return this.adminStatusListener.asObservable();
    }
    
    
    createUser(email: string, password: string, username: string, phone: string) {
        const authData: AuthData = {email: email, password: password, username: username, phone: phone};
        //console.log('email: ', email, 'password: ', password, 'username: ', username);
        this.http.post('http://localhost:3000/auth/singup', authData)
        .subscribe(response => {
            console.log("Function authservice.createUser()" + response);
        });

    }

    login(email: string, password: string) {
        console.log("Metodo/ login()");
        const authData = {email: email, password: password};
        this.http.post<{token: string, expiresIn: number}>('http://localhost:3000/auth/login',authData)
        .subscribe(response => {
            const token = response.token;
            console.log("Authenticated = " + token);
            if(token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.token = token;
                const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
                this.saveAuthData(token, expirationDate);
                console.log("Session expires's in: " + expirationDate);
                this.authStatusListener.next(true);
                this.setRoles(token);
                this.isAuthenticated = true;
                if(this.isWorker){
                    this.router.navigate(['/worker']);
                }
                else if(this.isClient){
                    this.router.navigate(['/']);
                }
                else{
                    this.router.navigate(['/']);
                }
            }
        });
    }

    autoAuthUser(){
        console.log("autoAuthUser()");
        const authInformation = this.getAuthData();
        const now = new Date(); 

        var expiresIn = 0;
        if(authInformation) {
            
            expiresIn = authInformation.expirationDate.getTime() - now.getTime();
            if(expiresIn > 0) { 

                this.token = authInformation.token;
                
                this.setAuthTimer(expiresIn / 1000);
                this.setRoles(this.token);
                this.authStatusListener.next(true);
                this.isAuthenticated = true;
               
            } 
        }
    }

    private setAuthTimer(duration: number) {
        console.log("Setting timer: " + duration);
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    logout() {
        this.token = '';
        this.isAuthenticated = false;
        this.role = '';
        this.authStatusListener.next(false);
        this.isWorker = false;
        this.workerStatusListener.next(false);
        this.isClient = false;
        this.clientStatusListener.next(false);
        this.isAdmin = false;
        this.adminStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
        
    }

    private setRoles(token: string) {
        console.log("setRoles()");
        console.log("El role antes de sacarlo: " + this.role);
        this.role = JSON.parse(atob(token.split('.')[1])).role;
        console.log("El Role es: " + this.role);
        if(this.role === 'worker') {
            this.isWorker = true;
            this.workerStatusListener.next(true);
        }
        if(this.role === 'client') {
            this.isClient = true;
            this.clientStatusListener.next(true);
        }
        if(this.role === 'admin') {
            this.isAdmin = true;
            this.adminStatusListener.next(true);
        }
    }
    private saveAuthData(token: string, expirationDate: Date) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
    }

    private getAuthData() {
        if(typeof localStorage === "undefined") return null;
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        if(!token || !expirationDate) {
            return;
        }else{
            return {
                token: token,
                expirationDate: new Date(expirationDate),

            }   
        }

    }

}