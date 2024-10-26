import { Component } from '@angular/core';
import { Appointment } from '../appointment.model';

@Component({
  selector: 'show-appointments',
  standalone: true,
  imports: [],
  templateUrl: './show-appointments.component.html',
  styleUrl: './show-appointments.component.css'
})
export class ShowAppointmentsComponent {
  appointments: Appointment[] = []; //Almacena los appointments y al ser del tipo Appointment no permite otros valores. 

  


}
