import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderInvoice } from '../../domain/models/order-invoice.model';
import { OrderInvoiceRepository } from '../../domain/repositories/order-invoice.repository';
import { MockInvoiceDataSource } from '../datasources/mock-invoice.datasource';

@Injectable({
    providedIn: 'root'
})
export class OrderInvoiceRepositoryImpl implements OrderInvoiceRepository {
    private dataSource = inject(MockInvoiceDataSource);

    getAllInvoices(): Observable<OrderInvoice[]> {
        return this.dataSource.getAllInvoices();
    }

    getInvoiceById(id: string): Observable<OrderInvoice> {
        return this.dataSource.getInvoiceById(id);
    }

    createInvoice(invoice: Omit<OrderInvoice, 'id'>): Observable<OrderInvoice> {
        return this.dataSource.createInvoice(invoice);
    }

    updateInvoice(invoice: OrderInvoice): Observable<OrderInvoice> {
        return this.dataSource.updateInvoice(invoice);
    }

    deleteInvoice(id: string): Observable<void> {
        return this.dataSource.deleteInvoice(id);
    }

    getInvoicesByStatus(status: string): Observable<OrderInvoice[]> {
        return this.dataSource.getInvoicesByStatus(status);
    }
}