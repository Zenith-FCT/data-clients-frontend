import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ProductSalesViewModel } from '../../product-sales.view-model';
import { NgxEchartsModule } from 'ngx-echarts';
import { TotalSalesPerProductModel } from '../../../domain/total-sales-per-product.model';
import { FormsModule } from '@angular/forms';
import { ChartViewMode } from '../../main-products.component';

@Component({
  selector: 'app-product-sales-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, FormsModule],
  templateUrl: './product-sales-chart.component.html',
  styleUrl: './product-sales-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSalesChartComponent implements OnInit, OnDestroy {
  isBrowser: boolean;
  salesChartOption: any = {};
  dataLoaded = false;
  private destroy$ = new Subject<void>();
  viewModes = ChartViewMode;
  salesViewMode = ChartViewMode.ByProduct;

  constructor(
    public viewModel: ProductSalesViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const productSales = this.viewModel.filteredProductSales();
      if (productSales && productSales.length > 0) {
        console.log('ProductSales data loaded:', productSales);
        this.dataLoaded = true;
        this.updateSalesChartOption(productSales);
      }
    });

    effect(() => {
      const loading = this.viewModel.loading();
      console.log('Loading state:', loading);
    });

    effect(() => {
      const error = this.viewModel.error();
      if (error) {
        console.error('Error loading product sales:', error);
      }
    });
  }
  ngOnInit(): void {
    if (this.isBrowser && !this.isTestEnvironment()) {
      this.viewModel.ensureDataLoaded();
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
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateSalesChartOption(productSales: any[]): void {
    if (!this.isBrowser) return;
    
    if (!productSales || productSales.length === 0) {
      this.salesChartOption = {
        title: {
          text: 'No hay datos de ventas disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    let chartData = [...productSales];
    let title = '';

    if (this.salesViewMode === ChartViewMode.ByProduct) {
      title = 'Total de Ventas por Producto';
      chartData.sort((a, b) => b.totalSales - a.totalSales);
      
      const topProducts = chartData.slice(0, 10);
      
      if (chartData.length > 10) {
        const otherProducts = chartData.slice(10);
        const otherValue = otherProducts.reduce(
          (sum, product) => sum + product.totalSales,
          0
        );

        const totalAll = chartData.reduce((sum, product) => sum + product.totalSales, 0);
        const othersPercentage = (otherValue / totalAll) * 100;
        
        if (othersPercentage > 3) {
          topProducts.push({
            productName: 'Otros',
            totalSales: otherValue
          });
        }
      }
      
      chartData = topProducts;
    } else {
      title = 'Total de Ventas por Tipo de Producto';
      
      const groupedByType = chartData.reduce((groups: any, item) => {
        const type = item.productType || 'Sin categoría';
        if (!groups[type]) {
          groups[type] = {
            productType: type,
            totalSales: 0
          };
        }
        groups[type].totalSales += item.totalSales;
        return groups;
      }, {});
      
      chartData = Object.values(groupedByType).sort(
        (a: any, b: any) => b.totalSales - a.totalSales
      );
    }
    
    const totalSales = chartData.reduce((sum: number, product: any) => 
      sum + product.totalSales, 0);    this.salesChartOption = {
      // Eliminamos el título del gráfico ya que lo tenemos en el HTML
      title: {
        show: false
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percentage = (params.value / totalSales * 100).toFixed(2);
          return `${params.name}: ${params.value.toLocaleString()} unidades (${percentage}%)`;
        },
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        borderColor: '#444',
        textStyle: {
          color: '#fff',
        },      
      },        legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        data: chartData.map((item: any) => 
          this.salesViewMode === ChartViewMode.ByProduct ? item.productName : item.productType
        ),
        textStyle: {
          color: '#333',
        },
        pageButtonPosition: 'end',
        pageTextStyle: {
          color: '#666'
        }
      },      series: [
        {
          name: 'Ventas por Producto',
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
                formattedValue = (params.value / 1000000).toFixed(1) + 'M';
              } else if (params.value >= 1000) {
                formattedValue = (params.value / 1000).toFixed(1) + 'k';
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
            name: this.salesViewMode === ChartViewMode.ByProduct ? item.productName : item.productType,
            value: item.totalSales
          })),
        }
      ]
    };
  }

  onSalesViewModeChange(mode: ChartViewMode): void {
    if (this.salesViewMode !== mode) {
      this.salesViewMode = mode;
      if (this.viewModel.filteredProductSales()?.length > 0) {
        this.updateSalesChartOption(this.viewModel.filteredProductSales());
      }
    }
  }

  onProductTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const productType = target.value || null;
    this.viewModel.setSelectedProductType(productType);
  }
}
