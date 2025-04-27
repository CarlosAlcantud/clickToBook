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
  
  message: string = 'Editando la cita de ';
  
  appointmentId   : string = '';
  appointmentDate : string = '';
  fecha: string = '';
  date: Date = new Date();
  hourSelected = '';
  rawDate: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    public appointmentsService: AppointmentsService) {
    // Aquí puedes inyectar servicios o realizar otras configuraciones necesarias
    this.appointmentsService.dateSelected$.subscribe(date => {
      this.fecha = date.toDateString();
      this.date = date;
      
    });
  }
  ngOnInit() {
    // Aquí puedes realizar la lógica de inicialización del componente
    // Por ejemplo, cargar datos desde un servicio o inicializar variables
    
      this.route.queryParams.subscribe(params => {
        this.appointmentId = params['appointmentId'];
        this.appointmentDate = params['appointmentDate'];
        this.message + params['partMessage'];
        this.rawDate = params['rawDate'];
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

  volver() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  updateAppointment() {
    console.log('Actualizando cita... ');
    console.log('El formato de la fecha que estoy suscrito es ' + this.date + ' y la fecha que estoy pasando es ' + this.fecha);
    const date = this.appointmentsService.formatDateForDatabase(this.date, this.hourSelected);
    console.log('El valor final para la fecha sera : ' + date);
    console.log('El id de la cita es: ' + this.appointmentId);
    
    this.appointmentsService.updateAppointment(this.appointmentId, date, this.rawDate)
    .subscribe({
      next: (response) => {
        // Muestra un mensaje de éxito
        alert(response.message);
        // Solo navega si la actualización fue exitosa
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        // Muestra el mensaje de error
        console.error('Error al actualizar la cita:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('Error al actualizar la cita');
        }
      }
    });
  }
}
