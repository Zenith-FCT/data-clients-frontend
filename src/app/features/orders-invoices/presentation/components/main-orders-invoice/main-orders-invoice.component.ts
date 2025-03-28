import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { OrdersInvoiceViewModelService } from '../../view-model/orders-invoice-viewmodel.service';
import { ChartTotalInvoiceComponent } from './components/chart-total-invoice/chart-total-invoice.component';
import { ChartTotalOrdersInvoicesComponent } from './components/chart-total-orders-invoices/chart-total-orders-invoices.component';
import { ChartTmComponent } from './components/chart-tm/chart-tm.component';

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    InformationBoxComponent, 
    ChartTotalInvoiceComponent,
    ChartTotalOrdersInvoicesComponent,
    ChartTmComponent
  ],
  providers: [OrdersInvoiceViewModelService],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.css'
})
export class MainOrdersInvoiceComponent implements OnInit {
  constructor(public ordersInvoiceViewModel: OrdersInvoiceViewModelService) {}
  
  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    
    this.ordersInvoiceViewModel.loadAllMonthWithTotals();
    this.ordersInvoiceViewModel.loadTotalOrdersAmount(currentYear);
    this.ordersInvoiceViewModel.loadTotalOrders(currentYear);
    this.ordersInvoiceViewModel.loadMonthlyTmList();

  }
}
