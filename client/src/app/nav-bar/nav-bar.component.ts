import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [MatToolbarModule, RouterModule, NgIf],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit,OnDestroy {

  userIsAuthenticated = false;
  userisWorker = false;
  private authListenerSubs: Subscription = new Subscription();
  private workerListenerSubs: Subscription = new Subscription(); 
  constructor(private authService: AuthService) {}

  ngOnInit() {
    //this.userIsAuthenticated = this.authService.getIsAuth();
    //this.userisWorker = this.authService.getIsWorker();
    console.log("User is authenticated adsfa antes a: " + this.userIsAuthenticated);

    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      
      this.userIsAuthenticated = isAuthenticated;
      
    });

    this.workerListenerSubs = this.authService.getWorkerStatusListener().subscribe(isWorker => {
      
      this.userisWorker = isWorker;
      
    });
    console.log("User is authenticated adsfa despues a: " + this.userIsAuthenticated);
    
  }

  ngOnDestroy() {
    console.log("NavBarComponent ngOnDestroy called");
    this.authListenerSubs.unsubscribe();
    this.workerListenerSubs.unsubscribe();
  }

  onLogout() {
    console.log("Logout clicked");
    this.authService.logout();
  }
}