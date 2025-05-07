import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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
  
  // Almacenar valores anteriores para detectar cambios
  private previousMonth: number | null = null;
  private previousYear: number | null = null;

  constructor(public cartsViewModel: CartsViewModelService) {
    // Escuchar el estado de carga
    effect(() => {
      this.loading = this.cartsViewModel.loading$();
    });
    
    // Escuchar cambios en el mes y año seleccionados
    effect(() => {
      const currentMonth = this.cartsViewModel.selectedMonth$();
      const currentYear = this.cartsViewModel.selectedYear$();
      
      // Si hay cambios en el mes o año, recargar datos según el tipo de caja
      if (this.previousMonth !== currentMonth || this.previousYear !== currentYear) {
        this.previousMonth = currentMonth;
        this.previousYear = currentYear;
        
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
    switch (this.type) {
      case 'total': return this.cartsViewModel.carts$();
      case 'total-monthly': 
        if (this.cartsViewModel.selectedMonth$() === null) {
          return this.cartsViewModel.carts$();
        } else {
          return this.cartsViewModel.totalCartsMonthly$();
        }
      case 'rate': return this.cartsViewModel.averageLostCarts$();
      case 'rate-monthly': 
        if (this.cartsViewModel.selectedMonth$() === null) {
          return this.cartsViewModel.averageLostCarts$();
        } else {
          return this.cartsViewModel.averageCartsMonthly$();
        }
      default: return 0;
    }
  }

  getUnit(): string {
    return this.type.includes('rate') ? '%' : '';
  }

  getDescription(): string {
    const month = this.cartsViewModel.selectedMonth$();
    const year = this.cartsViewModel.selectedYear$();
    
    switch (this.type) {
      case 'total':
        return `Total de carritos abandonados en ${year}`;
      case 'total-monthly':
        if (month === null) {
          return `Total de carritos abandonados en ${year}`;
        } else {
          const monthName = this.getMonthName(month);
          return `Carritos abandonados en ${monthName} del ${year}`;
        }
      case 'rate':
        return `Tasa total de abandono en ${year}`;
      case 'rate-monthly':
        if (month === null) {
          return `Tasa total de abandono en ${year}`;
        } else {
          const monthName = this.getMonthName(month);
          return `Tasa de abandono en ${monthName} del ${year}`;
        }
      default:
        return '';
    }
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  loadData(): void {
    if (this.type === 'total') {
      this.cartsViewModel.loadCarts();
    } else if (this.type === 'rate') {
      this.cartsViewModel.loadAverageLostCarts();
    } else if (this.type === 'total-monthly') {
      if (this.cartsViewModel.selectedMonth$() === null) {
        this.cartsViewModel.loadCarts();
      } else {
        this.cartsViewModel.loadMonthlyAbandonedCarts();
      }
    } else if (this.type === 'rate-monthly') {
      if (this.cartsViewModel.selectedMonth$() === null) {
        this.cartsViewModel.loadAverageLostCarts();
      } else {
        this.cartsViewModel.loadMonthlyAbandonedCarts();
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
