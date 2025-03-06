import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { DashboardLayoutComponent } from './core/components/dashboard-layout/dashboard-layout.component';
import { OrdersInvoiceComponent } from './features/orders-invoice/components/orders-invoice/orders-invoice.component';
import { InvoiceComponent } from './features/orders-invoice/components/invoice/invoice.component';
import { ORDERS_INVOICE_ROUTES } from './features/orders-invoice/orders-invoice.routes';

export class SettingsComponent {}

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardLayoutComponent,  
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full'
      },
      {
        path: 'orders',
        children: ORDERS_INVOICE_ROUTES
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/productos/components/productos/productos.component').then(m => m.ProductosComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/components/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'carritos',
        loadComponent: () => import('./features/carritos/components/carritos/carritos.component').then(m => m.CarritosComponent)
      },
      {
        path: 'cupones',
        loadComponent: () => import('./features/coupons/components/coupons/coupons.component').then(m => m.CouponsComponent)
      },
      {
        path: 'suscripciones',
        loadComponent: () => import('./features/suscripciones/components/suscripciones/suscripciones.component').then(m => m.SuscripcionesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];