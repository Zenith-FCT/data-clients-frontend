import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  // selectedYear: number | null = null;  // Replaced by Input setter/getter
  private _selectedYear: number | null = null;

  @Input()
  set selectedYear(value: number | string | null) {
    const yearNumber = typeof value === 'string' ? parseInt(value, 10) : value;
    if (yearNumber && yearNumber !== this._selectedYear) {
      this._selectedYear = yearNumber;
      if (this.viewModel && typeof this.viewModel.setSelectedYear === 'function') {
        this.viewModel.setSelectedYear(this._selectedYear);
      }
      if (this.dataLoaded && this.viewModel.selectedProductsEvolution$() && this.viewModel.selectedProductsEvolution$().length > 0) {
        this.updateChartOption(this.viewModel.selectedProductsEvolution$());
      }
    } else if (value === null && this._selectedYear !== null) {
      this._selectedYear = null;
      if (this.dataLoaded && this.viewModel.selectedProductsEvolution$() && this.viewModel.selectedProductsEvolution$().length > 0) {
        this.updateChartOption(this.viewModel.selectedProductsEvolution$());
      }
    }
  }
  get selectedYear(): number | null {
    return this._selectedYear;
  }
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  
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
        this.updateChartOption(productEvolution);
      }
    }));

    // Effect to update totalPages when availableProducts changes
    this.effectRefs.push(effect(() => {
      const availableProducts = this.viewModel.availableProducts$();
      if (availableProducts) {
        this.totalPages = Math.ceil(availableProducts.length / this.itemsPerPage);
        // Adjust currentPage if it's out of bounds
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        } else if (this.totalPages === 0) {
          this.currentPage = 1;
        }
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
   * Maneja la selección o deselección de productos mediante checkbox
   * @param productId ID del producto seleccionado o deseleccionado
   */
  toggleProductSelection(productId: string): void {
    // Si ya está seleccionado, lo quitamos
    if (this.selectedProductIds.includes(productId)) {
      this.selectedProductIds = this.selectedProductIds.filter(id => id !== productId);
    } else {
      // Si no está seleccionado y no hemos llegado al límite de 3, lo añadimos
      if (this.selectedProductIds.length < 3) {
        this.selectedProductIds = [...this.selectedProductIds, productId];
      } else {
        // Si ya hay 3 productos seleccionados, no hacemos nada
        return;
      }
    }
    
    // Notificamos el cambio
    this.onProductSelectionChange();
  }
  
  /**
   * Verifica si un producto se puede seleccionar (menos de 3 seleccionados o ya está seleccionado)
   * @param productId ID del producto a verificar
   * @returns boolean que indica si el producto se puede seleccionar
   */
  canSelectProduct(productId: string): boolean {
    return this.selectedProductIds.includes(productId) || this.selectedProductIds.length < 3;
  }

  // Pagination methods
  getPaginatedProducts(): { id: string, name: string }[] {
    const availableProducts = this.viewModel.availableProducts$();
    if (!availableProducts) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return availableProducts.slice(startIndex, endIndex);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
    }
  }

  /**
   * Actualiza las opciones del gráfico cuando cambian los datos
   */  updateChartOption(productEvolution: ProductSalesEvolutionModel[]): void {
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
    const series = productEvolution.map((product, index) => {
      // Crear un mapa de ventas por mes para este producto
      const salesByMonth = new Map<string, number>();
      product.monthlySales.forEach((sale: { month: string; salesCount: number }) => {
        salesByMonth.set(sale.month, sale.salesCount);
      });
      
      // Crear array de datos para todos los meses (usando 0 si no hay ventas)
      const data = filteredMonthsArray.map(month => salesByMonth.get(month) || 0);
      
      // Paleta de colores corporativa
      const corporateColors = ['#ccf200', '#f2f3ec', '#a8c300', '#bfc1b8', '#40403f', '#1a1c00', '#6a6b69'];
      
      return {
        name: product.productName,
        type: 'line',
        data: data,
        smooth: false,
        lineStyle: {
          width: 3,
          color: corporateColors[index % corporateColors.length]
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: corporateColors[index % corporateColors.length]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 3,
            borderColor: corporateColors[index % corporateColors.length],
            color: corporateColors[index % corporateColors.length]
          }
        },
        z: 10
      };
    });
      
    // Formatear etiquetas de meses para mejor visualización
    const formattedMonths = filteredMonthsArray.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(monthNum) - 1]}`;
    });
    
    // Crear opciones del gráfico sin título para que no interfiera con el HTML    
    this.chartOption = {
      title: null, // Eliminamos completamente el título para evitar conflictos
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.64)',
        padding: 10,
        confine: true,
        formatter: function(params: any) {
          if (!Array.isArray(params)) {
            params = [params];
          }
          
          let tooltipContent = params[0].name + '<br/>';
          
          // Ordenar para mostrar las líneas primero
          params.sort((a: any, b: any) => a.seriesType === 'line' ? -1 : 1);
          
          params.forEach((param: any) => {
            if (param && param.marker && param.seriesName) {
              const marker = param.marker;
              const seriesName = param.seriesName;
              const value = param.value;
              tooltipContent += marker + seriesName + ': ' + value + ' unidades<br/>';
            }
          });
          
          return tooltipContent;
        }
      },      
      legend: {
        data: productEvolution.map(p => p.productName),
        orient: 'horizontal',
        bottom: '20px', 
        type: 'scroll', 
        width: '90%',
        textStyle: {
          fontSize: 12,
          color: '#ffffff',
          fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif',
          overflow: 'truncate',
          width: 120
        },
        pageIconSize: 12,
        pageIconColor: '#ffffff',
        pageIconInactiveColor: '#aaa',
        pageTextStyle: {
          color: '#ffffff'
        }
      },      
      grid: {
        left: '4%',
        right: '4%',
        bottom: '17%', // Aumentado para dejar más espacio a la leyenda en la parte inferior
        top: '5%', // Reducido para maximizar el espacio de visualización
        containLabel: true,
        width: 'auto', // Ancho automático para adaptarse al contenedor
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: formattedMonths,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.38)'
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 14,
          color: '#ffffff',
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Unidades vendidas',
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 12,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        axisLabel: {
          formatter: '{value}',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.33)'
          }
        }
      },
      series: series,
      color: ['#ccf200', '#f2f3ec', '#a8c300', '#bfc1b8', '#40403f', '#1a1c00', '#6a6b69']
    };
  }
}
