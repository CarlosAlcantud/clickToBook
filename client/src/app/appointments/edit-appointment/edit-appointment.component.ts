import { Component } from '@angular/core';
import { CalendarComponent } from '../create-appointment/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WorkerAppointment } from '../../appointments/workerAppointment.model';
import { HoursAvailableComponent } from '../create-appointment/hours-available/hours-available.component';
import { AppointmentsService } from '../appointments.service';
@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CalendarComponent, HoursAvailableComponent, CommonModule, RouterModule],
  templateUrl: './edit-appointment.component.html',
  styleUrl: './edit-appointment.component.css'
})
export class EditAppointmentComponent implements OnInit {
  
  public userName: string = 'John Doe';
  
  appointmentId   : string = '';
  appointmentDate : string = '';
  date: string = '';
  hourSelected = '';

  constructor(private route: ActivatedRoute, public appointmentsService: AppointmentsService) {
    // Aquí puedes inyectar servicios o realizar otras configuraciones necesarias
    this.appointmentsService.dateSelected$.subscribe(date => {
      this.date = date.toDateString();
      
    });
  }
  ngOnInit() {
    // Aquí puedes realizar la lógica de inicialización del componente
    // Por ejemplo, cargar datos desde un servicio o inicializar variables
    
      this.route.queryParams.subscribe(params => {
        this.appointmentId = params['appointmentId'];
        this.appointmentDate = params['appointmentDate'];
        this.userName = params['userName'];
        // Cargar datos con el ID
        this.hourSelected = '';
        // Convertir la fecha recibida en string a un objeto Date
      if (this.appointmentDate) {
        try {
          // Parsea la fecha del appointmentDate (asumiendo formato DD/MM/YYYY)
          const dateParts = this.appointmentDate.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-11
            const year = parseInt(dateParts[2]);
            
            const appointmentDateObj = new Date(year, month, day);
            
            // Emite la fecha para que el calendario la marque como seleccionada
            this.appointmentsService.emitDateSelected(appointmentDateObj);
          }
        } catch (error) {
          console.error('Error al convertir la fecha:', error);
        }
      }
      });
    
  }
  
  hourAdded(hour: string) {
    this.hourSelected = hour;
  }

  cancel(){
    this.hourSelected = '';
  }

  updateAppointment() {
  }
}
