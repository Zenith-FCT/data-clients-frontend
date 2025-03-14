import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './core/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardLayoutComponent,  
    children: [
      {
        path: '',
        redirectTo: 'pedfact',
        pathMatch: 'full'
      },
      {
        path: 'pedfact',
        loadComponent: () => import('./features/pedidos-factura/components/pedidos-factura/pedidos-factura.component').then(m => m.PedidosFacturaComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/components/clients/clients.component').then(m => m.ClientsComponent)
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
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/products/components/products.component').then(m => m.ProductsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];