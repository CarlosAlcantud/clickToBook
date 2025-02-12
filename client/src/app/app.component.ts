import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavBarComponent } from './nav-bar/nav-bar.component';

import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    RouterOutlet,
    NavBarComponent,
    CommonModule,
],
  templateUrl: './app.component.html', // aqui se podria poner el codigo html directamente y asi no se necesita el archivo html. 
  styleUrl: './app.component.css' // aqui se podria poner el codigo css directamente y asi no se necesita el archivo css.
})

export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    this.authService.autoAuthUser();
  }
  
}
