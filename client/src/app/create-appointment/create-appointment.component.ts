import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar/calendar.component';
@Component({
  selector: 'create-appointment',
  standalone: true,
  imports: [FormsModule, CalendarComponent],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent {
    title = 'client';
    value = '';
    newAppointment = '';

    onCreateAppointment() {
      this.newAppointment = this.value;

    }

}
