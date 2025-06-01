import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

interface ScheduleData {
  start: string;
  break: string;
  end: string;
  days: number[];
}

@Component({
  selector: 'app-modify-schedules',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule],
  templateUrl: './modify-schedules.component.html',
  styleUrls: ['./modify-schedules.component.css']
})
export class ModifySchedulesComponent {
  scheduleData: ScheduleData = {
    start: '08:00',
    break: '14:00',
    end: '20:00',
    days: [1, 2, 3, 4, 5]
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

  constructor(private authService: AuthService) {}

  isDaySelected(dayId: number): boolean {
    return this.scheduleData.days.includes(dayId);
  }

  toggleDay(dayId: number) {
    const index = this.scheduleData.days.indexOf(dayId);
    if (index > -1) {
      this.scheduleData.days.splice(index, 1);
    } else {
      this.scheduleData.days.push(dayId);
      this.scheduleData.days.sort();
    }
  }

  async updateAllSchedules() {
    try {
      const result = await this.authService.updateAllSchedules({
        schedule: {
          start: this.scheduleData.start,
          break: this.scheduleData.break,
          end: this.scheduleData.end
        },
        days: this.scheduleData.days
      }).toPromise();

      this.error = false;
      this.showResponseDialog = true;
      this.messageDialog = 'Horarios actualizados correctamente';
    } catch (error) {
      console.error('Error updating schedules:', error);
      this.error = true;
      this.showResponseDialog = true;
      this.messageDialog = 'Error al actualizar los horarios. Por favor, inténtelo de nuevo más tarde.';
    }
  }

  showResponseDialog: boolean = false; // Variable para mostrar/ocultar el diálogo de respuesta
  messageDialog: string = '';
  error = true;

  reRoute(){
    this.showResponseDialog = false;
    this.messageDialog = '';
  }

}
