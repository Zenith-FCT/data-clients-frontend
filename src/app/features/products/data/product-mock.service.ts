import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../domain/product';

// Interfaz para datos de ventas internos del servicio
interface SaleRecord {
  productId: string;
  date: Date;
  quantity: number;
  unitPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductMockService {
  // Datos de productos de ejemplo
  private products: Product[] = [
    {
      id: '1',
      name: 'Smartphone X',
      description: 'Último modelo con cámara de alta resolución',
      price: 799.99,
      category: 'Electrónica',
      stock: 120,
      createdAt: new Date('2023-01-15')
    },
    {
      id: '2',
      name: 'Laptop Pro',
      description: 'Potente laptop para profesionales',
      price: 1299.99,
      category: 'Computación',
      stock: 45,
      createdAt: new Date('2023-02-10')
    },
    {
      id: '3',
      name: 'Auriculares Inalámbricos',
      description: 'Auriculares con cancelación de ruido',
      price: 199.99,
      category: 'Audio',
      stock: 200,
      createdAt: new Date('2023-01-05')
    },
    {
      id: '4',
      name: 'Monitor 4K',
      description: 'Monitor de alta resolución para gaming',
      price: 349.99,
      category: 'Computación',
      stock: 30,
      createdAt: new Date('2023-03-20')
    },
    {
      id: '5',
      name: 'Tableta Gráfica',
      description: 'Para diseñadores profesionales',
      price: 249.99,
      category: 'Periféricos',
      stock: 60,
      createdAt: new Date('2023-02-25')
    }
  ];

  // Datos de ventas de ejemplo (solo para uso interno del servicio)
  private sales: SaleRecord[] = [
    // Enero
    { productId: '1', date: new Date('2023-01-10'), quantity: 5, unitPrice: 799.99 },
    { productId: '2', date: new Date('2023-01-15'), quantity: 2, unitPrice: 1299.99 },
    { productId: '3', date: new Date('2023-01-20'), quantity: 10, unitPrice: 199.99 },
    { productId: '4', date: new Date('2023-01-25'), quantity: 3, unitPrice: 349.99 },
    { productId: '5', date: new Date('2023-01-30'), quantity: 4, unitPrice: 249.99 },
    
    // Febrero
    { productId: '1', date: new Date('2023-02-05'), quantity: 8, unitPrice: 799.99 },
    { productId: '2', date: new Date('2023-02-10'), quantity: 3, unitPrice: 1299.99 },
    { productId: '3', date: new Date('2023-02-15'), quantity: 15, unitPrice: 199.99 },
    { productId: '4', date: new Date('2023-02-20'), quantity: 2, unitPrice: 349.99 },
    { productId: '5', date: new Date('2023-02-25'), quantity: 7, unitPrice: 249.99 },
    
    // Marzo
    { productId: '1', date: new Date('2023-03-01'), quantity: 10, unitPrice: 799.99 },
    { productId: '2', date: new Date('2023-03-05'), quantity: 5, unitPrice: 1299.99 },
    { productId: '3', date: new Date('2023-03-10'), quantity: 20, unitPrice: 199.99 },
    { productId: '4', date: new Date('2023-03-15'), quantity: 5, unitPrice: 349.99 },
    { productId: '5', date: new Date('2023-03-20'), quantity: 8, unitPrice: 249.99 }
  ];

  constructor() { }

  /**
   * Obtiene la facturación total por producto
   * @returns Observable con un array de productos y su facturación total
   */
  getTotalRevenueByProduct(): Observable<{ product: Product, revenue: number }[]> {
    const revenueByProduct: { [key: string]: number } = {};
    
    // Calcula la facturación total para cada producto
    this.sales.forEach(sale => {
      if (!revenueByProduct[sale.productId]) {
        revenueByProduct[sale.productId] = 0;
      }
      revenueByProduct[sale.productId] += sale.quantity * sale.unitPrice;
    });
    
    // Construye el array de resultados
    const result = this.products
      .filter(product => revenueByProduct[product.id] !== undefined)
      .map(product => ({
        product,
        revenue: revenueByProduct[product.id] || 0
      }));
    
    return of(result);
  }

  /**
   * Obtiene el total de ventas por producto (en cantidad)
   * @returns Observable con un array de productos y su cantidad total vendida
   */
  getTotalSalesByProduct(): Observable<{ product: Product, quantity: number }[]> {
    const salesByProduct: { [key: string]: number } = {};
    
    // Calcula las ventas totales para cada producto
    this.sales.forEach(sale => {
      if (!salesByProduct[sale.productId]) {
        salesByProduct[sale.productId] = 0;
      }
      salesByProduct[sale.productId] += sale.quantity;
    });
    
    // Construye el array de resultados
    const result = this.products
      .filter(product => salesByProduct[product.id] !== undefined)
      .map(product => ({
        product,
        quantity: salesByProduct[product.id] || 0
      }));
    
    return of(result);
  }

  /**
   * Obtiene la lista de productos más vendidos ordenada por cantidad
   * @param limit Número máximo de productos a retornar
   * @returns Observable con un array de productos y sus métricas de ventas
   */
  getMostSoldProducts(limit: number = 5): Observable<{ 
    product: Product, 
    quantity: number, 
    revenue: number 
  }[]> {
    const salesByProduct: { [key: string]: number } = {};
    const revenueByProduct: { [key: string]: number } = {};
    
    this.sales.forEach(sale => {
      if (!salesByProduct[sale.productId]) {
        salesByProduct[sale.productId] = 0;
        revenueByProduct[sale.productId] = 0;
      }
      salesByProduct[sale.productId] += sale.quantity;
      revenueByProduct[sale.productId] += sale.quantity * sale.unitPrice;
    });
    
    // Construimos el array de resultados
    const result = this.products
      .filter(product => salesByProduct[product.id] !== undefined)
      .map(product => ({
        product,
        quantity: salesByProduct[product.id] || 0,
        revenue: revenueByProduct[product.id] || 0
      }));
    
    // Ordenamos por cantidad de ventas de mayor a menor y limitamos la cantidad
    return of(result.sort((a, b) => b.quantity - a.quantity).slice(0, limit));
  }

  /**
   * Obtiene la lista de productos más vendidos por mes
   * @param limit Número máximo de productos por mes
   * @returns Observable con array de meses y sus productos más vendidos
   */
  getMostSoldProductsByMonth(limit: number = 3): Observable<{ 
    month: string, 
    year: number,
    products: { product: Product, quantity: number, revenue: number }[]
  }[]> {
    // Agrupamos las ventas por mes
    const salesByMonth: { [key: string]: { [productId: string]: number } } = {};
    const revenueByMonth: { [key: string]: { [productId: string]: number } } = {};
    
    this.sales.forEach(sale => {
      const month = sale.date.getMonth() + 1; // getMonth() devuelve 0-11
      const year = sale.date.getFullYear();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!salesByMonth[monthKey]) {
        salesByMonth[monthKey] = {};
        revenueByMonth[monthKey] = {};
      }
      
      if (!salesByMonth[monthKey][sale.productId]) {
        salesByMonth[monthKey][sale.productId] = 0;
        revenueByMonth[monthKey][sale.productId] = 0;
      }
      
      salesByMonth[monthKey][sale.productId] += sale.quantity;
      revenueByMonth[monthKey][sale.productId] += sale.quantity * sale.unitPrice;
    });
    
    // Construimos el resultado
    const result = Object.keys(salesByMonth).map(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      
      // Obtenemos los productos más vendidos de este mes
      const productsInMonth = this.products
        .filter(product => salesByMonth[monthKey][product.id] !== undefined)
        .map(product => ({
          product,
          quantity: salesByMonth[monthKey][product.id] || 0,
          revenue: revenueByMonth[monthKey][product.id] || 0
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
      
      // Convertimos el número de mes a nombre
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      return {
        month: monthNames[month - 1],
        year: year,
        products: productsInMonth
      };
    });
    
    // Ordenamos por año y mes
    result.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthToNumber(a.month) - monthToNumber(b.month);
    });
    
    return of(result);
    
    // Función auxiliar para convertir nombre de mes a número
    function monthToNumber(month: string): number {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return monthNames.indexOf(month);
    }
  }

