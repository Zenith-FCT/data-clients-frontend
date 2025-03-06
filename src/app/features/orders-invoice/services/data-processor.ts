import { Invoice, Product } from "../domain/models/invoice.model";
import { BarChartData, LineChartData, PieChartData } from "../domain/models/chart.model";

export interface ProductSaleData {
  productName: string;
  quantity: number;
  totalAmount: number;
}

export interface DailySaleData {
  date: Date;
  quantity: number;
  total: number;
}

/**
 * Clase para procesar datos de facturación para distintos propósitos
 * Implementa el principio de responsabilidad única al centralizar
 * toda la lógica de procesamiento de datos
 */
export class DataProcessor {
  /**
   * Procesa las facturas para obtener diferentes tipos de datos agregados
   * @param invoices Facturas a procesar
   * @returns Objeto con datos de ventas totales, por producto y por día
   */
  public static processInvoiceData(invoices: Invoice[]): {
    totalAmount: number,
    productSales: ProductSaleData[],
    dailySales: DailySaleData[]
  } {
    if (!invoices || invoices.length === 0) {
      return {
        totalAmount: 0,
        productSales: [],
        dailySales: []
      };
    }

    const totalAmount = this.calculateTotalAmount(invoices);
    const productSales = this.processProductSales(invoices);
    const dailySales = this.processDailySales(invoices);

    return {
      totalAmount,
      productSales,
      dailySales
    };
  }

  /**
   * Calcula el monto total de todas las facturas
   * @param invoices Facturas a procesar
   * @returns Monto total
   */
  private static calculateTotalAmount(invoices: Invoice[]): number {
    return invoices.reduce((sum, invoice) => sum + (invoice?.amount || 0), 0);
  }

  /**
   * Procesa las ventas por producto
   * @param invoices Facturas a procesar
   * @returns Array de datos de ventas por producto
   */
  private static processProductSales(invoices: Invoice[]): ProductSaleData[] {
    const productMap = new Map<string, { quantity: number; totalAmount: number }>();
    
    invoices.forEach(invoice => {
      if (!invoice || !invoice.product) return;
      
      const productName = this.getProductDisplayName(invoice.product);
      const amount = invoice.amount || 0;
      
      if (!productMap.has(productName)) {
        productMap.set(productName, { quantity: 0, totalAmount: 0 });
      }
      
      const productData = productMap.get(productName)!;
      productData.quantity += 1;
      productData.totalAmount += amount;
    });
    
    return Array.from(productMap.entries())
      .map(([productName, data]) => ({
        productName,
        quantity: data.quantity,
        totalAmount: data.totalAmount
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  /**
   * Procesa las ventas diarias
   * @param invoices Facturas a procesar
   * @returns Array de datos de ventas diarias
   */
  private static processDailySales(invoices: Invoice[]): DailySaleData[] {
    const dailyMap = new Map<string, { quantity: number; total: number }>();
    
    invoices.forEach(invoice => {
      if (!invoice?.date) return;
      
      const dateObj = new Date(invoice.date);
      const dateStr = dateObj.toDateString();
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { quantity: 0, total: 0 });
      }
      
      const dayData = dailyMap.get(dateStr)!;
      dayData.quantity += 1;
      dayData.total += invoice.amount || 0;
    });

    return Array.from(dailyMap.entries())
      .map(([dateStr, data]) => ({
        date: new Date(dateStr),
        quantity: data.quantity,
        total: data.total
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Genera datos para un gráfico de línea con ventas diarias
   * @param dailySales Datos de ventas diarias
   * @param year Año
   * @param month Mes
   * @returns Datos formateados para gráfico de línea
   */
  public static generateDailyChartData(
    dailySales: DailySaleData[], 
    year: number, 
    month: number
  ): LineChartData {
    // Obtener todos los días del mes
    const daysInMonth = this.getDaysInMonth(year, month);
    
    // Crear un mapa con todos los días del mes
    const allDaysSales = new Map<number, number>();
    
    // Inicializar con ceros
    for (let day = 1; day <= daysInMonth; day++) {
      allDaysSales.set(day, 0);
    }
    
    // Rellenar con datos reales donde existan
    dailySales.forEach(sale => {
      const day = sale.date.getDate();
      allDaysSales.set(day, sale.total);
    });
    
    // Convertir el mapa a arrays para el gráfico
    const sortedDays = Array.from(allDaysSales.keys()).sort((a, b) => a - b);
    const labels = sortedDays.map(day => String(day));
    const values = sortedDays.map(day => allDaysSales.get(day) || 0);
    
    return { 
      labels, 
      values,
      label: 'Ventas Diarias'
    };
  }

  /**
   * Genera datos para un gráfico de pie con ventas por producto
   * @param productSales Datos de ventas por producto
   * @returns Datos formateados para gráfico de pie
   */
  public static generateProductPieChartData(
    productSales: ProductSaleData[]
  ): PieChartData {
    return {
      labels: productSales.map(p => p.productName),
      values: productSales.map(p => p.totalAmount)
    };
  }

  /**
   * Genera datos para un gráfico de barras con ventas mensuales
   * @param invoices Facturas a procesar
   * @returns Datos formateados para gráfico de barras
   */
  public static generateMonthlyBarChartData(invoices: Invoice[]): BarChartData {
    const monthlyTotals = new Array(12).fill(0);
    const monthNames = Array.from({length: 12}, (_, i) => this.getMonthName(i + 1));

    invoices.forEach(invoice => {
      if (invoice.date) {
        const date = new Date(invoice.date);
        const month = date.getMonth();
        monthlyTotals[month] += invoice.amount || 0;
      }
    });

    return {
      labels: monthNames,
      values: monthlyTotals
    };
  }

  /**
   * Obtiene el nombre del mes a partir de su número
   * @param month Número del mes (1-12)
   * @returns Nombre del mes
   */
  public static getMonthName(month: number): string {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return monthNames[month - 1] || '';
  }

  /**
   * Obtiene la cantidad de días en un mes
   * @param year Año
   * @param month Mes
   * @returns Cantidad de días en el mes
   */
  public static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Obtiene el nombre legible de un producto
   * @param product Producto
   * @returns Nombre del producto
   */
  public static getProductDisplayName(product: Product): string {
    switch (product) {
      case Product.MASTER:
        return 'Master';
      case Product.CURSO:
        return 'Curso';
      case Product.MEMBRESIA:
        return 'Membresía';
      default:
        return 'Producto sin nombre';
    }
  }
}