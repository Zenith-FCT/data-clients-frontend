import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderInvoice } from '../models/order-invoice.model';
import { OrderInvoiceRepositoryImpl } from '../../data/repositories/order-invoice-repository-impl';

@Injectable({
    providedIn: 'root'
})
export class GetAllInvoicesUseCase {
    private repository = inject(OrderInvoiceRepositoryImpl);

    execute(): Observable<OrderInvoice[]> {
        return this.repository.getAllInvoices();
    }
}