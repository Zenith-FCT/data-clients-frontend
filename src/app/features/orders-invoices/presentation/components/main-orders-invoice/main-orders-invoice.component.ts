import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { OrdersViewModelService } from '../../view-model/total-orders-view-model.service';
import { MonthlySalesViewModelService } from '../../view-model/monthly-orders-viewmodel.service';
import { ChartTotalInvoiceComponent } from './components/chart-total-invoice/chart-total-invoice.component';

@Component({
  selector: 'app-main-orders-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule, InformationBoxComponent, ChartTotalInvoiceComponent],
  providers: [OrdersViewModelService, MonthlySalesViewModelService],
  templateUrl: './main-orders-invoice.component.html',
  styleUrl: './main-orders-invoice.component.css'
})
export class MainOrdersInvoiceComponent {}
