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
  styleUrl: './information-box.component.css'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  @Input() type: 'amount' |'tm-year'| 'count' |'monthly-tm'| 'monthly' | 'monthly-order'  = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // Inicializar con el mes actual (1-12)
  years: number[] = [];
  months = Array.from({length: 12}, (_, i) => ({ value: i }));
  
  constructor(public ordersInvoiceViewModel: OrdersInvoiceViewModelService) {
    effect(() => {
      if (this.type === 'amount' || this.type === 'monthly' ) {
        const year = this.ordersInvoiceViewModel.selectedYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          this.updateData();
        }
      }
      else if (this.type === 'monthly-order' || this.type === 'count') {
        const year = this.ordersInvoiceViewModel.selectedOrderYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          this.updateData();
        }
      }
      else if (this.type === 'monthly-tm'|| this.type === 'tm-year') {
        const year = this.ordersInvoiceViewModel.selectedTmYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          this.updateData();
        }
      }
    });
    
    effect(() => {
      this.loading = this.ordersInvoiceViewModel.isLoading$();
    });
    
    effect(() => {
      const data = this.ordersInvoiceViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.extractYearsFromData(data);
      }
    });
  }
  
  ngOnInit(): void {
    // No necesitamos reinicializar selectedMonth aquí ya que ya está inicializado con el mes actual
    if (this.type === 'monthly-order' || this.type === 'count') {
      this.selectedYear = this.ordersInvoiceViewModel.selectedOrderYear$();
    } else {
      this.selectedYear = this.ordersInvoiceViewModel.selectedYear$();
    }
    
    const data = this.ordersInvoiceViewModel.allMonthlySales$();
    if (data && data.length > 0) {
      this.extractYearsFromData(data);
    } else {
      this.years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
    }
    
    this.updateData();
  }
  
  private extractYearsFromData(data: MonthlySalesModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      if (!isNaN(year)) {
        uniqueYears.add(year);
      }
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
    
    if (this.years.length === 0) {
      this.years = [new Date().getFullYear()];
    } else if (!this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.onYearChange();
    }
  }
  
  private updateData(): void {
    switch (this.type) {
      case 'monthly':
        this.ordersInvoiceViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
        break;
      case 'amount':
        this.ordersInvoiceViewModel.loadTotalOrdersAmount(this.selectedYear);
        break;
      case 'count':
        this.ordersInvoiceViewModel.loadTotalOrders(this.selectedYear);
        break;
      case 'monthly-order':
        this.ordersInvoiceViewModel.loadMonthlyOrders(this.selectedYear, this.selectedMonth);
        break;
      case 'tm-year':
        this.ordersInvoiceViewModel.loadYearTmList(this.selectedYear);
        break;
      case 'monthly-tm':
        this.ordersInvoiceViewModel.loadMonthlyTm(this.selectedYear, this.selectedMonth);
        break;
    }
  }
  
  onYearChange(): void {
    if (this.selectedYear) {
      if (this.type === 'monthly-order' || this.type === 'count') {
        this.ordersInvoiceViewModel.setSelectedOrderYear(this.selectedYear);
      } else {
        this.ordersInvoiceViewModel.setSelectedYear(this.selectedYear);
      }
      this.updateData();
    }
  }
  
  onMonthChange(): void {
    if (this.selectedYear && this.selectedMonth !== undefined) {
      this.updateData();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
