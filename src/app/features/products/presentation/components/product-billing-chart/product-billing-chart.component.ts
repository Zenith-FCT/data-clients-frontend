import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ProductBillingViewModel } from './product-billing.view-model';
import { NgxEchartsModule } from 'ngx-echarts';
import { TotalBillingPerProductModel } from '../../../domain/total-billing-per-product.model';
import { FormsModule } from '@angular/forms';
import { ChartViewMode } from '../../main-products.component';

@Component({
  selector: 'app-product-billing-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, FormsModule],
  templateUrl: './product-billing-chart.component.html',
  styleUrl: './product-billing-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBillingChartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  chartOption: any = {};
  dataLoaded = false;
  viewModes = ChartViewMode;
  billingViewMode = ChartViewMode.ByProduct;
  constructor(
    public viewModel: ProductBillingViewModel,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const productBilling = this.viewModel.productBilling();
      if (productBilling && productBilling.length > 0) {
        console.log('ProductBilling data loaded:', productBilling);
        this.dataLoaded = true;
        this.updateChartOption(productBilling);
      }
    });

    effect(() => {
      const loading = this.viewModel.loading();
      console.log('Loading state:', loading);
    });

    effect(() => {
      const error = this.viewModel.error();      if (error) {
        console.error('Error loading product billing:', error);
      }
    });
  }
  ngOnInit(): void {
    console.log('ProductBillingChartComponent initialized');
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
  private updateChartOption(productBilling: TotalBillingPerProductModel[]): void {
    if (!this.isBrowser) return;

    if (!productBilling || productBilling.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos de facturación disponibles',
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

    if (this.billingViewMode === ChartViewMode.ByProduct) {
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
            productType: 'Otros',
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
      ) as TotalBillingPerProductModel[];
    }
      const totalBilling = chartData.reduce((sum: number, product: any) => sum + product.totalBilling, 0);
    this.chartOption = {
      title: {
        show: false
      },      
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const percentage = (params.value / totalBilling * 100).toFixed(2);
          return `${params.name}: ${params.value.toLocaleString('es-ES')}€ (${percentage}%)`;
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
          name: this.billingViewMode === ChartViewMode.ByProduct ? 'Facturación por Producto' : 'Facturación por Tipo de Producto',          type: 'pie',          
          radius: ['55%', '85%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
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
                let name = params.name;
              if (name && name.length > 15) {
                name = name.substring(0, 15) + '...';
              }
              
              return `${name}: ${formattedValue}`;
            },              
            color: '#fff',
            fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif',
            fontWeight: 'bold',
            fontSize: 22,
            overflow: 'truncate',
            width: 200
          },            labelLine: {
            show: true,
            length: 15,
            length2: 20,
            smooth: true,
            lineStyle: {
              color: '#fff',
              width: 1.5,
            },
          },
          color: ['#ccf200', '#f2f3ec', '#a8c300', '#bfc1b8', '#40403f', '#1a1c00', '#6a6b69'],
          data: chartData.map((item: any) => ({
            name: this.billingViewMode === ChartViewMode.ByProduct ? item.productName : item.productType,
            value: item.totalBilling,
          }))
        }
      ]
    };

    
  }
  onBillingViewModeChange(mode: ChartViewMode): void {
    if (this.billingViewMode !== mode) {
      this.billingViewMode = mode;
      if (this.viewModel.productBilling()?.length > 0) {
        this.updateChartOption(this.viewModel.productBilling());
      }
    }
  }  onChartInit(ec: any): void {
    if (ec) {
      ec.on('finished', () => {
        console.log('Chart rendering finished');
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}