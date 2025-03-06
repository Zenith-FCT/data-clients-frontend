import { Routes } from '@angular/router';
import { OrdersInvoiceComponent } from './components/orders-invoice/orders-invoice.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { InvoiceDetailComponent } from './components/invoice-detail/invoice-detail.component';

export const ORDERS_INVOICE_ROUTES: Routes = [
  {
    path: '',
    component: OrdersInvoiceComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: InvoiceComponent },
      { path: 'detail', component: InvoiceDetailComponent }
    ]
  }
];
