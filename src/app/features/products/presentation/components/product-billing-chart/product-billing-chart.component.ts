import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ProductBillingViewModel } from '../../product-billing.view-model';
import { NgxEchartsModule } from 'ngx-echarts';
import { TotalBillingPerProductModel } from '../../../domain/total-billing-per-product.model';

@Component({
  selector: 'app-product-billing-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './product-billing-chart.component.html',
  styleUrl: './product-billing-chart.component.scss'
})
export class ProductBillingChartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  chartOption: any = {};
  dataLoaded = false;

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
      const error = this.viewModel.error();
      if (error) {
        console.error('Error loading product billing:', error);
      }
    });
  }

  ngOnInit(): void {
    console.log('ProductBillingChartComponent initialized');
    this.viewModel.loadProductBilling();
  }

  private updateChartOption(productBilling: TotalBillingPerProductModel[]): void {
    if (!this.isBrowser) return;

    // Tomamos los top 10 productos por facturación
    const topProducts = productBilling.slice(0, 10);
    
    // Preparamos los datos para el gráfico
    const data = topProducts.map(item => ({
      value: item.totalBilling,
      name: item.productName
    }));

    console.log('Preparing chart with data:', data);

    // Configuración para el gráfico circular de eCharts
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}€ ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        textStyle: {
          color: '#333',
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'middle',
        type: 'scroll',
        textStyle: {
          color: '#333'
        }
      },
      series: [
        {
          name: 'Facturación Total por Producto',
          type: 'pie',
          radius: ['40%', '70%'],
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
            formatter: '{b}: {c}€',
            color: '#333',
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: '#666',
            },
          },
          data: data
        }
      ]
    };

    console.log('Chart options updated:', this.chartOption);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}