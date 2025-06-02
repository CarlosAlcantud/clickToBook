import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import e from 'express';
import { BaseService } from '../../base.service';

const DAY_MAP: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };




@Component({
  selector: 'app-register-worker',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-worker.component.html',
  styleUrls: ['./register-worker.component.css']
})
export class RegisterWorkerComponent extends BaseService implements OnInit  {
  registerForm: FormGroup;
  showResponseDialog: boolean = false; // Variable para mostrar/ocultar el diálogo de respuesta
  messageDialog: string = '';
  error = true; // Variable para manejar errores
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    super();
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', Validators.required],
      startTime: ['', Validators.required],
      breakTime: ['', Validators.required],
      endTime: ['', Validators.required],
      days: this.fb.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false]
      })
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      
      const selectedDays = Object.entries(formData.days)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => DAY_MAP[day]);

      const workerData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        schedule: {
          start: formData.startTime,
          break: formData.breakTime,
          end: formData.endTime
        },
        days: selectedDays
      };

      this.http.post(`${this.baseUrl}/api/worker/createWorker`, workerData)
        .subscribe({
          next: (response: any) => {
            this.messageDialog = response.message;
            this.error = false;
            this.showResponseDialog = true; // Mostrar el diálogo de respuesta

            console.log('Worker registered successfully', response);
            
          },
          error: (error) => {
            this.messageDialog = error.error.message;
            this.showResponseDialog = true; // Mostrar el diálogo de respuesta
            console.error('Error registering worker', error);
            // Aquí puedes implementar el manejo de errores
          }
        });
    }
  }

  reRoute(){
    this.showResponseDialog = false;
    this.router.navigate(['/worker']);
  }
}