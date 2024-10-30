import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar/calendar.component';
import { HoursAvailableComponent } from "./hours-available/hours-available.component";
import { url } from 'node:inspector';
import { AppointmentsService } from '../appointments.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'create-appointment',
  standalone: true,
  imports: [FormsModule, CalendarComponent, HoursAvailableComponent, NgIf],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent implements OnInit {

    title = 'client';
    hour = '';
    date: Date | null  = null;
    // urlDate: string = '';
    // pruebaFecha: Date | null = null;
    appointment: Date | null = null;

    constructor(private appointmentsService: AppointmentsService) {}

    ngOnInit() {
        this.appointmentsService.dateSelected$.subscribe(date => {
            this.date = date;
        });
        
    }
    
    // dateAdded(date: Date) {
    //     this.date = date;

    // }


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
          this.appointment = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), parseInt(hours, 10), parseInt(minutes, 10));
          
      }
    }

}
