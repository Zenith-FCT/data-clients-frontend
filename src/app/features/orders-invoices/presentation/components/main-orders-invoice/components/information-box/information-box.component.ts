import { Component, OnInit, OnDestroy, Input, effect, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-information-box',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './information-box.component.html',
  styleUrl: './information-box.component.scss'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  @Input() type: 'amount' |'tm-year'| 'count' |'monthly-tm'| 'monthly' | 'monthly-order' = 'amount';
  
  private destroy$ = new Subject<void>();
  loading = false;
  monthName = '';
  
  selectedMonth = computed(() => {
    const monthIndex = this.ordersInvoiceViewModel.selectedMonth$();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const adjustedIndex = monthIndex - 1;
    return months[adjustedIndex >= 0 && adjustedIndex < 12 ? adjustedIndex : 0];
  });
  
  constructor(
    public ordersInvoiceViewModel: OrdersInvoiceViewModelService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      this.loading = this.ordersInvoiceViewModel.isLoading$();
    });
    
    effect(() => {
      console.log('Month changed effect triggered');
      this.monthName = this.selectedMonth();
      this.cdr.markForCheck();
    });

    effect(() => {
      const month = this.ordersInvoiceViewModel.selectedMonth$();
      const year = this.ordersInvoiceViewModel.selectedYear$();
      const tmYear = this.ordersInvoiceViewModel.selectedTmYear$();
      
      console.log('Month/Year changed', { month, year, tmYear });
      
      if (this.type) {
        this.updateData();
        this.cdr.markForCheck();
      }
    });
  }
  
  ngOnInit(): void {
    console.log('Component initialized with type:', this.type);
    this.monthName = this.selectedMonth(); 
    this.updateData();
  }
  
  private updateData(): void {
    console.log('Updating data for type:', this.type);
    switch (this.type) {
      case 'monthly':
        this.ordersInvoiceViewModel.loadMonthlySales(
          this.ordersInvoiceViewModel.selectedYear$(), 
          this.ordersInvoiceViewModel.selectedMonth$()
        );
        break;
      case 'amount':
        this.ordersInvoiceViewModel.loadTotalOrdersAmount(
          this.ordersInvoiceViewModel.selectedYear$()
        );
        break;
      case 'count':
        this.ordersInvoiceViewModel.loadTotalOrders(
          this.ordersInvoiceViewModel.selectedYear$()
        );
        break;
      case 'monthly-order':
        this.ordersInvoiceViewModel.loadMonthlyOrders(
          this.ordersInvoiceViewModel.selectedYear$(), 
          this.ordersInvoiceViewModel.selectedMonth$()
        );
        break;
      case 'tm-year':
        this.ordersInvoiceViewModel.loadYearTmList(
          this.ordersInvoiceViewModel.selectedTmYear$()
        );
        break;
      case 'monthly-tm':
        this.ordersInvoiceViewModel.loadMonthlyTm(
          this.ordersInvoiceViewModel.selectedTmYear$(), 
          this.ordersInvoiceViewModel.selectedMonth$()
        );
        break;
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}