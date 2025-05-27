import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";
import { BehaviorSubject, Subject } from "rxjs";
import { Router } from "@angular/router";
import { Worker} from "./worker.model";
import { map } from "rxjs/operators";
import { Client } from "./client.model";
import { error } from "node:console";


@Injectable({providedIn: 'root'})
export class AuthService {
    private tokenTimer: ReturnType<typeof setTimeout>;
    private token: string;
    private client: Client = {clientId: '', username: '', clientWorker: '', classes: 0};
   
    private isAuthenticated = false;
    private role = '';
    private isWorker = false;
    private isClient = false;
    private isAdmin = false;

    // Observable para notificar cambios en el cliente seleccionado
    private clientSelectedSource = new Subject<Client>();
    public clientSelected$ = this.clientSelectedSource.asObservable();
    

    private authStatusListener = new BehaviorSubject<boolean>(this.isAuthenticated);
    private workerStatusListener = new BehaviorSubject<boolean>(this.isWorker);
    private clientStatusListener = new BehaviorSubject<boolean>(this.isClient);
    private adminStatusListener = new BehaviorSubject<boolean>(this.isAdmin);
    
    workers: Worker[] = [];
    private workerUpdate = new Subject<Worker[]>();

    clients: Client[] = [];
    private clientUpdate = new Subject<Client[]>();

    constructor(private http:HttpClient, private router: Router) {
        this.token = '';
        this.tokenTimer = setTimeout(() => {}, 0);
    }
    
    getUserRole(){
        return this.role;
    }

    getIsWorker() { 
        return this.isWorker;
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
    
    private clientDataReadySource = new BehaviorSubject<boolean>(false);
    clientDataReady$ = this.clientDataReadySource.asObservable();


    
    createUser(password: string, username: string, phone: string, workerId: string) {
        console.log("El valor del workerId cuando se va a crear el alumno es: " + workerId);
        const authData: AuthData = {password: password, username: username, phone: phone, worker: workerId};
        //console.log('email: ', email, 'password: ', password, 'username: ', username);
        this.http.post('http://localhost:3000/auth/singup', authData)
        .subscribe(response => {
            console.log("Function authservice.createUser()" + response);
        });

    }

    login(identifier: string, password: string) {
        console.log("Metodo/ login()");
        const authData = {identifier: identifier, password: password};
        this.http.post<{token: string, expiresIn: number}>('http://localhost:3000/auth/login', authData)
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

    getClient() {
        return this.client;
    }   

    setClient(client: Client) {
        this.client = client;
        //Emite los cambios en el cliente 
        this.clientSelectedSource.next(client);
    }

    updateClientClasses(method: string) {
        console.log("updateClientClasses() - se acutalizan las clases del cliente");
        if(this.client.classes !== undefined && this.client.classes >= 0){
            if(method === 'deleteAppointment') {
                this.client.classes = this.client.classes + 1;
            }else if(method === 'createAppointment') {
                this.client.classes = this.client.classes - 1;
            }

            
        }
        console.log("El cliente tiene " + this.client.classes + " clases");
 
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
        this.client = {clientId: '', username: '', clientWorker: '', classes: 0};
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
            this.client.username = JSON.parse(atob(token.split('.')[1])).username;
            this.client.clientId = JSON.parse(atob(token.split('.')[1])).userId;
            this.client.clientWorker = JSON.parse(atob(token.split('.')[1])).worker;
            console.log(this.client.username + "recuperamos las clases. " + this.client.clientId , this.client.clientWorker);
            // Prueba para esperar a que los datos esten listos. 
            this.getClientClasses().then(classes => {
                this.client.classes = classes;
                this.clientDataReadySource.next(true); // Señal de que los datos están listos
            }).catch(error => {
                console.error('Error getting client classes:', error);
            });
            console.log("Aqui el valor de worker es : " + this.isWorker + "Y el valor que devuelve: "+ this.getWorkerStatusListener());
            console.log("El cliente es: " + this.client.username + " y sus clases: " + this.client.classes);
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

    getWorkerUpdateListener() {
        return this.workerUpdate.asObservable();
    }

    getClientUpdateListener() {
        return this.clientUpdate.asObservable();
    }

    fetchClients() {
        console.log("fetchClients()");
        this.http.get<Client[]>('http://localhost:3000/users')
        .subscribe(
            clients => {
                this.clients = clients;
                this.clientUpdate.next([...this.clients]);
            },
            error => {
                console.error('Error fetching clients:', error);
            }
        );
    }

    fetchWorkers() {
        console.log("fetchWorkers()");
        this.http.get<any[]>('http://localhost:3000/workers')
        .pipe(
            map((workers) => {
                // Now workers is directly the array of worker objects
                return workers.map(worker => {
                    return {
                        id: worker._id,
                        username: worker.username,
                        email: worker.email,
                        phone: worker.telephone, // Note the possible difference in property name
                        role: worker.role
                    };
                });
            })
        ).subscribe(
            workers => {
                this.workers = workers;
                this.workerUpdate.next([...this.workers]);
            },
            error => {
                console.error('Error fetching workers:', error);
            }
        );
    }

    getClientClasses(): Promise<number> {
    console.log("getClientClasses() - Devolvemos las clases del cliente: " + this.client.username);
    
    return new Promise((resolve, reject) => {
        this.http.get<{classes: number}>(
            "http://localhost:3000/user/classes", 
            {params: {clientId: this.client.clientId}}
        ).subscribe(
            response => {
                resolve(response.classes);
            },
            error => {
                console.error('Error fetching classes:', error);
                reject(error);
            }
        );
    });
}

    addClasses(classes: number) {
        const data = {
            userId: this.getClient().clientId,
            classes: classes
        };
        console.log("El id del cliente es: " + this.getClient().clientId + " y el numero de clases es: " + classes);
        return this.http.patch<{message: string, user: Client}>(
            "http://localhost:3000/user/addClasses", data
        );
    }

    createSchedules() {

        return this.http.post<{message: string}>(
            "http://localhost:3000/schedule/bulk", {}
        );
    }

}