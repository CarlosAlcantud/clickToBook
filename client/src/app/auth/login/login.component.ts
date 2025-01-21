import {Component } from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'login',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent {
  constructor(public authService: AuthService) {}




  onLogin(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }
    this.authService.login(loginForm.value.email, loginForm.value.password);

  }
}