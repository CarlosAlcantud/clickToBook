import { Component, OnDestroy, OnInit } from '@angular/core';
import { Appointment } from '../appointment.model';
import { AppointmentsService } from '../appointments.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, RouterOutlet } from '@angular/router';
@Component({
  selector: 'show-appointments',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterOutlet, RouterModule],
  templateUrl: './show-appointments.component.html',
  styleUrl: './show-appointments.component.css'
})
export class ShowAppointmentsComponent implements OnInit, OnDestroy{
  showComponent: boolean = false;
  appointments: Appointment[] = []; // Almacena los appointments y al ser del tipo Appointment no permite otros valores.
  private appointmentsSub!: Subscription;
  filteredAppointments: Appointment[] = [];
  show: boolean = true; // Variable para mostrar/ocultar el calendario
  expandedIndex: number | null = null; // Índice del botón expandido
  
  selectedFilter: string = 'futuras'; // Por defecto, el botón "Futuras" está seleccionado

  fecha : String = new Date().toLocaleDateString(); // Fecha actual
  constructor(public appointmentsService: AppointmentsService) {}

  ngOnInit() {
    console.log("Los appointments antes de mostrarlos son: "+this.appointments);
    this.appointmentsService.getAppointments();
    this.appointmentsSub = this.appointmentsService.getAppointmentUpdateListener()
      .subscribe((appointments: Appointment[]) => {
        console.log("Los appointments son: ADSGASG"+appointments);
        this.appointments = appointments;
        this.setFilter(this.selectedFilter);
    });
    // Establece el filtro inicial al cargar el componente
    this.appointmentsService.getAppointments();
    
  
    
  }

  ngOnDestroy(){ 
   
      this.appointmentsSub.unsubscribe();
    
  }

  expand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  editAppointment(appointment: Appointment) {
      // Aquí puedes implementar la lógica para editar la cita
      console.log('Editando cita:');
      console.log('Editando cita:', appointment);
      this.show = false; // Oculta el calendario al editar una cita
  
    }
  
    deleteAppointment (appointment: Appointment) {
      // Aquí puedes implementar la lógica para eliminar la cita
      console.log('Eliminando cita:', appointment.id);
  
      this.appointmentsService.deleteAppointment(appointment.id);
       
    }

    
    setFilter(filter: string): void {
      this.selectedFilter = filter;
      console.log('Filtro seleccionado:', this.selectedFilter);
    
      if (filter === 'futuras') {
        this.filteredAppointments = this.appointments.filter(appointment => new Date(appointment.rawDate) > new Date());
      } else if (filter === 'pasadas') {
        this.filteredAppointments = this.appointments.filter(appointment => new Date(appointment.rawDate) < new Date());
      } else if (filter === 'todas') {
        this.filteredAppointments = [...this.appointments]; // Copia todas las citas
      }
    }

}
