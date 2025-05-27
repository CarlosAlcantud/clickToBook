import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarComponent } from "../../appointments/create-appointment/calendar/calendar.component";
import { CommonModule, formatDate } from '@angular/common';
import { AppointmentsService } from '../../appointments/appointments.service';
import { Appointment } from '../../appointments/appointment.model';
import { Subscription } from 'rxjs';
import { WorkerAppointment } from '../../appointments/workerAppointment.model';
import { RouterModule, RouterOutlet, Router} from '@angular/router';


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
  
  selectedFilter: string = '';
  filteredAppointments: WorkerAppointment[] = [];

  showConfirmDialog = false;
  appointmentToDelete: any = null;




  expand(index: number, rawDate: Date): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Añadir un día
    tomorrow.setHours(0, 0, 0, 0);

    if( rawDate > tomorrow){
      this.expandedIndex = this.expandedIndex === index ? null : index;

    }
    
  }

  constructor(public appointmentsService: AppointmentsService, private router : Router) {
    
    this.appointmentsService.dateSelected$.subscribe(date => {
      this.fecha = date.toLocaleDateString();
      // this.fechaCompleta = this.formatDate(date);
      this.fechaCompleta = this.appointmentsService.formatDate(date);
      this.selectedFilter = '';
      this.show = true; // Muestra el calendario al seleccionar una fecha
      this.applayFilters();
    });

  }
  
  ngOnInit() {
    
    
    this.appointmentsSub = this.appointmentsService.getWorkerAppointmentUpdateListener()
      .subscribe((appointments: WorkerAppointment[]) => {
        //console.log("Los appointments son: " + appointments);
        this.workerAppointments = appointments;
        this.applayFilters();
      });

      this.appointmentsService.getWorkerAppointments(this.fecha);
    
      
      console.log('WorkerAppointmentsComponent inicializado'+ this.workerAppointments );
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
    // this.router.navigate(['worker/appointments/edit-appointment'], { queryParams: { appointment } });
    let message = appointment.userName + ' del dia ' + this.appointmentsService.formatDate(appointment.rawDate);
    this.router.navigate(['worker/appointments/edit-appointment'], { queryParams: { appointmentId: appointment.id, partMessage: message, appointmentDate: appointment.date, rawDate: appointment.rawDate } });

  }

  deleteAppointment (appointment: Appointment) {
        // Aquí puedes implementar la lógica para eliminar la cita
        console.log('Eliminando cita:', appointment.id);
        this.appointmentToDelete = appointment;
        this.showConfirmDialog = true;

        
         
    }

  confirmDelete() {
      if (this.appointmentToDelete) {
          this.appointmentsService.deleteAppointment(this.appointmentToDelete.id);
      }
      this.closeConfirmDialog();
    }

    closeConfirmDialog() {
        this.showConfirmDialog = false;
        this.appointmentToDelete = null;
    }

  applayFilters(){
    this.expandedIndex = null; // Reinicia el índice del botón expandido al aplicar filtros
    if (this.selectedFilter === 'futuras') {
      this.filteredAppointments = this.workerAppointments.filter(appointment => appointment.rawDate > new Date());
    } else if (this.selectedFilter === 'pasadas') {
      this.filteredAppointments = this.workerAppointments.filter(appointment => appointment.rawDate < new Date());
    } else if (this.selectedFilter === 'todas') {
      this.filteredAppointments = this.workerAppointments; // Copia todas las citas
    }else{
      this.filteredAppointments = this.workerAppointments.filter(appointment => appointment.date === this.fecha);
    }
  }

  setFilter(filter: string): void {
    this.expandedIndex = null;
    if (this.selectedFilter === filter) {
      this.selectedFilter = ''; // Si el filtro ya está seleccionado, lo deselecciona
    }  
    else {
      this.selectedFilter = filter;
      // this.filteredAppointments;
    }
    this.applayFilters();
    
  }


}
