import { Observable } from 'rxjs';
import { OrderInvoice } from '../models/order-invoice.model';

export interface OrderInvoiceRepository {
    getAllInvoices(): Observable<OrderInvoice[]>;
    getInvoiceById(id: string): Observable<OrderInvoice>;
    createInvoice(invoice: Omit<OrderInvoice, 'id'>): Observable<OrderInvoice>;
    updateInvoice(invoice: OrderInvoice): Observable<OrderInvoice>;
    deleteInvoice(id: string): Observable<void>;
    getInvoicesByStatus(status: string): Observable<OrderInvoice[]>;
}