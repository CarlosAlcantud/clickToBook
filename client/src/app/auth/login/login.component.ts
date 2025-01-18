import {Component } from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'login',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})

export class LoginComponent {
  constructor() {}




  onLogin(loginForm: NgForm) {
    console.log(loginForm.value);



  }
}