import { Component, OnInit, OnDestroy, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
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
    FormsModule
  ],
  templateUrl: './information-box-carts.component.html',
  styleUrls: ['./information-box-carts.component.scss']
})
export class InformationBoxCartsComponent implements OnInit, OnDestroy {
  @Input() type: 'total' | 'monthly' = 'total';
  
  private destroy$ = new Subject<void>();
  loading = false;
  
  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('es-ES', { month: 'long' });
  }

  constructor(public cartsViewModel: CartsViewModelService) {
    effect(() => {
      this.loading = this.cartsViewModel.loading$();
    });
  }
  
  ngOnInit(): void {
    if (this.type === 'total') {
      this.cartsViewModel.loadCarts();
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
