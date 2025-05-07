import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { CartsViewModelService } from '../../../viewmodel/carts-viewmodel.service';

@Component({
  selector: 'app-information-box-carts',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './information-box-carts.component.html',
  styleUrls: ['./information-box-carts.component.scss']
})
export class InformationBoxCartsComponent implements OnInit, OnDestroy {
  @Input() type: 'total' | 'total-monthly' | 'rate' | 'rate-monthly' = 'total';
  
  private destroy$ = new Subject<void>();
  loading = false;
  
  private previousMonth: number | null = null;
  private previousYear: number | null = null;
  private previousAllYearsMode: boolean = false;

  constructor(public cartsViewModel: CartsViewModelService) {
    effect(() => {
      this.loading = this.cartsViewModel.loading$();
    });
    
    effect(() => {
      const currentMonth = this.cartsViewModel.selectedMonth$();
      const currentYear = this.cartsViewModel.selectedYear$();
      const currentAllYearsMode = this.cartsViewModel.isAllYearsMode$();
      
      if (this.previousMonth !== currentMonth || 
          this.previousYear !== currentYear || 
          this.previousAllYearsMode !== currentAllYearsMode) {
        
        this.previousMonth = currentMonth;
        this.previousYear = currentYear;
        this.previousAllYearsMode = currentAllYearsMode;
        
        if (this.type) {
          this.loadData();
        }
      }
    });
  }

  getTitle(): string {
    switch (this.type) {
      case 'total': return 'Total de Carritos Abandonados';
      case 'total-monthly': return 'Carritos Abandonados Mensuales';
      case 'rate': return 'Tasa de Abandono';
      case 'rate-monthly': return 'Tasa de Abandono Mensual';
      default: return '';
    }
  }

  getValue(): number {
    const isAllYears = this.cartsViewModel.isAllYearsMode$();
    const isMonthlyType = this.type === 'total-monthly' || this.type === 'rate-monthly';
    const hasSelectedMonth = this.cartsViewModel.selectedMonth$() !== null;

   if (isAllYears && !isMonthlyType) {
      return this.type === 'total' ? this.cartsViewModel.allCarts$() : this.cartsViewModel.allRate$();
    }

    if (hasSelectedMonth && isMonthlyType) {
      return this.type === 'total-monthly' 
        ? this.cartsViewModel.totalCartsMonthly$() 
        : this.cartsViewModel.averageCartsMonthly$();
    }

    switch (this.type) {
      case 'total': 
        return this.cartsViewModel.carts$();
      case 'total-monthly': 
        return this.cartsViewModel.carts$();
      case 'rate': 
        return this.cartsViewModel.averageLostCarts$();
      case 'rate-monthly': 
        return this.cartsViewModel.averageLostCarts$();
      default: 
        return 0;
    }
  }

  getUnit(): string {
    return this.type.includes('rate') ? '%' : '';
  }

  getDescription(): string {
    const month = this.cartsViewModel.selectedMonth$();
    const year = this.cartsViewModel.selectedYear$();
    const isAllYears = this.cartsViewModel.isAllYearsMode$();
    
    if ((this.type === 'total-monthly' || this.type === 'rate-monthly') && month !== null) {
      const monthName = this.getMonthName(month);
      return this.type === 'total-monthly'
        ? `Carritos abandonados en ${monthName} del ${year}`
        : `Tasa de abandono en ${monthName} del ${year}`;
    }
    
    switch (this.type) {
      case 'total':
        return isAllYears ? 'Total de carritos abandonados (todos los años)' : `Total de carritos abandonados en ${year}`;
      case 'total-monthly':
        return month === null ? `Total de carritos abandonados en ${year}` : '';
      case 'rate':
        return isAllYears ? 'Tasa total de abandono (todos los años)' : `Tasa total de abandono en ${year}`;
      case 'rate-monthly':
        return month === null ? `Tasa total de abandono en ${year}` : '';
      default:
        return '';
    }
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  loadData(): void {
    const isAllYears = this.cartsViewModel.isAllYearsMode$();
    const isMonthlyType = this.type === 'total-monthly' || this.type === 'rate-monthly';
    const hasSelectedMonth = this.cartsViewModel.selectedMonth$() !== null;
    
    if (isMonthlyType && hasSelectedMonth) {
      this.cartsViewModel.loadMonthlyAbandonedCarts();
      return;
    }
    if (isAllYears && !isMonthlyType) {
      if (this.type === 'total') {
        this.cartsViewModel.loadAllCarts();
      } else if (this.type === 'rate') {
        this.cartsViewModel.loadAllRateAbandonedCarts();
      }
    } else {
      if (this.type === 'total' || (this.type === 'total-monthly' && !hasSelectedMonth)) {
        this.cartsViewModel.loadCarts();
      } else if (this.type === 'rate' || (this.type === 'rate-monthly' && !hasSelectedMonth)) {
        this.cartsViewModel.loadAverageLostCarts();
      } else if (this.type === 'total-monthly' || this.type === 'rate-monthly') {
        if (hasSelectedMonth) {
          this.cartsViewModel.loadMonthlyAbandonedCarts();
        } else {
          if (this.type === 'total-monthly') {
            this.cartsViewModel.loadCarts();
          } else {
            this.cartsViewModel.loadAverageLostCarts();
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
