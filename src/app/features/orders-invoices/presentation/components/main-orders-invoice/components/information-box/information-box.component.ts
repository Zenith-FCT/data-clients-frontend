import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersViewModelService } from '../../../../view-model/total-orders-view-model.service';
import { MonthlySalesViewModelService } from '../../../../view-model/monthly-orders-viewmodel.service';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-information-box',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DecimalPipe, MatSelectModule, FormsModule],
  templateUrl: './information-box.component.html',
  styleUrl: './information-box.component.css'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  @Input() type: 'amount' | 'count' | 'monthly' = 'amount';
  
  selectedMonth = new Date().getMonth();
  selectedYear = new Date().getFullYear();
  
  years = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  months = [
    { value: 0, name: 'Enero' },
    { value: 1, name: 'Febrero' },
    { value: 2, name: 'Marzo' },
    { value: 3, name: 'Abril' },
    { value: 4, name: 'Mayo' },
    { value: 5, name: 'Junio' },
    { value: 6, name: 'Julio' },
    { value: 7, name: 'Agosto' },
    { value: 8, name: 'Septiembre' },
    { value: 9, name: 'Octubre' },
    { value: 10, name: 'Noviembre' },
    { value: 11, name: 'Diciembre' }
  ];

  constructor(
    public ordersViewModel: OrdersViewModelService,
    public monthlySalesViewModel: MonthlySalesViewModelService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.type === 'amount') {
      this.ordersViewModel.loadTotalOrdersAmount();
    } else if (this.type === 'count') {
      this.ordersViewModel.loadTotalOrders();
    } else if (this.type === 'monthly') {
      this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
    }
  }

  onMonthChange(): void {
    if (this.type === 'monthly') {
      this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
    }
  }

  onYearChange(): void {
    if (this.type === 'monthly') {
      this.monthlySalesViewModel.loadMonthlySales(this.selectedYear, this.selectedMonth);
    }
  }

  refreshDataOrders(): void {
    if (this.type === 'monthly') {
      this.monthlySalesViewModel.refreshData(true);
    } else {
      this.ordersViewModel.refreshData(true);
    }
  }

  ngOnDestroy(): void {
  }
}
