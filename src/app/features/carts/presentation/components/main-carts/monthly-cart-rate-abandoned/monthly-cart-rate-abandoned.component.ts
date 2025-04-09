import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { CartsViewModelService } from '../../../viewmodel/carts-viewmodel.service';
import { effect } from '@angular/core';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-monthly-cart-rate-abandoned',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './monthly-cart-rate-abandoned.component.html',
  styleUrls: ['./monthly-cart-rate-abandoned.component.scss']
})
export class MonthlyCartRateAbandonedComponent implements OnInit, OnDestroy {
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
        const cartsList = this.cartsViewModel.filteredRateAbandonedCarts$();
        if (cartsList && cartsList.length > 0) {
          this.updateChartData(cartsList);
        }
      });
    }
  }  ngOnInit(): void {
    if (this.isBrowser) {
      this.cartsViewModel.loadAbandonedRateCarts();
      console.log('Iniciando carga de datos de tasa de carritos abandonados');
      
      // Obtener los datos actuales para depuración
      const currentData = this.cartsViewModel.filteredRateAbandonedCarts$();
      console.log('Datos actuales:', currentData);
    }
  }
  private updateChartData(cartsList: any[]): void {
    if (!this.isBrowser) return;
      
      const monthlyData = new Array(12).fill(0);
      
      console.log('Procesando datos para el gráfico:', cartsList);
      
      cartsList.forEach(cart => {
        if (!cart.date) {
          console.warn('Encontrado un cart sin fecha:', cart);
          return;
        }
        
        // Asegurémonos de que estamos parseando la fecha correctamente
        console.log('Procesando cart:', cart, 'con fecha:', cart.date);
        
        // Validar el formato de fecha (asumiendo formato YYYY-MM-DD)
        if (cart.date.includes('-')) {
          const [year, month] = cart.date.split('-').map(Number);
          const total = parseFloat(cart.total || cart.rate || '0');
          
          console.log('Año:', year, 'Mes:', month, 'Total/Rate:', total);
          
          if (!isNaN(total) && month >= 1 && month <= 12) {
            monthlyData[month - 1] = total;
            console.log('Valor agregado para el mes', month, ':', total);
          } else {
            console.warn('Datos inválidos para el mes o total:', month, total);
          }
        } else {
          console.warn('Formato de fecha incorrecto:', cart.date);
        }
      });
  
      const maxValue = Math.max(...monthlyData);
      const yAxisMax = Math.ceil(maxValue * 1.2);
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
            return `${data.name}: ${data.value} carritos`;
          }
        },
        grid: {
          top: 30,
          right: 20,
          bottom: 30,
          left: 60,
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
          minInterval: 1,
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
              return Math.round(value).toString();
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
          name: 'Carritos abandonados',
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
      
    }
}
