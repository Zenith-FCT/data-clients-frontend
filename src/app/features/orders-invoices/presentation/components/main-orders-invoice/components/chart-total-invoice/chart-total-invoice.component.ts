import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MonthlySalesModel } from '../../../../../domain/models/monthly-sales.model';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

@Component({
  selector: 'app-chart-total-invoice',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-total-invoice.component.html',
  styleUrl: './chart-total-invoice.component.scss'
})
export class ChartTotalInvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  private chart: echarts.ECharts | null = null;
  private destroy$ = new Subject<void>();
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  private currentData: MonthlySalesModel[] = [];
  private isBrowser: boolean;

  constructor(
    public monthlySalesViewModel: OrdersInvoiceViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const year = this.monthlySalesViewModel.selectedYear$();
      this.selectedYear = year;
      if (this.currentData.length > 0) {
        this.updateChartData(this.filterDataByYear(this.currentData));
      }
    });

    effect(() => {
      const data = this.monthlySalesViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.currentData = data;
        this.extractYearsFromData(data);
        this.updateChartData(this.filterDataByYear(data));
      }
    });
  }

  ngOnInit(): void {
    this.monthlySalesViewModel.refreshData();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initChart();
    }
    this.monthlySalesViewModel.loadAllMonthWithTotals();
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.updateChartData(this.filterDataByYear(this.currentData));
      }
    }
  }

  private extractYearsFromData(data: MonthlySalesModel[]): void {
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
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
    }
  }

  private filterDataByYear(data: MonthlySalesModel[]): MonthlySalesModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    if (!this.chartContainer || !this.chartContainer.nativeElement) return;
    
    this.chart = echarts.init(this.chartContainer.nativeElement);
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        padding: 10,
        formatter: function(params: any) {
          const value = params[0].value;
          return `${params[0].name}: ${parseFloat(value).toLocaleString('es-ES')} €`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '5%',     
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 12,   
          interval: 0,  
          color: '#333' 
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          formatter: (value: number) => value.toLocaleString('es-ES') + '€',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      series: [{
        name: 'Ventas Mensuales',
        type: 'line',
        smooth: false,
        lineStyle: {
          width: 2,
          color: '#FE2800'
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#FE2800'
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            borderColor: '#FE2800',
            color: '#FE2800'
          }
        },
        data: []
      }]
    };    
    this.chart.setOption(option);
    
   
    if (this.isBrowser && typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeChart.bind(this));
    }
  }

  private updateChartData(data: MonthlySalesModel[]): void {
    if (!this.chart) {
      if (this.chartContainer && this.chartContainer.nativeElement) {
        this.initChart();
      } else {
        return;
      }
    }
    
    if (!this.isBrowser || !this.chart) return;

    const values = Array(12).fill(0);
    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      if (!isNaN(month) && month >= 0 && month < 12) {
        values[month] = parseFloat(item.totalSales || '0');
      }
    });

    this.chart.setOption({
      series: [{
        data: values
      }]
    });
  }

  private resizeChart(): void {
    if (this.chart) {
      this.chart.resize();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.isBrowser && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeChart.bind(this));
    }
    
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }
}
