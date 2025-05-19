import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CreateAppointmentComponent } from '../../appointments/create-appointment/create-appointment.component';
import { SingUpComponent } from '../../auth/singup/singup.component';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Client } from '../../auth/client.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Appointment } from '../../appointments/appointment.model';
import { AppointmentsService } from '../../appointments/appointments.service';
@Component({
  selector: 'app-worker-add-client',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterOutlet, RouterModule],
  templateUrl: './worker-add-client.component.html',
  styleUrl: './worker-add-client.component.css'
})
export class WorkerAddClientComponent implements OnInit {

  public actions: boolean = false; // Variable para mostrar/ocultar el calendario
  public bookappointment: boolean = false; // Variable para mostrar/ocultar el calendario
  public newclient: boolean = false; // Variable para mostrar/ocultar el calendario
  public nav : boolean = true; // Variable para mostrar/ocultar el calendario
  public buyclasses : boolean = false; // Variable para mostrar/ocultar el calendario
  public selectedClient: Client = { clientId: '', clientWorker: '', username: '',classes: 0}; // Variable para almacenar el estudiante seleccionado
  public selectedClientObj : any = null;
  public numberofclases : number = 0; // Variable para almacenar el número de clases
  clients: Client[] = [];
  private clientSub!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appointmentService: AppointmentsService,
  ) {
    
  }

  ngOnInit(): void {
    this.nav = true;
    this.updateClients();
  }

  updateClients() {
    this.authService.fetchClients();
    this.clientSub = this.authService.getClientUpdateListener()
      .subscribe((clients: Client[]) => {
        this.clients = clients;
        console.log("Clientes recibidos:", clients);
        clients.forEach(client => {
          console.log(`Cliente ${client.username}, clases: ${client.classes}`);
        });
      }
    );
  }
  registerClient() {
    this.nav = false;
    // this.actions = true;
    // this.newclient = true;
    this.router.navigate(['worker/add-client/registerStudent']);
  }

  bookAppointment() {
    this.nav = false;
    this.actions = true;
    this.bookappointment= true;
    this.router.navigate(['worker/add-client/bookAppointment']);
  }


  goBack() {
    this.reset();

    this.router.navigate(['../add-client'], { relativeTo: this.route });
  }

  reset(){
    this.nav = true;
    this.actions = false;
    this.bookappointment = false;
    this.newclient = false;
    this.buyclasses = false;
    this.updateClients(); // Actualiza la lista de clientes después de añadir clases
    this.selectedClientObj = null; // Reinicia el cliente seleccionado
    this.selectedClient = { clientId: '', clientWorker: '', username: '', classes: 0 }; // Reinicia el cliente seleccionado
    this.numberofclases = 0; // Reinicia el número de clases
  }

  buyClasses() {
    this.nav = false;
    this.actions = true;
    this.buyclasses = true;
  }

  addClasses(){
    // this.nav = true;
    // this.actions = false;
    // this.bookappointment = false;
    // this.newclient = false;
    // this.buyclasses = false;
    console.log("El cliente seleccionado es: ", this.selectedClient.username + "Y sus clases actuales son: " + this.selectedClient.classes);
    this.authService.addClasses(this.numberofclases).subscribe({
      next: (response) => {
        alert(response.message + "Para: " + response.user.username); // Esto debería mostrar el mensaje
        
        // Espera un momento antes de navegar para asegurar que el alert se muestre
        
        this.reset(); // Reinicia el formulario y la vista
      },
      error: (error) => {
        console.error('Error al añadir clases:', error);
        alert('Ha ocurrido un error al añadir las clases: ' + 
              (error.error?.message || 'Error desconocido'));
      }
    });
  }

    

  

  selectStudent() {
    console.log("El estudiante seleccionado es: ", this.selectedClientObj.clientId);
    if (this.selectedClientObj){
      this.selectedClient = {
        clientId: this.selectedClientObj.clientId,
        clientWorker: this.selectedClientObj.clientWorker,
        username: this.selectedClientObj.username,
        classes: this.selectedClientObj.classes
      }
      this.authService.setClient(this.selectedClient);
    }

    console.log("El cliente seleccionado es: ", this.selectedClient.clientId);
    console.log("El cliente trabajador es: ", this.selectedClient.clientWorker);
  }
}
