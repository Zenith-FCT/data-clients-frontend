import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersViewModelService } from '../../../../view-model/orders-view-model.service';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-information-box',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DecimalPipe],
  templateUrl: './information-box.component.html',
  styleUrl: './information-box.component.css'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  @Input() type: 'amount' | 'count' = 'amount';

  constructor(public ordersViewModel: OrdersViewModelService) {}

  ngOnInit(): void {
    if (this.type === 'amount') {
      this.ordersViewModel.loadTotalOrdersAmount();
    } else {
      this.ordersViewModel.loadTotalOrders();
    }
  }

  refreshDataOrders(): void {
    this.ordersViewModel.refreshData(true);
  }

  ngOnDestroy(): void {
    // El servicio ya maneja la limpieza de suscripciones
  }
}
