import { Observable } from "rxjs";
import { Client, Invoice, Product } from "../models/invoice.model";

export interface InvoiceRepository {
    getAllInvoices(): Observable<Invoice[]>;
    getInvoiceById(id: string): Observable<Invoice>;
    getInvoicesByClient(client: Client): Observable<Invoice[]>;
    getInvoicesByProduct(product: Product): Observable<Invoice[]>;
    getInvoicesByMonth(date: Date): Observable<Invoice[]>;
}