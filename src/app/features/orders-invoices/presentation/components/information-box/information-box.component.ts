import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersViewModelService } from '../../view-model/orders-view-model.service';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-information-box',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DecimalPipe],
  templateUrl: './information-box.component.html',
  styleUrl: './information-box.component.css'
})
export class InformationBoxComponent implements OnInit, OnDestroy {
  
  constructor(public ordersViewModel: OrdersViewModelService) {
  }

  ngOnInit(): void {
    // Cargar el total de pedidos al inicializar el componente
    this.ordersViewModel.loadTotalOrdersAmount();
  }

  refreshTotalAmount(): void {
    this.ordersViewModel.refreshData(true);
  }

  ngOnDestroy(): void {
    // El servicio ya maneja la limpieza de suscripciones
  }
}
