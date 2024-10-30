import { Component, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OnInit } from '@angular/core';
import { LOCALE_ID } from '@angular/core';

@Component({
  selector: 'book-appointment',
  standalone: true,
  imports: [],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css',
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'es-ES' }],
})
export class BookAppointmentComponent implements OnInit{

  @Input() appointment: Date | null = null; // El valor que quiero recibir de otro componente. 
  @Input() hour: string = '';
  
  formatedDate: string = '';

  constructor(private datePipe: DatePipe) {
     }

  ngOnInit(): void {
    this.formatedDate = this.datePipe.transform(this.appointment, "d 'de' MMMM yyyy", 'es-ES')!
  }

  
}
