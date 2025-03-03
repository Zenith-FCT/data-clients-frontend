import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { PedidosFacturaComponent } from './features/pedidos-factura/components/pedidos-factura/pedidos-factura.component';

export class SettingsComponent {}

export const routes: Routes = [
  { path: '', 
    component: DashboardLayoutComponent,  
    children: [
      {
        path: '',
        redirectTo: 'pedfact',
        pathMatch: 'full'
      },
      {
        path: 'pedfact',
        component: PedidosFacturaComponent
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
        loadComponent: () => import('./features/cupones/components/cupones/cupones.component').then(m => m.CuponesComponent)
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