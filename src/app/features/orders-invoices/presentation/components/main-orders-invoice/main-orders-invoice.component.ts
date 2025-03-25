import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { MonthlySalesViewModelService } from '../../view-model/monthly-orders-viewmodel.service';
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
  providers: [MonthlySalesViewModelService],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.css'
})
export class MainOrdersInvoiceComponent implements OnInit {
  constructor(public monthlySalesViewModel: MonthlySalesViewModelService) {}

  ngOnInit(): void {
    this.monthlySalesViewModel.loadAllMonthWithTotals();
    this.monthlySalesViewModel.loadTotalOrdersAmount();
    this.monthlySalesViewModel.loadTotalOrders();
    this.monthlySalesViewModel.loadMonthlyTmList();
  }
}
