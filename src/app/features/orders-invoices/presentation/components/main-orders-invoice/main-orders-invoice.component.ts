import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { OrdersViewModelService } from '../../view-model/orders-view-model.service';

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule, InformationBoxComponent],
  providers: [OrdersViewModelService],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.css'
})
export class MainOrdersInvoiceComponent {}
