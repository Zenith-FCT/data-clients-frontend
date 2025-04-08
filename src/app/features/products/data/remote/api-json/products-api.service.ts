import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, tap } from 'rxjs';
import { TotalBillingPerProductModel } from '../../../domain/total-billing-per-product.model';
import { TotalSalesPerProductModel } from '../../../domain/total-sales-per-product.model';

// Interfaces para representar los datos crudos de la API
interface ProductApi {
  SKU: string;
  Nombre_producto: string;
  Categoria: string;
  Precio: number;
  Stock: number;
}

interface OrderProductApi {
  nombre_producto: string;
  sku: string;
  categoria: string;
}

interface OrderApi {
  id: string;
  numero_pedido: string;
  fecha_pedido: string;
  nombre_cliente: string;
  email: string;
  total_pedido: string | number;
  total_descuento: string | number;
  nombre_cupon_descuento: string;
  productos: OrderProductApi[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  private baseUrl = environment.apiUrl;
  private productsUrl = `${this.baseUrl}/productos`;
  private ordersUrl = `${this.baseUrl}/pedidos`;

  constructor(private http: HttpClient) {
    console.log('ProductsApiService initialized');
  }

  /**
   * Obtiene la facturación total por producto directamente calculada en el servicio
   */
  getTotalBillingPerProduct(): Observable<TotalBillingPerProductModel[]> {
    console.log('Obteniendo datos de productos y pedidos para calcular facturación total');
    
    // Utilizamos forkJoin para obtener productos y pedidos en paralelo
    return forkJoin({
      products: this.http.get<ProductApi[]>(this.productsUrl),
      orders: this.http.get<OrderApi[]>(this.ordersUrl)
    }).pipe(
      tap(data => {
        console.log(`Recibidos ${data.products.length} productos y ${data.orders.length} pedidos`);
      }),
      map(({ products, orders }) => {
        // Crear un mapa para acumular la facturación por producto
        const productBillingMap = new Map<string, TotalBillingPerProductModel>();
        
        // Inicializar el mapa con todos los productos
        products.forEach(product => {
          productBillingMap.set(product.SKU, new TotalBillingPerProductModel(
            product.Categoria,
            product.Nombre_producto,
            0 // Inicializamos la facturación en cero
          ));
        });
        
        // Procesar los pedidos para calcular la facturación total por producto
        orders.forEach(order => {
          // Convertir el total del pedido a número
          const orderTotal = typeof order.total_pedido === 'number' ? 
            order.total_pedido : parseFloat(order.total_pedido);
          
          const orderProducts = order.productos || [];
          
          // Si el pedido solo tiene un producto, asignarle todo el total
          if (orderProducts.length === 1) {
            const sku = orderProducts[0].sku;
            const product = productBillingMap.get(sku);
            
            if (product) {
              product.totalBilling += orderTotal;
              productBillingMap.set(sku, product);
            }
          } 
          // Si tiene múltiples productos, distribuir de manera equitativa
          else if (orderProducts.length > 1) {
            // Dividir el total entre todos los productos del pedido
            const amountPerProduct = orderTotal / orderProducts.length;
            
            orderProducts.forEach(orderProduct => {
              const product = productBillingMap.get(orderProduct.sku);
              if (product) {
                product.totalBilling += amountPerProduct;
                productBillingMap.set(orderProduct.sku, product);
              }
            });
          }
        });
        
        // Convertir el mapa a un array y ordenar por facturación total
        return Array.from(productBillingMap.values())
          .filter(product => product.totalBilling > 0) // Incluir solo productos con facturación
          .sort((a, b) => b.totalBilling - a.totalBilling); // Ordenar de mayor a menor
      }),
      tap(result => {
        console.log(`Calculada facturación para ${result.length} productos`);
        if (result.length > 0) {
          console.log('Muestra del primer producto:', result[0]);
        }
      }),
      catchError(error => {
        console.error('Error al obtener o procesar datos de productos y pedidos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene el total de ventas por producto directamente calculado en el servicio
   */
  getTotalSalesPerProduct(): Observable<TotalSalesPerProductModel[]> {
    console.log('Obteniendo datos de productos y pedidos para calcular ventas totales');
    
    // Utilizamos forkJoin para obtener productos y pedidos en paralelo
    return forkJoin({
      products: this.http.get<ProductApi[]>(this.productsUrl),
      orders: this.http.get<OrderApi[]>(this.ordersUrl)
    }).pipe(
      tap(data => {
        console.log(`Recibidos ${data.products.length} productos y ${data.orders.length} pedidos`);
      }),
      map(({ products, orders }) => {
        // Crear un mapa para acumular las ventas por producto
        const productSalesMap = new Map<string, TotalSalesPerProductModel>();
        
        // Inicializar el mapa con todos los productos
        products.forEach(product => {
          productSalesMap.set(product.SKU, new TotalSalesPerProductModel(
            product.Categoria,
            product.Nombre_producto,
            0 // Inicializamos las ventas en cero
          ));
        });
        
        // Procesar los pedidos para calcular las ventas totales por producto
        orders.forEach(order => {
          const orderProducts = order.productos || [];
          
          // Contar cada producto como una venta
          orderProducts.forEach(orderProduct => {
            const product = productSalesMap.get(orderProduct.sku);
            if (product) {
              product.totalSales += 1; // Incrementamos en 1 la venta por producto
              productSalesMap.set(orderProduct.sku, product);
            }
          });
        });
        
        // Convertir el mapa a un array y ordenar por ventas totales
        return Array.from(productSalesMap.values())
          .filter(product => product.totalSales > 0) // Incluir solo productos con ventas
          .sort((a, b) => b.totalSales - a.totalSales); // Ordenar de mayor a menor
      }),
      tap(result => {
        console.log(`Calculadas ventas totales para ${result.length} productos`);
        if (result.length > 0) {
          console.log('Muestra del primer producto:', result[0]);
        }
      }),
      catchError(error => {
        console.error('Error al obtener o procesar datos de productos y pedidos:', error);
        return of([]);
      })
    );
  }
}
