import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
  constructor(
    public ordersInvoiceViewModel: OrdersInvoiceViewModelService,
    public invoiceClientsViewModel: InvoiceClientsViewModelService,
    public orderInvoiceProductViewModel: OrderInvoiceProductViewModelService
  ) {}
  
  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    
    this.ordersInvoiceViewModel.loadAllMonthWithTotals();
    this.ordersInvoiceViewModel.loadTotalOrdersAmount(currentYear);
    this.ordersInvoiceViewModel.loadTotalOrders(currentYear);
    this.ordersInvoiceViewModel.loadMonthlyTmList();
    
    this.invoiceClientsViewModel.loadInvoiceClientsType();
    this.invoiceClientsViewModel.loadOrdersClientsType();
    this.invoiceClientsViewModel.loadOrdersByClientsMonthly();

    this.orderInvoiceProductViewModel.loadInvoiceProductType();
  }
}
