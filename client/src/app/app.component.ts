import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateAppointmentComponent } from './appointments/create-appointment/create-appointment.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LoginComponent } from "./login/login.component";
import { CommonModule } from '@angular/common';
import { ShowAppointmentsComponent } from './appointments/show-appointments/show-appointments.component';
import { AppointmentsService } from './appointments/appointments.service';
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    RouterOutlet, 
    CreateAppointmentComponent, ShowAppointmentsComponent,
    NavBarComponent, 
    LoginComponent, 
    CommonModule],
  templateUrl: './app.component.html', // aqui se podria poner el codigo html directamente y asi no se necesita el archivo html. 
  styleUrl: './app.component.css' // aqui se podria poner el codigo css directamente y asi no se necesita el archivo css.
})

export class AppComponent{
  constructor(private appointmentsService: AppointmentsService) {}

  

  title = 'client';
  userIslogged = true;
}
