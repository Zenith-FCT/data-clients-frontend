import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { CartsViewModelService } from '../../../viewmodel/carts-viewmodel.service';
import { effect } from '@angular/core';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-monthly-abandoned-carts',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsModule
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: {
        echarts: () => import('echarts')
      }
    }
  ],
  templateUrl: './monthly-abandoned-carts.component.html',
  styleUrls: ['./monthly-abandoned-carts.component.scss']
})
export class MonthlyAbandonedCartsComponent implements OnInit, OnDestroy {
  chartOption: EChartsOption = {};
  readonly isBrowser: boolean;
  initOpts = {
    renderer: 'canvas',
    width: 'auto',
    height: '500px'
  };

  constructor(
    public cartsViewModel: CartsViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      effect(() => {
        const cartsList = this.cartsViewModel.filteredCartsModelList$();
        if (cartsList) {
          this.updateChartData(cartsList);
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cartsViewModel.loadMonthlyAbandonedCarts();
    }
  }

  private updateChartData(cartsList: any[]): void {
    if (!this.isBrowser) return;

    const monthlyData = new Array(12).fill(0);
    
    cartsList.forEach(cart => {
      const month = new Date(cart.date).getMonth();
      const total = parseFloat(cart.total);
      if (!isNaN(total)) {
        monthlyData[month] += total;
      }
    });

    const maxValue = Math.max(...monthlyData);
    const yAxisMax = maxValue + (maxValue * 0.1); // 10% more for padding

    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    this.chartOption = {
      backgroundColor: '#ffffff',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>${data.value.toLocaleString('es-ES')} €`;
        }
      },
      grid: {
        top: '5%',
        right: '3%',
        bottom: '3%',
        left: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        max: yAxisMax,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#666'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 12,
          formatter: (value: number) => {
            return value.toLocaleString('es-ES', { 
              maximumFractionDigits: 0
            }) + ' €';
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0,0,0,0.1)'
          }
        }
      },
      series: [{
        data: monthlyData,
        type: 'line',
        smooth: true,
        name: 'Total abandonado',
        itemStyle: {
          color: '#1976d2'
        },
        areaStyle: {
          opacity: 0.3,
          color: '#1976d2'
        }
      }]
    };
  }

  ngOnDestroy(): void {
    // Cleanup handled by effect()
  }
}
