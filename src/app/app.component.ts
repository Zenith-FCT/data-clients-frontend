import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { __param } from 'tslib';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatCardModule,
    MatListModule,
    MatToolbarModule,
    TitleCasePipe
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dashboard-cf';
  sideBarCollapsed = false;
  activeMenu = 'pedidos';

  constructor() {}

  ngOnInit() {
  }

  toggleSideBar(): void {
    this.sideBarCollapsed = !this.sideBarCollapsed;
  }

  
  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
  }
}
