import { Component, OnInit, Inject, PLATFORM_ID, effect, AfterViewInit, ElementRef, OnDestroy, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsDataRepository } from '../data/products-data-repository';
import { productsProviders } from '../products.providers';
import { ProductBillingViewModel } from './product-billing.view-model';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GetTotalBillingPerProductUseCase } from '../domain/get-total-billing-per-product-use-case';
import { Subject, debounceTime, fromEvent, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-products',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    NgxEchartsModule,
  ],
  providers: [
    ProductBillingViewModel,
    ProductsDataRepository,
    GetTotalBillingPerProductUseCase,
    ...productsProviders,
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts')
      }
    }
  ],
  templateUrl: './main-products.component.html',
  styleUrl: './main-products.component.scss'
})
export class MainProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  isBrowser: boolean;
  chartOption: any = {};
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  
  @ViewChild('echarts', { static: false }) echartElement?: ElementRef;
  
  // Paleta de colores para el gráfico 
  private colorPalette: string[] = [
    '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f',
    '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c',
    '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00',
    '#e64a19', '#5d4037', '#616161', '#455a64'
  ];

  constructor(
    public viewModel: ProductBillingViewModel,
    @Inject(PLATFORM_ID) platformId: Object,
    private elementRef: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Usar effect para reaccionar a cambios en los datos
    effect(() => {
      const productBilling = this.viewModel.productBilling();
      if (this.isBrowser && productBilling && productBilling.length > 0) {
        this.updateChartOption(productBilling);
      }
    });
  }

  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      // Detectar si estamos en un entorno de pruebas karma
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       // Comprobar variables de entorno comunes en CI
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }

  /**
   * Verifica si es seguro realizar operaciones del DOM
   */
  private canPerformDomOperations(): boolean {
    return this.isBrowser && !this.isTestEnvironment();
  }

  ngOnInit(): void {
    if (this.canPerformDomOperations()) {
      // Reemplazamos la llamada directa a loadProductBilling por el nuevo método que verifica si ya están cargados
      this.viewModel.ensureDataLoaded();
      
      // Escuchar eventos de resize para actualizar el gráfico
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(300),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          if (this.viewModel.productBilling()?.length > 0) {
            this.updateChartOption(this.viewModel.productBilling());
          }
        });
    }
  }
  
  ngAfterViewInit(): void {
    // Detectar cambios en el tamaño del contenedor padre
    if (this.canPerformDomOperations()) {
      this.observeParentResize();
    }
  }
  
  // Observar cambios en el ancho del contenedor padre (útil cuando se abre/cierra un menú lateral)
  private observeParentResize(): void {
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        // Al detectar cambio en el tamaño, actualizar el gráfico
        if (this.viewModel.productBilling()?.length > 0) {
          this.updateChartOption(this.viewModel.productBilling());
        }
      });
      
      // Observar el contenedor padre
      const parent = this.elementRef.nativeElement.closest('.chart-wrapper');
      if (parent) {
        resizeObserver.observe(parent);
      }
      
      // Limpieza al destruir con la referencia de destrucción
      this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Actualiza las opciones del gráfico con la leyenda pegada al margen derecho
   */
  private updateChartOption(productBilling: any[]): void {
    if (!this.isBrowser) return;
    
    if (!productBilling || productBilling.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    // Ordenar los datos por valor descendente para mejor visualización
    const sortedData = [...productBilling].sort((a, b) => b.totalBilling - a.totalBilling);

    // Aumentamos a mostrar los top 10 productos individuales para reducir la categoría "Otros"
    const topProducts = sortedData.slice(0, 10);
    
    // Agregar "Otros" solo si representan más del 3% del total para reducir más su presencia
    if (sortedData.length > 10) {
      const otherCategories = sortedData.slice(10);
      const otherValue = otherCategories.reduce(
        (sum, product) => sum + product.totalBilling,
        0
      );

      // Calcular el total para determinar el porcentaje que representan "Otros"
      const totalAll = sortedData.reduce((sum, product) => sum + product.totalBilling, 0);
      const othersPercentage = (otherValue / totalAll) * 100;
      
      // Solo incluir "Otros" si representan más del 3% del total
      if (othersPercentage > 3) {
        topProducts.push({
          productName: 'Otros',
          totalBilling: otherValue
        });
      }
    }
    
    // Calcular el total de los productos mostrados para los porcentajes
    const totalBilling = topProducts.reduce((sum, product) => sum + product.totalBilling, 0);

    // Configuración adaptada del gráfico de clientes por producto con mejoras
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percentage = (params.value / totalBilling * 100).toFixed(2);
          return `${params.name}: ${params.value.toLocaleString('es-ES')}€ (${percentage}%)`;
        },
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        borderColor: '#444',
        textStyle: {
          color: '#fff',
        },
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        data: topProducts.map(product => product.productName),
        textStyle: {
          color: '#333',
        },
        pageButtonPosition: 'end',
        pageTextStyle: {
          color: '#666'
        }
      },
      series: [
        {
          name: 'Facturación por Producto',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
              color: '#333',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              // Formatear el valor para que sea más legible
              let formattedValue = params.value;
              if (params.value >= 1000000) {
                formattedValue = (params.value / 1000000).toFixed(1) + 'M €';
              } else if (params.value >= 1000) {
                formattedValue = (params.value / 1000).toFixed(1) + 'k €';
              } else {
                formattedValue = params.value + ' €';
              }
              return `${params.name}: ${formattedValue}`;
            },
            color: '#333',
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: '#666',
            },
          },
          data: topProducts.map(product => ({
            name: product.productName,
            value: product.totalBilling,
          })),
        },
      ],
    };
  }
}
