import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformationBoxCartsComponent } from './information-box-carts/information-box-carts.component';

@Component({
  selector: 'app-main-carts',
  standalone: true,
  imports: [CommonModule, InformationBoxCartsComponent],
  templateUrl: './main-carts.component.html',
  styleUrls: ['./main-carts.component.scss']
})
export class MainCartsComponent {}
