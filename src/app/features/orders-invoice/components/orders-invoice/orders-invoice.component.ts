import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-invoice',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-invoice.component.html',
  styleUrl: './orders-invoice.component.css'
})
export class OrdersInvoiceComponent {
  // Este componente actúa como contenedor para las rutas de facturas
  // No necesita lógica adicional ya que las funcionalidades están en los componentes hijos
}