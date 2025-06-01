import { NgIf, NgClass} from '@angular/common';
import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../appointments/appointments.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [FormsModule, NgIf, NgClass],
  templateUrl: './create-exam.component.html',
  styleUrl: './create-exam.component.css'
})
export class CreateExamComponent {
  today: string = new Date().toISOString().split('T')[0];
  showConfirmDialog: boolean = false;
  examDate?: Date;
  limit: number = 0;
  showResponseDialog: boolean = false; 
  messageDialog: string = '';
  isSuccess: boolean = false;

  constructor(private appointmentService: AppointmentsService, private router: Router) { }

  notifyExamForm(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.examDate = form.value.examDate;
    this.limit = form.value.limit;

    this.showConfirmDialog = true;
    // Reiniciar el formulario después de enviar
    form.reset();
    

  }

  notifyExam() {
    if (!this.examDate) {
      return;
    }
    this.showConfirmDialog = false;
    
    this.appointmentService.notifyExam(this.examDate, this.limit).subscribe({
      next: (response) => {
        console.log('Notificación enviada exitosamente:', response);
        this.isSuccess = true;
        this.showResponseDialog = true;
        this.messageDialog = response.message || 'e';
      },
      error: (error) => {
        console.error('Error al enviar la notificación:', error);
        this.showResponseDialog = true;
        this.messageDialog = error.error?.message || 'Error al enviar la notificación';
      }
    });
  }



  closeConfirmDialog() {
    this.showConfirmDialog = false;
    this.examDate = undefined;
    this.limit = 0;
  }

  reRoute(){
    // this.router.navigate(['/worker/exams/list-exams']);
    this.showResponseDialog = false;
  }



}
