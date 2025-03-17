import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InformationBoxComponent } from '../information-box/information-box.component';

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule, InformationBoxComponent],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.css'
})
export class MainOrdersInvoiceComponent {
  constructor() {
  }
}
