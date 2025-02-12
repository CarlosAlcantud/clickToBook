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
  private authListenerSubs: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      console.log("User is authenticated asdf a: " + this.userIsAuthenticated);
      this.userIsAuthenticated = isAuthenticated;
      
    });
  }

  ngOnDestroy() {
    console.log("NavBarComponent ngOnDestroy called");
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    console.log("Logout clicked");
    this.authService.logout();
  }
}