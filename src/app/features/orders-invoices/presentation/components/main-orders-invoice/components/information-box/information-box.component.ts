import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MonthlySalesModel } from '../../../../../domain/models/monthly-sales.model';

@Component({
  selector: 'app-information-box',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './information-box.component.html',
  styleUrl: './information-box.component.scss'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  @Input() type: 'amount' |'tm-year'| 'count' |'monthly-tm'| 'monthly' | 'monthly-order'  = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  
  getMonthName(month: number): string {
    if (month === 0) { 
      return 'Todos';
    }
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }
  constructor(public ordersInvoiceViewModel: OrdersInvoiceViewModelService) {
    effect(() => {
      this.loading = this.ordersInvoiceViewModel.isLoading$();
    });    effect(() => {
      const year = this.ordersInvoiceViewModel.selectedYear$();
      const month = this.ordersInvoiceViewModel.selectedMonth$();
      const isShowingAll = this.ordersInvoiceViewModel.isShowingAllYears$();
      
      if (year && month !== undefined) {
        this.updateData(year, month);
      }
      if (isShowingAll && this.type === 'tm-year') {
        this.ordersInvoiceViewModel.loadTmForAllYears();
      }
    });
  }
  ngOnInit(): void {
    const year = this.ordersInvoiceViewModel.selectedYear$();
    const month = this.ordersInvoiceViewModel.selectedMonth$();
    const isShowingAll = this.ordersInvoiceViewModel.isShowingAllYears$();
    
    if (year && month !== undefined) {
      this.updateData(year, month);
    }    if (isShowingAll && this.type === 'tm-year') {
      this.ordersInvoiceViewModel.loadTmForAllYears();
    }
  }private updateData(year: number, month: number): void {
    const isShowingAll = year === -1 || this.ordersInvoiceViewModel.isShowingAllYears$();
    
    if (isShowingAll && (this.type === 'amount' || this.type === 'count')) {
      this.ordersInvoiceViewModel.loadTotalsForAllYears();
      return;
    }
    if (isShowingAll && this.type === 'tm-year') {
      this.ordersInvoiceViewModel.loadTmForAllYears();
      return;
    }
    
    switch (this.type) {
      case 'monthly':
        if (month === 0) {
          this.ordersInvoiceViewModel.loadTotalOrdersAmount(year);
        } else {
          this.ordersInvoiceViewModel.loadMonthlySales(year, month);
        }
        break;
      case 'amount':
        this.ordersInvoiceViewModel.loadTotalOrdersAmount(year);
        break;
      case 'count':
        this.ordersInvoiceViewModel.loadTotalOrders(year);
        break;
      case 'monthly-order':
        if (month === 0) {
          this.ordersInvoiceViewModel.loadTotalOrders(year);
        } else {
          this.ordersInvoiceViewModel.loadMonthlyOrders(year, month);
        }
        break;
      case 'tm-year':
        this.ordersInvoiceViewModel.loadYearTmList(year);
        break;
      case 'monthly-tm':
        if (month === 0) {
          this.ordersInvoiceViewModel.loadYearTmList(year);
        } else {
          this.ordersInvoiceViewModel.loadMonthlyTm(year, month);
        }
        break;
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
