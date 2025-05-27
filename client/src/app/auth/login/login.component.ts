import {Component } from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'login',
    standalone: true,
    imports: [FormsModule, NgIf, NgClass],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent {
  constructor(public authService: AuthService) {}


  userExists: boolean = true; // Variable para controlar la existencia del usuario
  userMessage: string = ''; // Mensaje para mostrar al usuario
  formnotValid: boolean = false; // Variable para controlar la validez del formulario
  wrongPassword: boolean = false; // Variable para controlar si la contraseña es incorrecta

  onLogin(form: NgForm) {
    if (form.invalid) {
        this.formnotValid = true; // Cambia el estado si el formulario es inválido
        return;
    }
    
    this.authService.login(form.value.identifier, form.value.password)
        .subscribe({
            next: (response) => {
                if (response.success) {
                    console.log('Login exitoso:', response.message);
                    // Aquí puedes mostrar un mensaje de éxito si lo deseas
                } else {
                    console.log('Error en login:', response.message);
                    // Aquí puedes mostrar el mensaje de error al usuario
                }
            },
            error: (error) => {
                console.error('Error en la petición:', error.error.message);
                this.userMessage = error.error.message;
                if (this.userMessage === 'El usuario no existe') {
                  this.userExists = false;
                }
                else if (this.userMessage === 'Contraseña incorrecta') {
                  this.wrongPassword = true;
                }

                 // Cambia el estado si hay un error
                 // Guarda el mensaje de error
                // Aquí puedes manejar errores de red u otros errores
            }
        });
}
clearError() {
        this.userExists = true;
        this.formnotValid = false;
        this.userMessage = '';
        this.wrongPassword = false; // Resetea el estado de la contraseña incorrecta
    }
}