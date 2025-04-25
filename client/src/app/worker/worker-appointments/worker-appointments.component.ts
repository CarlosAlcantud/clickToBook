import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarComponent } from "../../appointments/create-appointment/calendar/calendar.component";
import { CommonModule, formatDate } from '@angular/common';
import { AppointmentsService } from '../../appointments/appointments.service';
import { Appointment } from '../../appointments/appointment.model';
import { Subscription } from 'rxjs';
import { WorkerAppointment } from '../../appointments/workerAppointment.model';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-worker-appointments',
  standalone: true,
  imports: [
      CommonModule,
      CalendarComponent, 
      RouterOutlet,
      RouterModule],
  templateUrl: './worker-appointments.component.html',
  styleUrl: './worker-appointments.component.css'
})
export class WorkerAppointmentsComponent implements OnInit{
  
  public fechaCompleta: String = this.appointmentsService.formatDate(new Date()); // Fecha actual
  public fecha: String = new Date().toLocaleDateString(); // Fecha actual
  workerAppointments: WorkerAppointment[] = []; // Almacena los appointments y al ser del tipo Appointment no permite otros valores.
  private appointmentsSub!: Subscription;
  show: boolean = true; // Variable para mostrar/ocultar el calendario
  expandedIndex: number | null = null; // Índice del botón expandido

  expand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  constructor(public appointmentsService: AppointmentsService) {
    this.appointmentsService.dateSelected$.subscribe(date => {
      this.fecha = date.toLocaleDateString();
      // this.fechaCompleta = this.formatDate(date);
      this.fechaCompleta = this.appointmentsService.formatDate(date);
    });

  }
  
  ngOnInit() {
    
    this.appointmentsService.getWorkerAppointments(this.fecha);
    
    this.appointmentsSub = this.appointmentsService.getWorkerAppointmentUpdateListener()
      .subscribe((appointments: WorkerAppointment[]) => {
        //console.log("Los appointments son: " + appointments);
        this.workerAppointments = appointments;
      });
  }

  ngOnDestroy() {
    if (this.appointmentsSub) {
      this.appointmentsSub.unsubscribe();
    }
    
  }

  editAppointment(appointment: WorkerAppointment) {
    // Aquí puedes implementar la lógica para editar la cita
    console.log('Editando cita:');
    console.log('Editando cita:', appointment);
    this.show = false; // Oculta el calendario al editar una cita

  }

  deleteAppointment (appointment: WorkerAppointment) {
    // Aquí puedes implementar la lógica para eliminar la cita
    console.log('Eliminando cita:', appointment.id);

    this.appointmentsService.deleteAppointment(appointment.id);
     
  }
  
  get filteredAppointments() {
    return this.workerAppointments.filter(appointment => appointment.date === this.fecha);
  }
}
