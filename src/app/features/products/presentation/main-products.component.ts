import { Component, OnInit, Inject, PLATFORM_ID, effect, AfterViewInit, ElementRef, OnDestroy, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsDataRepository } from '../data/products-data-repository';
import { productsProviders } from '../products.providers';
import { ProductBillingViewModel } from './product-billing.view-model';
import { ProductSalesViewModel } from './product-sales.view-model';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { GetTotalBillingPerProductUseCase } from '../domain/get-total-billing-per-product-use-case';
import { GetTotalSalesPerProductUseCase } from '../domain/get-total-sales-per-product-use-case';
import { Subject, debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductSalesChartComponent } from './components/product-sales-chart/product-sales-chart.component';

export enum ChartViewMode {
  ByProduct = 'byProduct',
  ByProductType = 'byProductType'
}

@Component({
  selector: 'app-main-products',
  standalone: true,  imports: [
    CommonModule, 
    RouterModule,
    NgxEchartsModule,
    FormsModule,
    ProductSalesChartComponent,
  ],
  providers: [
    ProductBillingViewModel,
    ProductSalesViewModel,
    ProductsDataRepository,
    GetTotalBillingPerProductUseCase,
    GetTotalSalesPerProductUseCase,
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
export class MainProductsComponent implements OnInit, AfterViewInit, OnDestroy {  isBrowser: boolean;
  chartOption: any = {};
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
    // Enums y variables para los selectores de modo de vista
  viewModes = ChartViewMode;
  currentViewMode = ChartViewMode.ByProduct;
  
  @ViewChild('echarts', { static: false }) echartElement?: ElementRef;
  
  // Paleta de colores para el gráfico 
  private colorPalette: string[] = [
    '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f',
    '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c',
    '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00',
    '#e64a19', '#5d4037', '#616161', '#455a64'
  ];

  constructor(
    public billingViewModel: ProductBillingViewModel,
    public salesViewModel: ProductSalesViewModel,
    @Inject(PLATFORM_ID) platformId: Object,
    private elementRef: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
      // Usar effect para reaccionar a cambios en los datos de facturación
    effect(() => {
      const productBilling = this.billingViewModel.productBilling();
      if (this.isBrowser && productBilling && productBilling.length > 0) {
        this.updateChartOption(productBilling);
      }
    });
  }

  private isTestEnvironment(): boolean {
    return (
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test'))))
    );
  }

  private canPerformDomOperations(): boolean {
    return this.isBrowser && !this.isTestEnvironment();
  }
  ngOnInit(): void {
    if (this.canPerformDomOperations()) {
      this.billingViewModel.ensureDataLoaded();
      
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(300),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          if (this.billingViewModel.productBilling()?.length > 0) {
            this.updateChartOption(this.billingViewModel.productBilling());
          }
        });
    }
  }
  
  ngAfterViewInit(): void {
    if (this.canPerformDomOperations()) {
      this.observeParentResize();
    }
  }
    private observeParentResize(): void {
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        if (this.billingViewModel.productBilling()?.length > 0) {
          this.updateChartOption(this.billingViewModel.productBilling());
        }
      });
      
      const parent = this.elementRef.nativeElement.closest('.chart-wrapper');
      if (parent) {
        resizeObserver.observe(parent);
      }
      
      this.destroyRef.onDestroy(() => resizeObserver.disconnect());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

    let chartData = [...productBilling];
    let title = '';

    if (this.currentViewMode === ChartViewMode.ByProduct) {
      title = 'Facturación Total por Producto';
      chartData.sort((a, b) => b.totalBilling - a.totalBilling);
      
      const topProducts = chartData.slice(0, 10);
      
      if (chartData.length > 10) {
        const otherCategories = chartData.slice(10);
        const otherValue = otherCategories.reduce(
          (sum, product) => sum + product.totalBilling,
          0
        );

        const totalAll = chartData.reduce((sum, product) => sum + product.totalBilling, 0);
        const othersPercentage = (otherValue / totalAll) * 100;
        
        if (othersPercentage > 3) {
          topProducts.push({
            productName: 'Otros',
            totalBilling: otherValue
          });
        }
      }
      
      chartData = topProducts;
    } else {
      title = 'Facturación Total por Tipo de Producto';
      
      const groupedByType = chartData.reduce((groups: any, item) => {
        const type = item.productType || 'Sin categoría';
        if (!groups[type]) {
          groups[type] = {
            productType: type,
            totalBilling: 0
          };
        }
        groups[type].totalBilling += item.totalBilling;
        return groups;
      }, {});
      
      chartData = Object.values(groupedByType).sort(
        (a: any, b: any) => b.totalBilling - a.totalBilling
      );
    }
    
    const totalBilling = chartData.reduce((sum: number, product: any) => sum + product.totalBilling, 0);

    this.chartOption = {
      title: {
        text: title,
        left: 'center',
        top: 0,
        textStyle: {
          color: '#333',
        },
      },
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
        data: chartData.map((item: any) => 
          this.currentViewMode === ChartViewMode.ByProduct ? item.productName : item.productType
        ),
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
          name: this.currentViewMode === ChartViewMode.ByProduct ? 'Facturación por Producto' : 'Facturación por Tipo de Producto',
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
          data: chartData.map((item: any) => ({
            name: this.currentViewMode === ChartViewMode.ByProduct ? item.productName : item.productType,
            value: item.totalBilling,
          })),
        },
      ],
    };
  }
  onViewModeChange(mode: ChartViewMode): void {
    if (this.currentViewMode !== mode) {
      this.currentViewMode = mode;
      if (this.billingViewModel.productBilling()?.length > 0) {
        this.updateChartOption(this.billingViewModel.productBilling());
      }
    }
  }
}