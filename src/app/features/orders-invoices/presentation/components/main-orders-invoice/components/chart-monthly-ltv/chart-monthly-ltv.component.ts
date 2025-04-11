import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import type { BarSeriesOption } from 'echarts';
import { LtvViewModelService } from '../../../../view-model/ltv-viewmodel.service';
import { LtvModel } from '../../../../../domain/models/ltv.model';

type EchartsSeries = BarSeriesOption;

@Component({
  selector: 'app-chart-monthly-ltv',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule, NgxEchartsModule],
  templateUrl: './chart-monthly-ltv.component.html',
  styleUrl: './chart-monthly-ltv.component.scss'
})
export class ChartMonthlyLTVComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: LtvModel[] = [];
  public isBrowser: boolean;
  chartOption: EChartsOption = {};
  
  private chartColors = [
    'rgba(33, 150, 243, 0.3)',  
    'rgba(156, 39, 176, 0.3)',  
    'rgba(233, 30, 99, 0.3)',    
    'rgba(244, 67, 54, 0.3)',    
    'rgba(255, 152, 0, 0.3)',   
    'rgba(255, 235, 59, 0.3)',  
    'rgba(76, 175, 80, 0.3)',    
    'rgba(0, 150, 136, 0.3)',    
    'rgba(63, 81, 181, 0.3)',   
    'rgba(121, 85, 72, 0.3)',   
    'rgba(158, 158, 158, 0.3)', 
    'rgba(96, 125, 139, 0.3)'    
  ];

  // Color gris claro para el borde
  private borderColor = 'rgba(200, 200, 200, 0.5)';

  constructor(
    public ltvViewModel: LtvViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      effect(() => {
        const ltvData = this.ltvViewModel.ltv$();
        if (ltvData && ltvData.length > 0) {
          this.currentData = ltvData;
          this.extractAvailableYears(ltvData);
          this.updateChartWithData(this.filterDataByYear(ltvData));
        }
      });

      effect(() => {
        const year = this.ltvViewModel.selectedYear$();
        if (year !== this.selectedYear) {
          this.selectedYear = year;
          if (this.currentData.length > 0) {
            this.updateChartWithData(this.filterDataByYear(this.currentData));
          }
        }
      });
    }
  }

  ngOnInit(): void {
    this.ltvViewModel.loadLtv();
    if (this.isBrowser) {
      this.initChart();
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initChart();
      }, 100);
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.ltvViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.updateChartWithData(this.filterDataByYear(this.currentData));
      }
    }
  }

  private extractAvailableYears(data: LtvModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      if (!isNaN(year)) {
        uniqueYears.add(year);
      }
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);
    
    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.ltvViewModel.setSelectedYear(this.selectedYear);
    }
  }

  private filterDataByYear(data: LtvModel[]): LtvModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private initChart(): void {
    if (!this.isBrowser) return;

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].name}: ${value.toLocaleString('es-ES')} €`;
        },
        axisPointer: {
          type: 'shadow'
        },
        confine: true
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          fontSize: 11
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        }
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          fontWeight: 'bold',
          fontSize: 14
        },
        axisLabel: {
          formatter: (value: any) => {
            return value.toLocaleString('es-ES') + ' €';
          },
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      series: [
        {
          name: 'LTV Mensual',
          type: 'bar',
          barWidth: '60%',
          data: [] as number[],
          itemStyle: {
            color: (params: any) => {
              return this.chartColors[params.dataIndex % this.chartColors.length];
            },
            // Usar el color gris claro para el borde en lugar del color específico de la barra
            borderColor: this.borderColor,
            borderWidth: 1
          },
          emphasis: {
            // Simplificar la animación para solo oscurecer la barra al pasar el mouse
            itemStyle: {
              // Sin sombras o efectos adicionales
              shadowBlur: 0,
              shadowOffsetX: 0,
              // Oscurecer la barra aumentando la opacidad
              opacity: 0.8
            }
          }
        } as BarSeriesOption
      ]
    };
  }

  private updateChartWithData(data: LtvModel[]): void {
    if (!this.isBrowser) return;

    this.initChart();
    const values = Array(12).fill(0);
    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      if (month >= 0 && month < 12) {
        values[month] = parseFloat(item.ltv);
      }
    });

    if (this.chartOption.series && Array.isArray(this.chartOption.series) && this.chartOption.series.length > 0) {
      (this.chartOption.series[0] as BarSeriesOption).data = values;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
