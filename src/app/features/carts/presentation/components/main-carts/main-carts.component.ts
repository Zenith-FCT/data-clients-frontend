import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InformationBoxCartsComponent } from './information-box-carts/information-box-carts.component';
import { MonthlyAbandonedCartsComponent } from './monthly-abandoned-carts/monthly-abandoned-carts.component';
import { CartsViewModelService } from '../../viewmodel/carts-viewmodel.service';
import { EvolutionAbandonedCartsComponent } from './evolution-abandoned-carts/evolution-abandoned-carts.component';
import { MonthlyCartRateAbandonedComponent } from './monthly-cart-rate-abandoned/monthly-cart-rate-abandoned.component';

@Component({
  selector: 'app-main-carts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    InformationBoxCartsComponent,
    MonthlyAbandonedCartsComponent,
    EvolutionAbandonedCartsComponent,
    MonthlyCartRateAbandonedComponent
  ],
  templateUrl: './main-carts.component.html',
  styleUrls: ['./main-carts.component.scss']
})
export class MainCartsComponent implements OnInit {
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

  constructor(public cartsViewModel: CartsViewModelService) {}

  ngOnInit(): void {
    this.onDateChange();
  }

  onDateChange(): void {
    this.cartsViewModel.setSelectedMonth(this.selectedMonth);
    this.cartsViewModel.setSelectedYear(this.selectedYear);
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }
}
