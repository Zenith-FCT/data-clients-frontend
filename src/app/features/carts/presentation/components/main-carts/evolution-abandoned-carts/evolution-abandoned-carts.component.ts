import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { CartsViewModelService } from '../../../viewmodel/carts-viewmodel.service';
import { effect } from '@angular/core';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-evolution-abandoned-carts',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsModule
  ],
  templateUrl: './evolution-abandoned-carts.component.html',
  styleUrls: ['./evolution-abandoned-carts.component.scss']
})
export class EvolutionAbandonedCartsComponent implements OnInit, OnDestroy {
  chartOption: EChartsOption = {};
  readonly isBrowser: boolean;
  initOpts = {
    renderer: 'canvas'
  };

  constructor(
    public cartsViewModel: CartsViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      effect(() => {
        const cartsList = this.cartsViewModel.filteredCartsModelList$();
        if (cartsList && cartsList.length > 0) {
          this.updateChartData(cartsList);
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cartsViewModel.loadCartsModelList();
    }
  }

  private updateChartData(cartsList: any[]): void {
    if (!this.isBrowser) return;

    const monthlyData = new Array(12).fill(0);
    
    cartsList.forEach(cart => {
      if (!cart.date) return;
      const [, month] = cart.date.split('-').map(Number);
      const total = parseInt(cart.total);
      if (!isNaN(total) && month >= 1 && month <= 12) {
        monthlyData[month - 1] = total;
      }
    });

    const maxValue = Math.max(...monthlyData);
    const yAxisMax = Math.ceil(maxValue * 1.2);
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];    this.chartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}: ${data.value} carritos`;
        }
      },
      textStyle: {
        fontFamily: 'Swiss 721 BT EX Roman, Swiss721BT-ExRoman, Arial, sans-serif',
        fontSize: 12,
      },
      silent: false, 
      animation: true,
      grid: {
        top: 30,
        right: '2%',
        bottom: 30,
        left: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          margin: 18,
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        max: yAxisMax,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          formatter: (value: number) => {
            return Math.round(value).toString();
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.38)'
          }
        }
      },
      series: [{
        data: monthlyData,
        type: 'line',
        smooth: true,
        name: 'Carritos abandonados',
        itemStyle: {
          color: '#dff03c'
        },
        areaStyle: {
          opacity: 0.3,
          color: '#dff03c',
        }
      }]
    };
  }

  ngOnDestroy(): void {
   
  }
}
