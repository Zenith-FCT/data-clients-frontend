import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MainGeneralComponent } from './features/general/components/main-general/main-general.component';
import { MainDashboardLayoutComponent } from './core/components/main-dashboard-layout/main-dashboard-layout.component';


export const routes: Routes = [
    {
        path: '',
        component: MainDashboardLayoutComponent,
        children : [
            {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
            },
            {
                path: 'general',
                component: MainGeneralComponent
            },
            {
                path: 'orders-invoices',
                loadComponent: () => import('./features/orders-invoices/presentation/components/main-orders-invoice/main-orders-invoice.component').then(m => m.MainOrdersInvoiceComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/clients/presentation/main-clients.component').then(m => m.ClientsComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./features/products/presentation/main-products.component').then(m => m.MainProductsComponent)
            },
            {
                path: 'carts',
                loadComponent: () => import('./features/carts/components/main-carts/main-carts.component').then(m => m.MainCartsComponent)
            },
            {
                path: 'coupons',
                loadComponent: () => import('./features/coupons/presentation/main-coupons/main-coupons.component').then(m => m.MainCouponsComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
