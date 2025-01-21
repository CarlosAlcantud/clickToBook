import {Component } from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
    selector: 'signup',
    standalone: true,
    imports: [FormsModule, NgIf],
    templateUrl: './singup.component.html',
    styleUrl: './singup.component.css'
})

export class SingUpComponent {
  
  
    constructor(public authService: AuthService) {}




  onSingUp(singupForm: NgForm) {
    if (singupForm.invalid) {
      return;
    }
    this.authService.createUser(singupForm.value.email, singupForm.value.password, singupForm.value.username, singupForm.value.phone);



  }
}