import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

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
  @Input() type: 'amount' | 'count' | 'monthly' | 'monthly-order' = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  months = Array.from({length: 12}, (_, i) => ({ value: i }));

  constructor(public monthlySalesViewModel: MonthlySalesViewModelService) {
    effect(() => {
      const year = this.type === 'monthly-order' ? 
        this.monthlySalesViewModel.selectedOrderYear$() : 
        this.monthlySalesViewModel.selectedYear$();
        
      if (year !== this.selectedYear) {
        this.selectedYear = year;
        this.updateData();
      }
    });
    
    effect(() => {
      this.loading = this.monthlySalesViewModel.isLoading$();
    });
  }

  ngOnInit(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;
    
    this.updateData();
  }

  private updateData(): void {
    switch (this.type) {
      case 'monthly':
        this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
        break;
      case 'amount':
        this.monthlySalesViewModel.loadTotalOrdersAmount(this.selectedYear);
        break;
      case 'count':
        this.monthlySalesViewModel.loadTotalOrders(this.selectedYear);
        break;
      case 'monthly-order':
        this.monthlySalesViewModel.loadMonthlyOrders(this.selectedYear, this.selectedMonth);
        break;
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      if (this.type === 'monthly-order') {
        this.monthlySalesViewModel.setSelectedOrderYear(this.selectedYear);
      } else {
        this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
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
