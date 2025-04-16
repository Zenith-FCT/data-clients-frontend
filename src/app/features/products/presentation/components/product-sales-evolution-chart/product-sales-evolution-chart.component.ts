import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductSalesEvolutionViewModel } from './product-sales-evolution.view-model';
import { ProductSalesEvolutionModel } from '../../../domain/product-sales-evolution.model';

@Component({
  selector: 'app-product-sales-evolution-chart',
  standalone: true,
  imports: [
    CommonModule, 
    NgxEchartsModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatSelectModule, 
    MatFormFieldModule, 
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './product-sales-evolution-chart.component.html',
  styleUrl: './product-sales-evolution-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductSalesEvolutionViewModel]
})
export class ProductSalesEvolutionChartComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  isBrowser: boolean;
  chartOption: any = {};
  dataLoaded = false;
  
  // Productos seleccionados para mostrar en el gráfico
  selectedProductIds: string[] = [];
    // Año seleccionado para filtrar datos
  selectedYear: number | null = null;  
  
  // Referencias a los efectos para su posterior limpieza
  private readonly effectRefs: ReturnType<typeof effect>[] = [];

  constructor(
    public viewModel: ProductSalesEvolutionViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Efecto para procesar datos cuando se carguen - con referencia para limpieza
    this.effectRefs.push(effect(() => {
      const productEvolution = this.viewModel.selectedProductsEvolution$();
      if (productEvolution && productEvolution.length > 0) {
        this.dataLoaded = true;
        this.selectedProductIds = this.viewModel.selectedProductIds$();
        this.selectedYear = this.viewModel.selectedYear$();
        this.updateChartOption(productEvolution);
      }
    }));

    // Efecto para monitorear el estado de carga - con referencia para limpieza
    this.effectRefs.push(effect(() => {
      // Solo accedemos al valor para que se registre la dependencia
      this.viewModel.loading$();
      // Log eliminado para optimización
    }));

    // Efecto para manejar errores - con referencia para limpieza
    this.effectRefs.push(effect(() => {
      const error = this.viewModel.error$();
      if (error) {
        // Registramos el error solo en entorno no de pruebas
        if (!this.isTestEnvironment()) {
          console.error(`Error cargando datos: ${error}`);
        }
      }
    }));
  }
  
  ngOnInit(): void {
    console.log('ProductSalesEvolutionChartComponent: Iniciando carga de datos');
    if (this.isBrowser && !this.isTestEnvironment()) {
      this.viewModel.loadProductSalesEvolution();
    }
  }
  
  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   * @returns true si se detecta que es un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }  /**
   * Limpia todos los recursos cuando el componente es destruido
   */
  ngOnDestroy(): void {
    // Liberamos las suscripciones
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiamos todos los efectos - EffectRef no es callable
    this.effectRefs.forEach(effectRef => {
      // El objeto EffectRef tiene un método destroy() que usamos para limpiarlo
      effectRef.destroy();
    });
  }
  /**
   * Maneja el cambio en la selección de productos
   * Actualiza el modelo de vista con los nuevos productos seleccionados
   */
  onProductSelectionChange(): void {
    this.viewModel.setSelectedProductIds(this.selectedProductIds);
  }

  /**
   * Maneja el cambio en la selección de año
   * Actualiza el modelo de vista con el nuevo año seleccionado
   */
  onYearSelectionChange(): void {
    if (this.selectedYear) {
      this.viewModel.setSelectedYear(this.selectedYear);
    }
  }

  /**
   * Maneja la selección o deselección de productos mediante checkbox
   * @param productId ID del producto seleccionado o deseleccionado
   */
  toggleProductSelection(productId: string): void {
    // Si ya está seleccionado, lo quitamos; si no, lo añadimos
    if (this.selectedProductIds.includes(productId)) {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    } else {
      this.selectedProductIds = [...this.selectedProductIds, productId];
    }
    
    // Notificamos el cambio
    this.onProductSelectionChange();
  }

  /**
   * Actualiza las opciones del gráfico cuando cambian los datos
   */
  updateChartOption(productEvolution: ProductSalesEvolutionModel[]): void {
    if (!this.isBrowser) return;
    
    if (!productEvolution || productEvolution.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos de evolución de ventas disponibles',
          left: 'center',
          textStyle: { color: '#333' },
        },
      };
      return;
    }

    // Recopilar todos los meses únicos de todos los productos
    const allMonths = new Set<string>();
    productEvolution.forEach(product => {
      product.monthlySales.forEach((sale: { month: string; salesCount: number }) => {
        allMonths.add(sale.month);
      });
    });

    // Convertir a array y ordenar cronológicamente
    const monthsArray = Array.from(allMonths).sort();
      // Filtrar solo los meses del año seleccionado si hay un año seleccionado
    // O crear un array con todos los meses del año si no hay datos para algún mes
    let filteredMonthsArray = [];
    
    if (this.selectedYear) {
      // Si hay un año seleccionado, aseguramos que estén todos los meses del año
      for (let i = 1; i <= 12; i++) {
        const monthStr = i < 10 ? `0${i}` : `${i}`;
        const monthKey = `${this.selectedYear}-${monthStr}`;
        filteredMonthsArray.push(monthKey);
      }
    } else {
      filteredMonthsArray = monthsArray;
    }
    
    // Crear series para cada producto
    const series = productEvolution.map(product => {
      // Crear un mapa de ventas por mes para este producto
      const salesByMonth = new Map<string, number>();
      product.monthlySales.forEach((sale: { month: string; salesCount: number }) => {
        salesByMonth.set(sale.month, sale.salesCount);
      });
      
      // Crear array de datos para todos los meses (usando 0 si no hay ventas)
      const data = filteredMonthsArray.map(month => salesByMonth.get(month) || 0);
      
      return {
        name: product.productName,
        type: 'line',
        data: data,
        smooth: true,
        emphasis: {
          focus: 'series'
        }
      };
    });
    
    // Formatear etiquetas de meses para mejor visualización
    const formattedMonths = filteredMonthsArray.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(monthNum) - 1]}`;
    });
      // Año seleccionado para mostrar en el título
    const yearText = this.selectedYear ? ` ${this.selectedYear}` : '';
    
    // Crear opciones del gráfico
    this.chartOption = {
      title: {
        text: `Evolución de Ventas Mensuales por Producto${yearText}`,
        left: 'center',
        textStyle: { color: '#333' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },      legend: {
        data: productEvolution.map(p => p.productName),
        orient: 'horizontal',
        bottom: '0',
        type: 'scroll', // Permite desplazamiento si hay muchos productos
        width: '90%',
        textStyle: {
          fontSize: 12,
          overflow: 'truncate',
          width: 120
        },
        pageIconSize: 12,
        pageIconColor: '#666',
        pageIconInactiveColor: '#aaa',
        pageTextStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '12%', // Aumentado para dejar espacio a la leyenda en la parte inferior
        top: '50px', // Reducido ya que la leyenda ya no está arriba
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: formattedMonths,
          axisLabel: {
            interval: 0, // Asegura que todos los meses se muestren
            textStyle: {
              fontSize: 10
            },
            rotate: 0, // Sin rotación para mejorar la legibilidad
            margin: 8
          },
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Unidades vendidas',
          minInterval: 1, // Fuerza valores enteros
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: series,
      color: ['#E53935', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#607D8B']
    };
  }
}
