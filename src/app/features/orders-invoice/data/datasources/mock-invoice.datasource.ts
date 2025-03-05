import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrderInvoice, InvoiceStatus } from '../../domain/models/order-invoice.model';

@Injectable({
    providedIn: 'root'
})
export class MockInvoiceDataSource {
    private invoices: OrderInvoice[] = [
        {
            id: '1',
            orderNumber: 'INV-2024-001',
            clientId: 'CLI-001',
            clientName: 'Juan Pérez',
            date: new Date('2024-01-15'),
            dueDate: new Date('2024-02-15'),
            items: [
                {
                    productId: 'PROD-001',
                    productName: 'Laptop Gaming',
                    quantity: 1,
                    unitPrice: 1200,
                    subtotal: 1200
                }
            ],
            total: 1200,
            status: InvoiceStatus.PENDING
        },
        {
            id: '2',
            orderNumber: 'INV-2024-002',
            clientId: 'CLI-002',
            clientName: 'María García',
            date: new Date('2024-01-16'),
            dueDate: new Date('2024-02-16'),
            items: [
                {
                    productId: 'PROD-002',
                    productName: 'Monitor 27"',
                    quantity: 2,
                    unitPrice: 300,
                    subtotal: 600
                }
            ],
            total: 600,
            status: InvoiceStatus.PAID
        }
    ];

    getAllInvoices(): Observable<OrderInvoice[]> {
        return of(this.invoices);
    }

    getInvoiceById(id: string): Observable<OrderInvoice> {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (!invoice) throw new Error('Invoice not found');
        return of(invoice);
    }

    createInvoice(invoice: Omit<OrderInvoice, 'id'>): Observable<OrderInvoice> {
        const newInvoice = {
            ...invoice,
            id: (this.invoices.length + 1).toString()
        };
        this.invoices.push(newInvoice);
        return of(newInvoice);
    }

    updateInvoice(invoice: OrderInvoice): Observable<OrderInvoice> {
        const index = this.invoices.findIndex(inv => inv.id === invoice.id);
        if (index === -1) throw new Error('Invoice not found');
        this.invoices[index] = invoice;
        return of(invoice);
    }

    deleteInvoice(id: string): Observable<void> {
        const index = this.invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
            this.invoices.splice(index, 1);
        }
        return of(void 0);
    }

    getInvoicesByStatus(status: string): Observable<OrderInvoice[]> {
        return of(this.invoices.filter(inv => inv.status === status));
    }
}