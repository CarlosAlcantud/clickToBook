import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppointmentsService } from '../../appointments.service';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit{

  today: Date = new Date();
  selectedDay: number = this.today.getDate();
  month: number = this.today.getMonth();
  year: number = this.today.getFullYear();
  weekDays: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  weeks: number[][] = [];
  nameOfTheDay: string = '';
  @Output() dateSelected = new EventEmitter();
  
  constructor( private appointmentsService: AppointmentsService) { 

  }


  ngOnInit() {
    this.generateCalendar();
    this.nameDay();
  }

  generateCalendar() {
    const firstDay = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    const days: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Crear las semanas en filas
    const weeks = [];
    let week = new Array(firstDay).fill(null);
    for (const day of days) {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    }
    if (week.length) {
      weeks.push(week);
    }

    this.weeks = weeks;
  }

  prevMonth() {
    if (this.month === 0) {
      this.month = 11;
      this.year--;
    } else {
      this.month--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.month === 11) {
      this.month = 0;
      this.year++;
    } else {
      this.month++;
    }
    this.generateCalendar();
  }

  isToday(day: number) {
    return day === this.today.getDate() && 
           this.month === this.today.getMonth() && 
           this.year === this.today.getFullYear();
  }

  isSelected(day: number) {
    return day === this.selectedDay;
  }

  selectDay(day: number) {
    if (this.isWeekend(day)) {
      return;
    }
    this.selectedDay = day;
    this.nameDay();
    //this.dateSelected.emit(new Date(this.year, this.month, this.selectedDay));
    this.appointmentsService.emitDateSelected(new Date(this.year, this.month, this.selectedDay)); //Emite la fecha seleccionada
    this.appointmentsService.gethoursAvailable().subscribe(hours =>{
      this.appointmentsService.updateHoursAvailable(hours) ;
    });
  }

  nameDay(){
    const fecha = new Date(this.year, this.month, this.selectedDay);
    this.nameOfTheDay = fecha.toLocaleString('es-ES', { weekday: 'long' });
    
  }

  get monthName(): string {
    return new Date(this.year, this.month).toLocaleString('es-ES', { month: 'long' });
  }

  isWeekend(day: number): boolean {
    const date = new Date(this.year, this.month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 es domingo y 6 es sábado
  }


}
