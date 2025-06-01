import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Schedules } from '../../auth/schedule.model';
import { NgClass, NgFor, NgIf} from '@angular/common';
import { Subscription } from 'rxjs';
import { NgModel } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface EditableSchedule {
  start: string;
  break: string;
  end: string;
  days: number[];
}

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule],
  templateUrl: './schedules.component.html',
  styleUrl: './schedules.component.css'
})
export class SchedulesComponent implements OnInit, OnDestroy {
  schedule: Schedules | null = null;
  private schedulesub!: Subscription;
  isEditing = false;
  editableSchedule: EditableSchedule = {
    start: '',
    break: '',
    end: '',
    days: []
  };

  weekDays = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' }
  ];

  showResponseDialog: boolean = false; // Variable para mostrar/ocultar el diálogo de respuesta
  messageDialog: string = '';
  error = true; // Variable para manejar errores

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadSchedule();
  }

  private loadSchedule() {
    this.schedulesub = this.authService.getSchedules().subscribe({
      next: (schedules: Schedules) => {
        this.schedule = schedules;
        console.log("Schedules fetched:", this.schedule);
      },
      error: (error) => {
        console.error("Error fetching schedules:", error);
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.editableSchedule = {
      start: this.schedule?.schedule?.start || '08:00',
      break: this.schedule?.schedule?.break || '14:00',
      end: this.schedule?.schedule?.end || '20:00',
      days: [...(this.schedule?.days || [])]
    };
  }

  cancelEditing() {
    this.isEditing = false;
    this.editableSchedule = {
        start: '',
        break: '',
        end: '',
        days: []
      };
  }

  toggleDay(dayId: number) {
    if (!this.editableSchedule.days) {
      this.editableSchedule.days = [];
    }

    const index = this.editableSchedule.days.indexOf(dayId);
    if (index > -1) {
      this.editableSchedule.days.splice(index, 1);
    } else {
      this.editableSchedule.days.push(dayId);
      this.editableSchedule.days.sort();
    }
  }

  async saveSchedule() {
  try {
    const updatedSchedule = await this.authService.updateSchedule({
      schedule: {
        start: this.editableSchedule.start,
        break: this.editableSchedule.break,
        end: this.editableSchedule.end
      },
      days: this.editableSchedule.days
    }).toPromise();

    if (updatedSchedule) {
      this.schedule = updatedSchedule;
      this.isEditing = false;
      this.editableSchedule = {
        start: '',
        break: '',
        end: '',
        days: []
      };
    }
    this.error = false; 
    this.messageDialog = 'Horario actualizado correctamente';
    this.showResponseDialog = true;
  } catch (error) {
    console.error('Error updating schedule:', error);
  }
}

  isDayActive(dayId: number): boolean {
    if (this.isEditing) {
      return this.editableSchedule.days.includes(dayId);
    }
    return this.schedule?.days?.includes(dayId) || false;
  }

  ngOnDestroy() {
    if (this.schedulesub) {
      this.schedulesub.unsubscribe();
    }
  }

  reRoute(){
    this.showResponseDialog = false;
    this.messageDialog = '';
  }
}