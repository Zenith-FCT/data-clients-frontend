import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { InvoiceDataRepositoryService } from '../../data/repositories/invoice-data-repository.service';

@Injectable({
  providedIn: 'root'
})
export class GetInvoicesForMonthUseCase {
  private invoiceRepository = inject(InvoiceDataRepositoryService);
  
  execute(month: number, year: number): Observable<Invoice[]> {
    return this.invoiceRepository.getAllInvoices().pipe(
      map(invoices => this.filterInvoicesByMonth(invoices, month, year))
    );
  }
  
  private filterInvoicesByMonth(invoices: Invoice[], month: number, year: number): Invoice[] {
    if (!invoices || !Array.isArray(invoices)) {
      return [];
    }
    
    return invoices.filter(invoice => {
      if (!invoice.date) return false;
      
      const invoiceDate = new Date(invoice.date);
      return (
        invoiceDate.getMonth() + 1 === month && 
        invoiceDate.getFullYear() === year
      );
    });
  }
}