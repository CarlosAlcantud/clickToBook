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

  appointments: Appointment[] = []; // Almacena los appointments y al ser del tipo Appointment no permite otros valores.
  private appointmentsSub: Subscription | undefined;

  constructor(public appointmentsService: AppointmentsService) {}

  ngOnInit() {
    this.appointmentsService.getAppointments();
    this.appointmentsSub = this.appointmentsService.getAppointmentUpdateListener()
      .subscribe((appointments: Appointment[]) => {
        this.appointments = appointments;
      });
  }

  ngOnDestroy() {
    if (this.appointmentsSub) {
      this.appointmentsSub.unsubscribe();
    }
  }

}
