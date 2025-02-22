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
    private isWorker = false;

    private authStatusListener = new BehaviorSubject<boolean>(this.isAuthenticated);
    private workerStatusListener = new BehaviorSubject<boolean>(this.isWorker);

    constructor(private http:HttpClient, private router: Router) {

        this.token = '';
        this.tokenTimer = setTimeout(() => {}, 0);
    }
    
    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getIsWorker() {
        return this.isWorker;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getWorkerStatusListener() {
        return this.workerStatusListener.asObservable();
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
        this.http.post<{token: string, expiresIn: number, worker:boolean}>('http://localhost:3000/auth/login',authData)
        .subscribe(response => {
            const token = response.token;
            console.log("Authenticated = " + token);
            if(token) {
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.token = token;
                const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
                this.saveAuthData(token, expirationDate, response.worker);
                console.log("Session expires's in: " + expirationDate);
                this.authStatusListener.next(true);
                this.workerStatusListener.next(response.worker);
                this.isWorker = response.worker;
                this.isAuthenticated = true;
                this.router.navigate(['/']);
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
                
                this.authStatusListener.next(true);
                this.isAuthenticated = true;
                if(authInformation.worker == 'true') {
                    this.isWorker = true;
                    this.workerStatusListener.next(true);
                }else{  
                    this.isWorker = false;
                    this.workerStatusListener.next(false);
                }         
                console.log("Este es el valor de worker cuando autoAuthUser() es llamado: " + authInformation.worker);
                console.log("Este es el valor con el que se queda worker despues de guardar el valor de localStorage: " + this.isWorker);
            } 
        }
        console.log("Los valores de worker y isAuthenticated son: " + this.isWorker + " " + this.isAuthenticated);
        
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
        this.isWorker = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
        
    }

    private saveAuthData(token: string, expirationDate: Date, worker:boolean) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('worker', worker.toString());
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('worker');
    }

    private getAuthData() {
        if(typeof localStorage === "undefined") return null;
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const worker = localStorage.getItem('worker');
        if(!token || !expirationDate || !worker) {
            return;
        }else{
            return {
                token: token,
                expirationDate: new Date(expirationDate),
                worker: worker
            }   
        }

    }

}