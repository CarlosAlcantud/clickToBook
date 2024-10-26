import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar/calendar.component';
import { HoursAvailableComponent } from "./hours-available/hours-available.component";
@Component({
  selector: 'create-appointment',
  standalone: true,
  imports: [FormsModule, CalendarComponent, HoursAvailableComponent],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent {
    title = 'client';
    hour = '';
    date: Date | null  = null;
    
    dateAdded(date: Date) {
        this.date = date;
    }

    hourAdded(time: string) {
      this.hour = time;
      this.addHourToDate();
    }
    
    addHourToDate() {
        if (this.date && this.hour != '') {
          const [time, modifier] = this.hour.split(' ');
          let [hours, minutes] = time.split(':');
          if (modifier === 'pm' && hours !== '12') {
              hours = (parseInt(hours, 10) + 12).toString();
          }
          if (modifier === 'am' && hours === '12') {
              hours = '00';
          }
          this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), parseInt(hours, 10), parseInt(minutes, 10));
          
      }
    }

}
