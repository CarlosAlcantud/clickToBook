import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../appointments.service';
import { AuthService } from '../../../auth/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
@Component({
  selector: 'hours-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hours-available.component.html',
  styleUrl: './hours-available.component.css'
})
export class HoursAvailableComponent implements OnInit {

  @Output() hourselcted = new EventEmitter();
  
  hoursAvailable: { hour: string }[] = [];
  private destroy$ = new Subject<void>();
  private refreshInProgress = false;

  constructor(private appointmentsService: AppointmentsService, private authservice: AuthService) {}

  ngOnInit() {
      // Combine all events that should trigger a refresh into a single stream
      merge(
          this.appointmentsService.dateSelected$,
          this.authservice.clientSelected$,
          this.authservice.clientDataReady$.pipe(filter(ready => ready === true))
      )
      .pipe(
          takeUntil(this.destroy$)
      )
      .subscribe(() => {
          // Prevent duplicate calls when multiple events fire close together
          if (!this.refreshInProgress) {
              this.refreshAvailableHours();
          }
      });
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  // New method to avoid code duplication
  private refreshAvailableHours() {
      this.refreshInProgress = true;

      // Comprobar si es worker y obtener datos del cliente seleccionado
      if (this.authservice.getIsWorker()) {
          const clientData = this.authservice.getClient();
          console.log("Getting hours for client with worker:", clientData.clientWorker);
          
          this.appointmentsService.gethoursAvailable(clientData).subscribe({
              next: hours => {
                  this.appointmentsService.updateHoursAvailable(hours);
                  this.hoursAvailable = hours;
                  this.refreshInProgress = false;
              },
              error: () => {
                  this.refreshInProgress = false;
              }
          });
      } else {
          // Caso normal para usuario cliente
          this.appointmentsService.gethoursAvailable().subscribe({
              next: hours => {
                  this.appointmentsService.updateHoursAvailable(hours);
                  this.hoursAvailable = hours;
                  this.refreshInProgress = false;
              },
              error: () => {
                  this.refreshInProgress = false;
              }
          });
      }
  }

  onClickHour(hour: {hour: string}) {
    this.hourselcted.emit(hour);
  }
}
