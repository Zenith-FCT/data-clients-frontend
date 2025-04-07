import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { OrdersInvoiceViewModelService } from '../../view-model/orders-invoice-viewmodel.service';
import { InvoiceClientsViewModelService } from '../../view-model/invoice-clients-viewmodel.service';
import { OrderInvoiceProductViewModelService } from '../../view-model/order-invoice-product-viewmodel.service';
import { ChartTotalInvoiceComponent } from './components/chart-total-invoice/chart-total-invoice.component';
import { ChartTotalOrdersInvoicesComponent } from './components/chart-total-orders-invoices/chart-total-orders-invoices.component';
import { ChartTmComponent } from './components/chart-tm/chart-tm.component';
import { InvoiceClientTypeComponent } from './components/invoice-client-type/invoice-client-type.component';
import { OrdersClientTypeComponent } from './components/orders-client-type/orders-client-type.component';
import { ChartOrdersByClientTypeComponent } from './components/chart-orders-by-client-type/chart-orders-by-client-type.component';
import { ChartInvoiceProductTypeComponent } from './components/chart-invoice-product-type/chart-invoice-product-type.component';
import { ChartOrdersProductTypeComponent } from './components/chart-orders-product-type/chart-orders-product-type.component';
import { ChartMonthlyLTVComponent } from './components/chart-monthly-ltv/chart-monthly-ltv.component';
import { ChartEvolutionOrdersInvoicesComponent } from './components/chart-evolution-orders-invoices/chart-evolution-orders-invoices.component';
import { LtvViewModelService } from '../../view-model/ltv-viewmodel.service';

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    InformationBoxComponent,
    ChartTotalInvoiceComponent,
    ChartTotalOrdersInvoicesComponent,
    ChartTmComponent,
    InvoiceClientTypeComponent,
    OrdersClientTypeComponent,
    ChartOrdersByClientTypeComponent,
    ChartInvoiceProductTypeComponent,
    ChartOrdersProductTypeComponent,
    ChartMonthlyLTVComponent,
    ChartEvolutionOrdersInvoicesComponent
],
  providers: [
    OrdersInvoiceViewModelService, 
    InvoiceClientsViewModelService,
    OrderInvoiceProductViewModelService
  ],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.scss'
})
export class MainOrdersInvoiceComponent implements OnInit {
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  selectedTmYear: number = new Date().getFullYear();
  selectedClientYear: number = new Date().getFullYear();
  selectedProductYear: number = new Date().getFullYear();
  selectedLtvYear: number = new Date().getFullYear();
  years: number[] = [];
  months: number[] = Array.from({length: 12}, (_, i) => i + 1);

  constructor(
    public ordersInvoiceViewModel: OrdersInvoiceViewModelService,
    public invoiceClientsViewModel: InvoiceClientsViewModelService,
    public orderInvoiceProductViewModel: OrderInvoiceProductViewModelService,
    public ltvViewModel: LtvViewModelService
  ) {
    effect(() => {
      const data = this.ordersInvoiceViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.extractAvailableYears(data);
      }
    });
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  private extractAvailableYears(data: any[]): void {
    const uniqueYears = new Set<number>();
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      if (!isNaN(year)) {
        uniqueYears.add(year);
      }
    });
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
    
    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.ordersInvoiceViewModel.setSelectedYear(this.selectedYear);
    }
  }

  onDateChange(): void {
    this.ordersInvoiceViewModel.setSelectedMonth(this.selectedMonth);
    this.ordersInvoiceViewModel.setSelectedYear(this.selectedYear);
    this.ordersInvoiceViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
    this.ordersInvoiceViewModel.loadMonthlyOrders(this.selectedYear, this.selectedMonth);
    this.ordersInvoiceViewModel.loadMonthlyTm(this.selectedYear, this.selectedMonth);
  }

  onTmYearChange(): void {
    this.ordersInvoiceViewModel.setSelectedTmYear(this.selectedTmYear);
    this.ordersInvoiceViewModel.loadYearTmList(this.selectedTmYear);
  }

  onClientYearChange(): void {
    this.invoiceClientsViewModel.setSelectedYear(this.selectedClientYear);
    
    this.invoiceClientsViewModel.loadOrdersByClientsMonthly();
    this.invoiceClientsViewModel.loadInvoiceClientsType();
    this.invoiceClientsViewModel.loadOrdersClientsType();
    this.orderInvoiceProductViewModel.loadInvoiceProductType();
  }
  
  onLtvYearChange(): void {
    this.ltvViewModel.setSelectedYear(this.selectedLtvYear);
    this.ltvViewModel.loadLtv();
  }

  onProductYearChange(): void {
    this.orderInvoiceProductViewModel.setSelectedYear(this.selectedProductYear);
    this.orderInvoiceProductViewModel.loadInvoiceProductType();
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    this.ordersInvoiceViewModel.loadAllMonthWithTotals();
    this.ordersInvoiceViewModel.loadMonthlySales(currentYear, currentMonth);
    this.ordersInvoiceViewModel.loadTotalOrdersAmount(currentYear);
    this.ordersInvoiceViewModel.loadTotalOrders(currentYear);
    this.ordersInvoiceViewModel.loadMonthlyTm(currentYear, currentMonth);
    this.ordersInvoiceViewModel.loadMonthlyOrders(currentYear, currentMonth);
    this.ordersInvoiceViewModel.loadMonthlyTmList();
    
    this.invoiceClientsViewModel.loadInvoiceClientsType();
    this.invoiceClientsViewModel.loadOrdersClientsType();
    this.invoiceClientsViewModel.loadOrdersByClientsMonthly();

    this.orderInvoiceProductViewModel.loadInvoiceProductType();
  }
}
