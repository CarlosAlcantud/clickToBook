import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { take } from 'rxjs/operators';
@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [NgIf, RouterModule, HttpClientModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  loading = true;
  success = false;
  message = '';
  error = '';
  type = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public router: Router
  ) {}

  private confirmed = false;

  ngOnInit() {
      if (!this.confirmed) {
        this.route.params.pipe(
          take(1)  // Esto asegura que solo se ejecute una vez
        ).subscribe(params => {
          const token = params['token'];
          const type = params['type'];  // Obtiene el tipo de la ruta

      if (type === 'appointment') {
        this.confirmAppointment(token);
      } else if (type === 'exam') {
        this.confirmExam(token);
      } else {
        this.error = 'Tipo de confirmación inválido';
        this.loading = false;
      }
        });
      }
  }

  ngOnDestroy() {
    this.error = '';
    this.success = false;
    this.message = '';
    this.type = '';
  }

  private confirmExam(token: string) {
    if (this.confirmed) return; // Añade esta verificación adicional
    
    this.authService.confirmExam(token).pipe(
      take(1)  // También aseguramos una sola ejecución aquí
    ).subscribe({
      next: (response) => {
        this.success = true;
        this.message = response.message;
        this.loading = false;
        this.confirmed = true;
      },
      error: (error) => {
        this.error = error.error.message;
        this.loading = false;
        this.confirmed = true; // También marcamos como confirmado en caso de error
      }
    });
  }

  private confirmAppointment(token: string) {
    console.log('Confirming appointment with token:', token);
  this.authService.confirmAppointment(token).subscribe({
    next: (response) => {
      this.success = true;
      this.message = response.message;
      this.loading = false;
    },
    error: (error) => {
      this.error = error.error.message;
      this.loading = false;
    }
  });
}
}
