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

  constructor(public cartsViewModel: CartsViewModelService) {
    effect(() => {
      this.loading = this.cartsViewModel.loading$();
    });
  }

  getTitle(): string {
    switch (this.type) {
      case 'total': return 'Total de Carritos Abandonados';
      case 'total-monthly': return 'Carritos Abandonados por Mes';
      case 'rate': return 'Tasa de Carritos Abandonados';
      case 'rate-monthly': return 'Tasa de Carritos Abandonados por Mes';
      default: return '';
    }
  }

  getValue(): number {
    switch (this.type) {
      case 'total': return this.cartsViewModel.carts$();
      case 'total-monthly': return this.cartsViewModel.totalCartsMonthly$();
      case 'rate': return this.cartsViewModel.averageLostCarts$();
      case 'rate-monthly': return this.cartsViewModel.averageCartsMonthly$();
      default: return 0;
    }
  }

  getUnit(): string {
    return this.type.includes('rate') ? '%' : '';
  }

  getDescription(): string {
    const month = this.cartsViewModel.selectedMonth$();
    const year = this.cartsViewModel.selectedYear$();
    const monthName = month ? this.getMonthName(month) : '';

    switch (this.type) {
      case 'total':
        return `Total de carritos abandonados en ${year}`;
      case 'total-monthly':
        return `Carritos abandonados en ${monthName} del ${year}`;
      case 'rate':
        return `Tasa total de carritos abandonados en ${year}`;
      case 'rate-monthly':
        return `Tasa de carritos abandonados en ${monthName} del ${year}`;
      default:
        return '';
    }
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  ngOnInit(): void {
    if (this.type === 'total' || this.type === 'rate') {
      this.cartsViewModel.loadCarts();
      this.cartsViewModel.loadAverageLostCarts();
    } else {
      this.cartsViewModel.loadMonthlyAbandonedCarts();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
