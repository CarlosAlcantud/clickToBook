import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthData } from "./auth-data.model";


@Injectable({providedIn: 'root'})
export class AuthService {

    constructor(private http:HttpClient) {}

    createUser(email: string, password: string, username: string, phone: string) {
        const authData: AuthData = {email: email, password: password, username: username, phone: phone};
        //console.log('email: ', email, 'password: ', password, 'username: ', username);
        this.http.post('http://localhost:3000/auth/singup', authData)
        .subscribe(response => {
            console.log("Function authservice.createUser()" + response);
        });

    }

    login(email: string, password: string) {
        const authData = {email: email, password: password};
        this.http.post('http://localhost:3000/auth/login',authData)
        .subscribe(response => {
            console.log("Login response: "+ response);
        });
    }

}