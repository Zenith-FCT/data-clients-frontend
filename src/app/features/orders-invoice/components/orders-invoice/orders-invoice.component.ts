import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetAllInvoicesUseCase } from '../../domain/use-cases/get-all-invoices.use-case';
import { OrderInvoice } from '../../domain/models/order-invoice.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders-invoice',
  standalone: true,
  imports: [CommonModule],
  providers: [GetAllInvoicesUseCase],
  templateUrl: `./orders-invoice.component.html`,
  styleUrl: `./orders-invoice.component.css`
})
export class OrdersInvoiceComponent {
  private getAllInvoicesUseCase = inject(GetAllInvoicesUseCase);
  invoices$: Observable<OrderInvoice[]>;

  constructor() {
    this.invoices$ = this.getAllInvoicesUseCase.execute();
  }
}