import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TopProductsByMonthViewModel } from './top-products-by-month.view-model';
import { TopProductsByMonthModel } from '../../../domain/top-products-by-month.model';

/**
 * Componente que muestra un gráfico de barras con los 10 productos más vendidos 
 * en un mes y año específicos.
 */
@Component({
  selector: 'app-top-products-by-month-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, FormsModule, MatSelectModule, MatFormFieldModule, MatIconModule],
  templateUrl: './top-products-by-month-chart.component.html',
  styleUrl: './top-products-by-month-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopProductsByMonthChartComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  isBrowser: boolean;
  chartOption: any = {};
  dataLoaded = false;
  
  // Propiedades para selección de año y mes
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  availableYears: number[] = [];
  readonly monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
    constructor(
    public viewModel: TopProductsByMonthViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('TopProductsByMonthChartComponent initialized');

    // Efecto para procesar datos cuando se carguen
    effect(() => {
      const topProductsByMonth = this.viewModel.topProductsByMonth$();
      if (topProductsByMonth && topProductsByMonth.length > 0) {
        console.log(`TopProductsByMonthChartComponent: Datos recibidos, ${topProductsByMonth.length} registros`);
        this.dataLoaded = true;
        
        // Extraer años disponibles de los datos
        this.extractAvailableDates(topProductsByMonth);
        
        // Usar el año y mes más recientes por defecto si no se ha seleccionado ninguno
        if (this.availableYears.length > 0 && !this.selectedYear) {
          this.selectedYear = Math.max(...this.availableYears);
          console.log(`TopProductsByMonthChartComponent: Año seleccionado automáticamente: ${this.selectedYear}`);
        }
        
        this.updateChartOption(topProductsByMonth);
      }
    });

    // Efecto para monitorear el estado de carga
    effect(() => {
      const loading = this.viewModel.loading$();
      console.log(`TopProductsByMonthChartComponent: Estado de carga: ${loading ? 'cargando' : 'completo'}`);
    });

    // Efecto para manejar errores
    effect(() => {
      const error = this.viewModel.error$();
      if (error) {
        console.error(`TopProductsByMonthChartComponent: Error cargando datos: ${error}`);
      }
    });
  }
  
  /**
   * Extrae la lista de años disponibles de los datos
   */
  private extractAvailableDates(data: TopProductsByMonthModel[]): void {
    // Extraer años únicos de los datos
    this.availableYears = [...new Set(data.map(item => {
      const [year] = item.month.split('-');
      return parseInt(year, 10);
    }))].sort((a, b) => b - a); // Ordenar de más reciente a más antiguo
  }
    ngOnInit(): void {
    console.log('TopProductsByMonthChartComponent: Iniciando carga de datos');
    if (this.isBrowser && !this.isTestEnvironment()) {
      this.viewModel.loadTopProductsByMonth();
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
    console.log('TopProductsByMonthChartComponent: Componente destruido');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el cambio de año o mes en los selectores
   */
  onDateChange(): void {
    this.updateChartOption(this.viewModel.topProductsByMonth$());
  }

  /**
   * Obtener el código de mes en formato YYYY-MM basado en las selecciones actuales
   */
  getSelectedMonthCode(): string {
    // Formatear el mes con ceros a la izquierda si es necesario
    const monthStr = this.selectedMonth < 10 ? `0${this.selectedMonth}` : `${this.selectedMonth}`;
    return `${this.selectedYear}-${monthStr}`;
  }
  updateChartOption(topProductsByMonth: TopProductsByMonthModel[]): void {
    if (!this.isBrowser) return;
    
    if (!topProductsByMonth || topProductsByMonth.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos de productos por mes disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    // Obtener el código de mes seleccionado (formato YYYY-MM)
    const selectedMonthCode = this.getSelectedMonthCode();
    
    // Filtrar productos por el mes y año seleccionados
    const filteredData = topProductsByMonth.filter(item => item.month === selectedMonthCode);

    // Ordenar productos por ventas (de mayor a menor)
    const sortedData = [...filteredData].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10);
    
    // Preparar datos para el gráfico
    const productNames = sortedData.map(item => item.productName);
    const salesCounts = sortedData.map(item => item.salesCount);
    
    // Crear opciones del gráfico
    this.chartOption = {      title: {
        text: `Top 10 Productos Más Vendidos - ${this.monthNames[this.selectedMonth - 1]} ${this.selectedYear}`,
        left: 'center',
        textStyle: {
          color: '#333333',
          fontSize: 16,
          fontWeight: 'bold'
        },
      },tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const product = sortedData[dataIndex];
          return `<strong>${product.productName}</strong><br/>Ventas: ${product.salesCount}`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.64)',
        padding: 10,
        confine: true
      },grid: {
        left: '10%',
        right: '5%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      },xAxis: {
        type: 'category',
        data: productNames,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.13)'
          }
        },
        axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            fontSize: 10,
            color: '#ffffff'
          },
          margin: 16
        }
      },      yAxis: {
        type: 'value',
        name: 'Unidades vendidas',
        minInterval: 1, // Fuerza valores enteros
        axisLabel: {
          formatter: '{value}', // Formato sin decimales
          fontSize: 12,
          color: '#ffffff'
        },
        nameTextStyle: {
          fontSize: 14,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.28)'
          }
        }
      },      series: [
        {
          name: 'Ventas',
          data: salesCounts,
          type: 'bar',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0.52)',
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            color: '#FFFFFF',
            formatter: function(params: any) {
              return Math.floor(params.value);
            }
          }
        }
      ]
    };
  }
  /**
   * Obtiene todos los meses del año, independientemente de si hay datos disponibles
   */
  getAvailableMonths(): number[] {
    // Devuelve todos los meses (1-12), sin filtrar por datos disponibles
    return Array.from({ length: 12 }, (_, i) => i + 1); // Genera un array con los números del 1 al 12
  }
}
