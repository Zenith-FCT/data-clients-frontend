import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './main-dashboard-layout.component.html',
  styleUrl: './main-dashboard-layout.component.css'
})
export class MainDashboardLayoutComponent {
  sidenavExpanded = false;

  toggleSidenavExpanded(): void {
    this.sidenavExpanded = !this.sidenavExpanded;
  }
}