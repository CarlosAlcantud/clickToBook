import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

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
    this.selectedDay = day;
    this.nameDay();
  }

  nameDay(){
    const fecha = new Date(this.year, this.month, this.selectedDay);
    this.nameOfTheDay = fecha.toLocaleString('es-ES', { weekday: 'long' });
    
  }

  get monthName(): string {
    return new Date(this.year, this.month).toLocaleString('es-ES', { month: 'long' });
  }

}
