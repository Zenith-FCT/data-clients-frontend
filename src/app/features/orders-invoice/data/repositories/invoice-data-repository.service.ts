import { inject, Injectable } from '@angular/core';
import { InvoiceRepository } from '../../domain/repositories/invoice.repository';
import { Observable } from 'rxjs';
import { Invoice, Client, Product } from '../../domain/models/invoice.model';
import { MockInvoicesService } from '../datasources/mock-invoices.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDataRepositoryService implements InvoiceRepository {

  private dataSource = inject(MockInvoicesService);
  getAllInvoices(): Observable<Invoice[]> {
    return this.dataSource.getAllInvoices();
  }
  getInvoiceById(id: string): Observable<Invoice> {
    return this.dataSource.getInvoiceById(id);
  }
  getInvoicesByClient(client: Client): Observable<Invoice[]> {
    return this.dataSource.getInvoicesByClient(client);
  }
  getInvoicesByProduct(product: Product): Observable<Invoice[]> {
    return this.dataSource.getInvoicesByProduct(product);
  }
  getInvoicesByMonth(date: Date): Observable<Invoice[]> {
    return this.dataSource.getInvoicesByMonth(date);
  }
}
