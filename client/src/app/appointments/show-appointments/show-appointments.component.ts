import { Component, OnDestroy, OnInit } from '@angular/core';
import { Appointment } from '../appointment.model';
import { AppointmentsService } from '../appointments.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'show-appointments',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './show-appointments.component.html',
  styleUrl: './show-appointments.component.css'
})
export class ShowAppointmentsComponent implements OnInit, OnDestroy{

  appointments: Appointment[] = []; //Almacena los appointments y al ser del tipo Appointment no permite otros valores. 
   //Almacena el servicio de AppointmentsService
  private appointmentsSub!: Subscription; 

  constructor(public appointmentsService: AppointmentsService) {
  }
  ngOnInit(){
    this.appointmentsService.getAppointments().subscribe((data: Appointment[]) => {
      this.appointments = data;
    }); 
    // this.appointmentsService.getAppointments(); //Obtiene los appointments del servicio Appointments
    // this.appointmentsSub = this.appointmentsService.getAppointmentUpdateListener()
    // .subscribe((appointments: Appointment[]) => {
    //   this.appointments = appointments;
    // });
  }

  ngOnDestroy(){
    //this.appointmentsSub.unsubscribe(); 
  }

}