  /**
   * Obtiene la evolución de la facturación mensual por producto
   * @returns Observable con array de productos y su facturación mensual
   */
  getMonthlyRevenueEvolution(): Observable<{
    product: Product,
    monthlyRevenue: { month: string, year: number, revenue: number }[]
  }[]> {
    // Estructura para almacenar la facturación por producto y mes
    const revenueByProductAndMonth: { [productId: string]: { [monthKey: string]: number } } = {};
    
    // Inicializamos la estructura para todos los productos
    this.products.forEach(product => {
      revenueByProductAndMonth[product.id] = {};
    });
    
    // Agrupamos las ventas por producto y mes
    this.sales.forEach(sale => {
      const month = sale.date.getMonth() + 1;
      const year = sale.date.getFullYear();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!revenueByProductAndMonth[sale.productId][monthKey]) {
        revenueByProductAndMonth[sale.productId][monthKey] = 0;
      }
      
      revenueByProductAndMonth[sale.productId][monthKey] += sale.quantity * sale.unitPrice;
    });
    
    // Construimos el resultado
    const result = this.products
      .filter(product => Object.keys(revenueByProductAndMonth[product.id]).length > 0)
      .map(product => {
        const monthlyData: { month: string, year: number, revenue: number }[] = [];
        
        // Convertimos las entradas de facturación mensual a un array
        Object.keys(revenueByProductAndMonth[product.id]).forEach(monthKey => {
          const [year, monthNum] = monthKey.split('-').map(Number);
          
          // Convertimos el número de mes a nombre
          const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          
          monthlyData.push({
            month: monthNames[monthNum - 1],
            year: year,
            revenue: revenueByProductAndMonth[product.id][monthKey]
          });
        });
        
        // Ordenamos por año y mes
        monthlyData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return monthToNumber(a.month) - monthToNumber(b.month);
        });
        
        return {
          product,
          monthlyRevenue: monthlyData
        };
      });
    
    return of(result);
    
    // Función auxiliar para convertir nombre de mes a número
    function monthToNumber(month: string): number {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return monthNames.indexOf(month);
    }
  }

  /**
   * Obtiene los productos (sin datos de venta, solo datos base)
   * @returns Observable con los productos disponibles
   */
  getProducts(): Observable<Product[]> {
    return of(this.products);
  }
}