import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../appointments.service';
import { AuthService } from '../../../auth/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
import { ViewChild, ElementRef, OnDestroy } from '@angular/core';
@Component({
  selector: 'hours-available',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hours-available.component.html',
  styleUrl: './hours-available.component.css'
})
export class HoursAvailableComponent implements OnInit {

  @Output() hourselcted = new EventEmitter();
  messageToShow = '';
  hoursAvailable: { hour: string }[] = [];
  private destroy$ = new Subject<void>();
  private refreshInProgress = false;

  constructor(private appointmentsService: AppointmentsService, private authservice: AuthService) {}

  ngOnInit() {
      // Combine all events that should trigger a refresh into a single stream
      this.messageToShow = '';
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
                  if (hours.length === 0) {
                    this.messageToShow = 'No hay clases disponibles';
                  }else {
                    this.messageToShow = '';
                  }
              },
              error: (error) => {
                  this.refreshInProgress = false;
                  this.messageToShow = error.error.message;
                  this.hoursAvailable = [];
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
              error: (error) => {
                console.log("Error getting hours:", error.message);
                this.messageToShow = error.error.message + '  Contacta con tu profesor por favor';
                this.refreshInProgress = false;
              }
          });
      }
  }

  onClickHour(hour: {hour: string}) {
    this.hourselcted.emit(hour);
  }

    isAtBottom = false;

    checkScroll(element: HTMLElement): void {
    const threshold = 5; // margen de tolerancia
    const isBottom = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
    this.isAtBottom = isBottom;
    }
}
