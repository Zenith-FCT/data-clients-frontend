
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
  @Input() type: 'amount' | 'count' | 'monthly' = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth();
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  months = Array.from({length: 12}, (_, i) => ({ value: i }));

  constructor(public monthlySalesViewModel: MonthlySalesViewModelService) {
    // Crear un effect para sincronizar el selectedYear con el del ViewModel
    effect(() => {
      const year = this.monthlySalesViewModel.selectedYear$();
      if (year !== this.selectedYear) {
        this.selectedYear = year;
        if (this.type === 'monthly') {
          this.monthlySalesViewModel.loadMonthlySales(year, this.selectedMonth);
        }
      }
    });

    // Crear un effect para actualizar el estado de loading
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
    
    // Cargar los datos según el tipo de caja
    if (this.type === 'monthly') {
      this.monthlySalesViewModel.loadMonthlySales(currentYear, currentMonth);
    } else if (this.type === 'amount') {
      this.monthlySalesViewModel.loadTotalOrdersAmount();
    } else if (this.type === 'count') {
      this.monthlySalesViewModel.loadTotalOrders();
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
      if (this.type === 'monthly') {
        this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
      }
    }
  }

  onMonthChange(): void {
    if (this.selectedYear && this.selectedMonth !== undefined) {
      this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
