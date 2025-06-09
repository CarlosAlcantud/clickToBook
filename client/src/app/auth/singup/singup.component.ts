import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../auth.service';
import { Worker } from '../worker.model';
import { Subscription } from 'rxjs';
@Component({
    selector: 'signup',
    standalone: true,
    imports: [FormsModule, NgIf, NgFor],
    templateUrl: './singup.component.html',
    styleUrl: './singup.component.css'
})

export class SingUpComponent implements OnInit {
  
  workers: Worker[] = [];
  private workerSub!: Subscription;

  constructor(public authService: AuthService) {}
  
  ngOnInit() {
    // Obtener trabajadores al inicializar
    this.authService.fetchWorkers();
    
    // Mantener actualizada la lista de trabajadores
    this.workerSub = this.authService.getWorkerUpdateListener()
      .subscribe((workers: Worker[]) => {
        this.workers = workers;
        console.log('Lista de trabajadores actualizada:', this.workers);
      });

    this.authService.fetchWorkers()
  }

  onSingUp(singupForm: NgForm) {
    if (singupForm.invalid) {
      return;
    }
    this.authService.createUser(
      singupForm.value.password, 
      singupForm.value.username, 
      singupForm.value.email,
      singupForm.value.worker
    );
  }
}