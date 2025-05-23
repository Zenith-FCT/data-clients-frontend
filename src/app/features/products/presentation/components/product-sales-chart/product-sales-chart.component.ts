import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ProductSalesViewModel } from './product-sales.view-model'; // Ensure this file exists at the specified path
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
  private destroy$ = new Subject<void>();
  isBrowser: boolean; // Cambiado de private a público para que sea accesible desde la plantilla
  salesChartOption: any = {};
  dataLoaded = false;
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
      title = 'Ventas Totales por Producto';
      chartData.sort((a, b) => b.totalSales - a.totalSales);
      
      const topProducts = chartData.slice(0, 10);
      
      if (chartData.length > 10) {
        const otherCategories = chartData.slice(10);
        const otherValue = otherCategories.reduce(
          (sum, product) => sum + product.totalSales,
          0
        );

        const totalAll = chartData.reduce((sum, product) => sum + product.totalSales, 0);
        const othersPercentage = (otherValue / totalAll) * 100;
        if (othersPercentage > 3) {
          topProducts.push({
            productType: 'Otros',
            productName: 'Otros',
            totalSales: otherValue
          });
        }
      }
      
      chartData = topProducts;
    } else {
      title = 'Ventas Totales por Tipo de Producto';
      
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
      ) as TotalSalesPerProductModel[];
    }
    
    const totalSales = chartData.reduce((sum: number, product: any) => sum + product.totalSales, 0);
    
    this.salesChartOption = {
      // Quitamos el título, ya que se muestra en el HTML
      title: {
        show: false
      },      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percentage = (params.value / totalSales * 100).toFixed(2);
          return `${params.name}: ${params.value.toLocaleString('es-ES')} unidades (${percentage}%)`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif',
        },
        borderWidth: 1,
        borderColor: '#ccc',
        padding: [8, 10],
        extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);',
        confine: true,
      },
      series: [
        {
          name: this.salesViewMode === ChartViewMode.ByProduct ? 'Ventas por Producto' : 'Ventas por Tipo de Producto',          type: 'pie',          radius: ['55%', '85%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },          
          emphasis: {
            label: {
              show: true,
              fontSize: 22,
              fontWeight: 'bold',
              color: '#000',
              fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            scale: true,
            scaleSize: 1.1
          },label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              let formattedValue = params.value;
              if (params.value >= 1000000) {
                formattedValue = (params.value / 1000000).toFixed(1) + 'M';
              } else if (params.value >= 1000) {
                formattedValue = (params.value / 1000).toFixed(1) + 'k';
              } else {
                formattedValue = params.value;
              }
              
              let name = params.name;
              if (name && name.length > 15) {
                name = name.substring(0, 15) + '...';
              }
              
              return `${name}: ${formattedValue}`;
            },
            color: '#fff',
            fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif',            fontWeight: 'bold',
            fontSize: 20,
            overflow: 'truncate',
            width: 200,          },          
            labelLine: {
            show: true,
            length: 15,
            length2: 20,
            smooth: true,
            lineStyle: {
              color: '#fff',
              width: 1.5,
            },
          },color: ['#ccf200', '#f2f3ec', '#a8c300', '#bfc1b8', '#40403f', '#1a1c00', '#6a6b69'],
          data: chartData.map((item: any) => ({
            name: this.salesViewMode === ChartViewMode.ByProduct ? item.productName : item.productType,
            value: item.totalSales,
          }))
        }
      ]
    };

    console.log('Sales chart options updated:', this.salesChartOption);
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
  
  onChartInit(ec: any): void {
    if (ec) {
      ec.on('finished', () => {
        console.log('Sales chart rendering finished');
      });
    }
  }
}
