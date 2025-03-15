import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from "../../appointments/create-appointment/calendar/calendar.component";
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../appointments/appointments.service';


@Component({
  selector: 'app-worker-appointments',
  standalone: true,
  imports: [
      CommonModule,
      CalendarComponent],
  templateUrl: './worker-appointments.component.html',
  styleUrl: './worker-appointments.component.css'
})
export class WorkerAppointmentsComponent{
  
  
  public fecha: String = '';
  constructor(public appointmentsService: AppointmentsService) { }
  
  ngOnInit() {
    // this.appointmentsService.dateSelected$.subscribe(date => {
    //   this.fecha = this.appointmentsService.formatDateToLocalString(date);
    // });
    this.appointmentsService.completedDate$.subscribe(date => {
      this.fecha = date;
    
    });
  }
}
