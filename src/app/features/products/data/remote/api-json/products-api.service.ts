import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of, tap } from 'rxjs';
import { TotalBillingPerProductModel } from '../../../domain/total-billing-per-product.model';
import { TotalSalesPerProductModel } from '../../../domain/total-sales-per-product.model';
import { TopProductModel } from '../../../domain/top-products.model';
import { TopProductsByMonthModel } from '../../../domain/top-products-by-month.model';
import { ProductSalesEvolutionModel } from '../../../domain/product-sales-evolution.model';

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
  cantidad?: number; // Cantidad de unidades del producto en el pedido
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
   * Obtiene la lista de productos más vendidos
   */
  getTopProducts(): Observable<TopProductModel[]> {
    console.log('Obteniendo datos de productos y pedidos para los más vendidos');
    
    // Utilizamos forkJoin para obtener productos y pedidos en paralelo
    return forkJoin({
      products: this.http.get<ProductApi[]>(this.productsUrl),
      orders: this.http.get<OrderApi[]>(this.ordersUrl)
    }).pipe(
      tap(data => {
        console.log(`Recibidos ${data.products.length} productos y ${data.orders.length} pedidos para top products`);
      }),
      map(({ products, orders }) => {
        // Crear un mapa para acumular las ventas por producto y su información completa
        const productsMap = new Map<string, {
          product: ProductApi,
          salesCount: number
        }>();
        
        // Inicializar el mapa con todos los productos
        products.forEach(product => {
          productsMap.set(product.SKU, {
            product,
            salesCount: 0
          });
        });
        
        // Procesar los pedidos para calcular las ventas totales por producto
        orders.forEach(order => {
          const orderProducts = order.productos || [];
          // Contar las unidades vendidas de cada producto
          orderProducts.forEach(orderProduct => {
            const productInfo = productsMap.get(orderProduct.sku);
            if (productInfo) {
              productInfo.salesCount += orderProduct.cantidad || 1;
              productsMap.set(orderProduct.sku, productInfo);
            }
          });
        });
        
        // Convertir el mapa a un array y ordenar por número de ventas
        return Array.from(productsMap.values())
          .filter(info => info.salesCount > 0) // Incluir solo productos con ventas
          .sort((a, b) => b.salesCount - a.salesCount) // Ordenar de mayor a menor
          .slice(0, 10) // Obtener solo los 10 más vendidos
          .map(info => ({
            id: info.product.SKU,
            productName: info.product.Nombre_producto,
            category: info.product.Categoria, // Usar category en lugar de productType
            price: info.product.Precio,
            stock: info.product.Stock,
            salesCount: info.salesCount
          }));
      }),
      tap(result => {
        console.log(`Obtenidos ${result.length} productos más vendidos`);
        if (result.length > 0) {
          console.log('Muestra del primer producto más vendido:', result[0]);
        }
      }),
      catchError(error => {
        console.error('Error al obtener o procesar datos para productos más vendidos:', error);
        return of([]);
      })
    );
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
          }          // Si tiene múltiples productos, distribuir de manera proporcional a la cantidad
          else if (orderProducts.length > 1) {
            // Calcular la cantidad total de productos en el pedido
            const totalQuantity = orderProducts.reduce((sum, product) => sum + (product.cantidad || 1), 0);
            
            // Distribuir el total según la proporción de cada producto
            orderProducts.forEach(orderProduct => {
              const product = productBillingMap.get(orderProduct.sku);
              if (product) {
                const quantity = orderProduct.cantidad || 1;
                const productShare = orderTotal * (quantity / totalQuantity);
                product.totalBilling += productShare;
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
          // Contar las unidades vendidas de cada producto
          orderProducts.forEach(orderProduct => {
            const product = productSalesMap.get(orderProduct.sku);
            if (product) {
              product.totalSales += orderProduct.cantidad || 1; // Incrementamos según la cantidad del producto en el pedido
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
    );  }

  /**
   * Obtiene los 10 productos más vendidos por mes
   */  getTopProductsByMonth(): Observable<TopProductsByMonthModel[]> {
    console.log('Obteniendo datos de productos y pedidos para los más vendidos por mes');
    
    return this.http.get<OrderApi[]>(this.ordersUrl).pipe(
      tap(orders => {
        console.log(`Recibidos ${orders.length} pedidos para top products por mes`);
      }),
      map(orders => {
        // Crear un mapa para acumular las ventas por producto por mes
        const salesByMonthAndProduct = new Map<string, Map<string, number>>();
        
        // Procesar los pedidos para calcular las ventas por mes y producto
        orders.forEach(order => {
          // Extraer el mes del pedido (formato: YYYY-MM)
          const orderDate = new Date(order.fecha_pedido);
          const month = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          
          // Inicializar el mapa para el mes si no existe
          if (!salesByMonthAndProduct.has(month)) {
            salesByMonthAndProduct.set(month, new Map<string, number>());
          }
          
          const monthSales = salesByMonthAndProduct.get(month)!;
          
          // Contar las ventas de cada producto en el pedido
          const orderProducts = order.productos || [];
          orderProducts.forEach(orderProduct => {
            const currentSales = monthSales.get(orderProduct.nombre_producto) || 0;
            monthSales.set(orderProduct.nombre_producto, currentSales + (orderProduct.cantidad || 1));
          });
        });
        
        // Convertir el mapa a un array de TopProductsByMonthModel
        const result: TopProductsByMonthModel[] = [];
        
        // Para cada mes, obtener los 10 productos más vendidos
        salesByMonthAndProduct.forEach((productSales, month) => {
          // Convertir el mapa de productos a un array y ordenar por ventas
          const topProducts = Array.from(productSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Tomar solo los 10 más vendidos
            .map(([productName, salesCount]) => ({
              month,
              productName,
              salesCount
            }));          
          // Añadir los productos al resultado
          result.push(...topProducts);
        });
        
        // Ordenar por mes antes de devolver para facilitar la visualización cronológica
        return result.sort((a, b) => a.month.localeCompare(b.month));
      }),
      tap(result => {
        console.log(`Obtenidos ${result.length} productos más vendidos por mes`);
        if (result.length > 0) {
          console.log('Muestra del primer producto más vendido por mes:', result[0]);
        }
      }),
      catchError(error => {
        console.error('Error al obtener o procesar datos para productos más vendidos por mes:', error);
        return of([]);
      })    );
  }
    
  /**
   * Obtiene la evolución de ventas mensuales de cada producto
   */
  getProductSalesEvolution(): Observable<ProductSalesEvolutionModel[]> {
    console.log('Obteniendo datos de productos y pedidos para la evolución de ventas mensuales');
    
    // Utilizamos forkJoin para obtener productos y pedidos en paralelo
    return forkJoin({
      products: this.http.get<ProductApi[]>(this.productsUrl),
      orders: this.http.get<OrderApi[]>(this.ordersUrl)
    }).pipe(
      tap(data => {
        console.log(`Recibidos ${data.products.length} productos y ${data.orders.length} pedidos`);
      }),
      map(({ products, orders }) => {
        // Mapa para agrupar las ventas por productID y por mes
        const salesEvolutionMap = new Map<string, {
          productId: string;
          productName: string;
          salesByMonth: Map<string, number>;
        }>();
        
        // Inicializar el mapa con todos los productos
        products.forEach(product => {
          salesEvolutionMap.set(product.SKU, {
            productId: product.SKU,
            productName: product.Nombre_producto,
            salesByMonth: new Map<string, number>()
          });
        });
        
        // Procesar los pedidos para acumular las ventas mensuales por producto
        orders.forEach(order => {
          // Extraer el mes del pedido (formato: YYYY-MM)
          const orderDate = new Date(order.fecha_pedido);
          const month = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          
          // Sumar las ventas de cada producto en el pedido
          const orderProducts = order.productos || [];
          orderProducts.forEach(orderProduct => {
            const productInfo = salesEvolutionMap.get(orderProduct.sku);
            if (productInfo) {
              const currentSales = productInfo.salesByMonth.get(month) || 0;
              productInfo.salesByMonth.set(month, currentSales + (orderProduct.cantidad || 1));
            }
          });
        });
        
        // Convertir el mapa a un array de ProductSalesEvolutionModel
        const result: ProductSalesEvolutionModel[] = Array.from(salesEvolutionMap.values())
          .filter(product => Array.from(product.salesByMonth.values()).some(count => count > 0)) // Solo incluir productos con ventas
          .map(product => {
            // Convertir el mapa de ventas por mes a un array
            const monthlySales = Array.from(product.salesByMonth.entries())
              .map(([month, salesCount]) => ({
                month,
                salesCount
              }))
              .sort((a, b) => a.month.localeCompare(b.month)); // Ordenar cronológicamente
            
            return {
              productId: product.productId,
              productName: product.productName,
              monthlySales
            };
          });
        
        return result;
      }),
      tap(result => {
        console.log(`Obtenida evolución de ventas para ${result.length} productos`);
        if (result.length > 0) {
          console.log('Muestra del primer producto:', result[0].productName, 
                     `con datos de ${result[0].monthlySales.length} meses`);
        }
      }),
      catchError(error => {
        console.error('Error al obtener o procesar datos para la evolución de ventas:', error);
        return of([]);
      })
    );
  }
}
