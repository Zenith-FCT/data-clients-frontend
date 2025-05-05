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
  
  private barColor = 'rgba(255, 255, 255, 0.48)';

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
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const value = params[0].value;
          return `${params[0].name}: ${value.toLocaleString('es-ES')} €`;
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(223, 255, 3, 0.3)' 
          }
        },
        backgroundColor: '#ffffff', 
        textStyle: {
          color: '#000000'
        },
        confine: true
      },
      grid: {
        left: '1%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          fontSize: 11,
          color: '#ffffff'
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: '#ffffff'
          }
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff'
          }
        }
      },
      yAxis: {
        type: 'value',
        nameTextStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          color: '#ffffff'
        },
        axisLabel: {
          formatter: (value: any) => {
            return value.toLocaleString('es-ES') + ' €';
          },
          fontSize: 11,
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.5)'
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
            color: this.barColor,
            borderWidth: 0
          },
          emphasis: {
            itemStyle: {
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
