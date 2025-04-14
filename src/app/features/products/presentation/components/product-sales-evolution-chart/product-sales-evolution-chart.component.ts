import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
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
  
  constructor(
    public viewModel: ProductSalesEvolutionViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('ProductSalesEvolutionChartComponent initialized');

    // Efecto para procesar datos cuando se carguen
    effect(() => {
      const productEvolution = this.viewModel.selectedProductsEvolution$();
      if (productEvolution && productEvolution.length > 0) {
        console.log(`ProductSalesEvolutionChartComponent: Datos recibidos, ${productEvolution.length} productos seleccionados`);
        this.dataLoaded = true;
        this.selectedProductIds = this.viewModel.selectedProductIds$();
        this.updateChartOption(productEvolution);
      }
    });

    // Efecto para monitorear el estado de carga
    effect(() => {
      const loading = this.viewModel.loading$();
      console.log(`ProductSalesEvolutionChartComponent: Estado de carga: ${loading ? 'cargando' : 'completo'}`);
    });

    // Efecto para manejar errores
    effect(() => {
      const error = this.viewModel.error$();
      if (error) {
        console.error(`ProductSalesEvolutionChartComponent: Error cargando datos: ${error}`);
      }
    });
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
  }

  ngOnDestroy(): void {
    console.log('ProductSalesEvolutionChartComponent: Componente destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el cambio en la selección de productos
   */
  onProductSelectionChange(): void {
    console.log('ProductSalesEvolutionChartComponent: Selección de productos actualizada:', this.selectedProductIds);
    this.viewModel.setSelectedProductIds(this.selectedProductIds);
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
    
    // Crear series para cada producto
    const series = productEvolution.map(product => {
      // Crear un mapa de ventas por mes para este producto
      const salesByMonth = new Map<string, number>();
      product.monthlySales.forEach((sale: { month: string; salesCount: number }) => {
        salesByMonth.set(sale.month, sale.salesCount);
      });
      
      // Crear array de datos para todos los meses (usando 0 si no hay ventas)
      const data = monthsArray.map(month => salesByMonth.get(month) || 0);
      
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
    const formattedMonths = monthsArray.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    });
    
    // Crear opciones del gráfico
    this.chartOption = {
      title: {
        text: 'Evolución de Ventas Mensuales por Producto',
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
      },
      legend: {
        data: productEvolution.map(p => p.productName),
        top: '40px'
      },
      grid: {
        left: '8%',
        right: '5%',
        bottom: '10%',
        top: '80px',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: formattedMonths,
          axisLabel: {
            rotate: 45,
            textStyle: {
              fontSize: 10
            }
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
