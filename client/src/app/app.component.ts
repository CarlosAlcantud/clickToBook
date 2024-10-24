import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LoginComponent } from "./login/login.component";
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, CreateAppointmentComponent, NavBarComponent, LoginComponent],
  templateUrl: './app.component.html', // aqui se podria poner el codigo html directamente y asi no se necesita el archivo html. 
  styleUrl: './app.component.css' // aqui se podria poner el codigo css directamente y asi no se necesita el archivo css.
})

export class AppComponent {
  title = 'client';
}
