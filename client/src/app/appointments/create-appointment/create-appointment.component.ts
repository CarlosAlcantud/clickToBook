import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from './calendar/calendar.component';
import { HoursAvailableComponent } from "./hours-available/hours-available.component";
import { url } from 'node:inspector';
import { AppointmentsService } from '../appointments.service';
import { NgIf } from '@angular/common';
import { BookAppointmentComponent } from "./book-appointment/book-appointment.component";
import { ShowAppointmentsComponent } from "../show-appointments/show-appointments.component";
@Component({
  selector: 'create-appointment',
  standalone: true,
  imports: [FormsModule, CalendarComponent, HoursAvailableComponent, NgIf, BookAppointmentComponent],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent implements OnInit {

    title = 'client';
    hourSelected = '';
    date = new Date();
    // urlDate: string = '';
    // pruebaFecha: Date | null = null;
    appointment: Date | null = null;
    showComponent: boolean = false;

    constructor(private appointmentsService: AppointmentsService) {}

    ngOnInit() {
        this.appointmentsService.dateSelected$.subscribe(date => {
            this.date = date;
            console.log("La fecha es: "+this.date);
        });

        this.appointmentsService.showComponent$.subscribe(value => {
          this.showComponent = value;
        });
        
    }
    
    //Este metodo recibe la hora seleccionada que emite el componente hours-available y ka guarda en la variable hourSelected
    hourAdded(hour: string) {
      this.hourSelected = hour;
      this.addHourToDate();
    }
    
    addHourToDate() {
        if (this.date && this.hourSelected != '') {
          const [time, modifier] = this.hourSelected.split(' ');
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
