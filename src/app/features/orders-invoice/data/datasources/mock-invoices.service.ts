import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client, Invoice, Product } from '../../domain/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class MockInvoicesService {
  private currentYear = new Date().getFullYear();
  private invoices: Invoice[] = [
    {
      id: '1',
      orderNumber: 'INV-2024-001',
      client: Client.RECURRENTE,
      date: new Date(this.currentYear, 0, 15), // Enero
      product: Product.MASTER,
      amount: 1500
    },
    {
      id: '2',
      orderNumber: 'INV-2024-002',
      client: Client.UHICO,
      date: new Date(this.currentYear, 1, 16), // Febrero
      product: Product.CURSO,
      amount: 800
    },
    {
      id: '3',
      orderNumber: 'INV-2024-003',
      client: Client.RECURRENTE,
      date: new Date(this.currentYear, 2, 17), // Marzo
      product: Product.MASTER,
      amount: 1500
    },
    {
      id: '4',
      orderNumber: 'INV-2024-004',
      client: Client.UHICO,
      date: new Date(this.currentYear, 2, 18), // Marzo
      product: Product.CURSO,
      amount: 800
    },
    {
      id: '5',
      orderNumber: 'INV-2024-005',
      client: Client.RECURRENTE,
      date: new Date(this.currentYear, 3, 19), // Abril
      product: Product.MEMBRESIA,
      amount: 300
    },
    {
      id: '6',
      orderNumber: 'INV-2024-006',
      client: Client.UHICO,
      date: new Date(this.currentYear, 3, 20), // Abril
      product: Product.MASTER,
      amount: 1500
    },
    {
      id: '7',
      orderNumber: 'INV-2024-007',
      client: Client.RECURRENTE,
      date: new Date(this.currentYear, 4, 21), // Mayo
      product: Product.CURSO,
      amount: 800
    },
    {
      id: '8',
      orderNumber: 'INV-2024-008',
      client: Client.UHICO,
      date: new Date(this.currentYear, 5, 22), // Junio
      product: Product.MEMBRESIA,
      amount: 300
    },
    {
      id: '9',
      orderNumber: 'INV-2024-009',
      client: Client.RECURRENTE,
      date: new Date(this.currentYear, 2, 1),
      product: Product.MEMBRESIA,
      amount: 1500
    }
  ];

  getAllInvoices(): Observable<Invoice[]> {
    console.log('MockInvoicesService: Returning', this.invoices.length, 'invoices');
    return of(this.invoices);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    const invoice = this.invoices.find(inv => inv.id === id);
    if (!invoice) throw new Error('Invoice not found');
    return of(invoice);
  }

  getInvoicesByClient(client: Client): Observable<Invoice[]> {
    return of(this.invoices.filter(inv => inv.client === client));
  }

  getInvoicesByProduct(product: Product): Observable<Invoice[]> {
    return of(this.invoices.filter(inv => inv.product === product));
  }

  getInvoicesByMonth(date: Date): Observable<Invoice[]> {
    return of(this.invoices.filter(inv => 
      inv.date.getMonth() === date.getMonth() && 
      inv.date.getFullYear() === date.getFullYear()
    ));
  }
}
