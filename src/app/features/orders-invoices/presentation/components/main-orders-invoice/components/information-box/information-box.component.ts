import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
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
  @Input() type: 'amount' | 'count' | 'monthly' | 'monthly-order' = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  years: number[] = [];
  months = Array.from({length: 12}, (_, i) => ({ value: i }));
  
  constructor(public monthlySalesViewModel: MonthlySalesViewModelService) {
    // Listen for year changes based on box type
    effect(() => {
      // For types amount and monthly, use selectedYear$
      if (this.type === 'amount' || this.type === 'monthly') {
        const year = this.monthlySalesViewModel.selectedYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          this.updateData();
        }
      }
      else if (this.type === 'monthly-order' || this.type === 'count') {
        const year = this.monthlySalesViewModel.selectedOrderYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          this.updateData();
        }
      }
    });
    
    effect(() => {
      this.loading = this.monthlySalesViewModel.isLoading$();
    });
    
    // Listen for data changes to extract available years
    effect(() => {
      const data = this.monthlySalesViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.extractYearsFromData(data);
      }
    });
  }
  
  ngOnInit(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Initialize with values from service based on type
    if (this.type === 'monthly-order' || this.type === 'count') {
      this.selectedYear = this.monthlySalesViewModel.selectedOrderYear$();
    } else {
      this.selectedYear = this.monthlySalesViewModel.selectedYear$();
    }
    this.selectedMonth = currentMonth;
    
    // Load initial data
    const data = this.monthlySalesViewModel.allMonthlySales$();
    if (data && data.length > 0) {
      this.extractYearsFromData(data);
    } else {
      // Fallback to last 5 years if no data is available yet
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
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a); // Sort in descending order (newest first)
    
    // If no years found or the currently selected year is not in the list, add current year
    if (this.years.length === 0) {
      this.years = [new Date().getFullYear()];
    } else if (!this.years.includes(this.selectedYear)) {
      // Select the most recent year if current selection isn't available
      this.selectedYear = this.years[0];
      this.onYearChange();
    }
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
      if (this.type === 'monthly-order' || this.type === 'count') {
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
