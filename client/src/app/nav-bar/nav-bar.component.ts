import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentsService } from '../appointments/appointments.service';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [MatToolbarModule, RouterModule, NgIf, NgFor],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit,OnDestroy {

  userIsAuthenticated = false;
  userisWorker = false;
  userisClient = false;
  userisAdmin = false;
  private authListenerSubs: Subscription = new Subscription();
  private workerListenerSubs: Subscription = new Subscription();
  private clientListenerSubs: Subscription = new Subscription();
  private adminListenerSubs: Subscription = new Subscription();

  posibleExams: any[] = [];
  expandedIndex: number | null = null; // Para el acordeón
  showModal = false;
  showResponseDialog = false; 
  messageDialog = '';
  news = false; // Para mostrar el mensaje de noticias
  constructor(private authService: AuthService, private router: Router, private appointmentsService: AppointmentsService) {}

  ngOnInit() {
    
    console.log("User is authenticated adsfa antes a: " + this.userIsAuthenticated);

    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      
      this.userIsAuthenticated = isAuthenticated;
      
    });

    this.adminListenerSubs = this.authService.getAdminStatusListener().subscribe(isAdmin => {
      this.userisAdmin = isAdmin;
    }
    );

    this.clientListenerSubs = this.authService.getClientStatusListener().subscribe(isClient => {
      this.userisClient = isClient;
    });

    this.workerListenerSubs = this.authService.getWorkerStatusListener().subscribe(isWorker => {
      this.userisWorker = isWorker;
    });

    if (this.userIsAuthenticated && this.userisClient) {
        console.log("User is authenticated llamamos a coger los examenes posibles: " );
        this.appointmentsService.getPossibleExams()
        .subscribe({
            next: (exams: any[]) => {
                this.posibleExams = exams;
                if( this.posibleExams.length > 0) {
                  this.showResponseDialog = true; // Abrir el modal si hay exámenes disponibles
                  this.messageDialog = "Ya estas preparado para apuntarte al examen. Puedes apuntarte haciendo click en el boton de Examen disponible";
                  this.news = true;
                }
                
                console.log("Exámenes posibles:", this.posibleExams);
            },
            error: (error) => {
                console.error("Error al obtener exámenes:", error);
                this.posibleExams = []; 
            }
        });

      }
    
    
  }

  ngOnDestroy() {
    console.log("NavBarComponent ngOnDestroy called");
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    console.log("Logout clicked");
    this.authService.logout();
  }

  createSchedules() {
    this.authService.createSchedules().subscribe({
      next: (response) => {
        alert(response); // Esto debería mostrar el mensaje
        
      },
      error: (error) => {
        console.error('Error al añadir clases:', error);
        alert('Ha ocurrido un error al crear los horarios: ' + 
              (error.error?.message || 'Error desconocido'));
      }
    });
  }

  isGestionesActive(): boolean {
  const currentUrl = this.router.url;

  // Si la URL comienza con '/worker/exams', retornar false
  if (currentUrl.startsWith('/worker/exams')) {
    return false;
  }

  // Para todas las demás URLs, retornar true
  return true;
}


  expand(index: number): void {
      this.expandedIndex = this.expandedIndex === index ? null : index;
  }


    openExamsModal() {
        this.showModal = true;
        this.isMobileMenuOpen = false
    }

    closeModal() {
        this.showModal = false;
    }

    enrollToExam(examId: string) {
        this.appointmentsService.enrollToExam(examId).subscribe({
            next: (response) => {
                this.messageDialog = response.message;
                this.showResponseDialog = true;
                
                this.posibleExams = [];
                this.closeModal(); // Cerrar el modal después de inscribirse
            },
            error: (error) => {
                console.error('Error al inscribirse al examen:', error);
                alert('Ha ocurrido un error al inscribirse al examen: ' + 
                      (error.error?.message || 'Error desconocido'));
            }
        });
    }

    isMobileMenuOpen = false;

    toggleMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        const hamburger = document.querySelector('.hamburger');
        hamburger?.classList.toggle('active');
    }
    ok(){
        this.showResponseDialog = false;
        this.messageDialog = '';
        this.news = false; 
    }
}