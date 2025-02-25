import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

// Vamos a crear un componente HomeComponent temporal para las rutas
// Puedes reemplazarlo después con tus propios componentes
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: '<div class="p-4"><h2>Home Page</h2><p>Contenido de la página principal</p></div>'
})
export class HomeComponent {}

@Component({
  selector: 'app-ecommerce-orders',
  standalone: true,
  template: '<div class="p-4"><h2>Pedidos y Facturación</h2><p>Gestión de pedidos y facturación</p></div>'
})
export class OrdersComponent {}

@Component({
  selector: 'app-ecommerce-products',
  standalone: true,
  template: '<div class="p-4"><h2>Productos</h2><p>Gestión de productos</p></div>'
})
export class ProductsComponent {}

@Component({
  selector: 'app-ecommerce-customers',
  standalone: true,
  template: '<div class="p-4"><h2>Clientes</h2><p>Gestión de clientes</p></div>'
})
export class CustomersComponent {}

@Component({
  selector: 'app-ecommerce-carts',
  standalone: true,
  template: '<div class="p-4"><h2>Carritos</h2><p>Gestión de carritos de compra</p></div>'
})
export class CartsComponent {}

@Component({
  selector: 'app-ecommerce-coupons',
  standalone: true,
  template: '<div class="p-4"><h2>Cupones</h2><p>Gestión de cupones de descuento</p></div>'
})
export class CouponsComponent {}

@Component({
  selector: 'app-ecommerce-subscriptions',
  standalone: true,
  template: '<div class="p-4"><h2>Suscripciones</h2><p>Gestión de suscripciones</p></div>'
})
export class SubscriptionsComponent {}

@Component({
  selector: 'app-profile',
  standalone: true,
  template: '<div class="p-4"><h2>Perfil</h2><p>Información de perfil</p></div>'
})
export class ProfileComponent {}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: '<div class="p-4"><h2>Dashboard</h2><p>Panel de control principal</p></div>'
})
export class DashboardComponent {}

@Component({
  selector: 'app-settings',
  standalone: true,
  template: '<div class="p-4"><h2>Configuración</h2><p>Configuración de la aplicación</p></div>'
})
export class SettingsComponent {}

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  
  // Rutas para E-commerce
  { path: 'ecommerce/orders', component: OrdersComponent },
  { path: 'ecommerce/products', component: ProductsComponent },
  { path: 'ecommerce/customers', component: CustomersComponent },
  { path: 'ecommerce/carts', component: CartsComponent },
  { path: 'ecommerce/coupons', component: CouponsComponent },
  { path: 'ecommerce/subscriptions', component: SubscriptionsComponent },
  
  // Otras rutas
  { path: 'profile', component: ProfileComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/home' }
];