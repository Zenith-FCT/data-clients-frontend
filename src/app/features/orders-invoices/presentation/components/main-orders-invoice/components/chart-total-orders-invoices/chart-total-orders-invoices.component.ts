import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MonthlySalesModel } from '../../../../../domain/models/monthly-sales.model';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

@Component({
  selector: 'app-chart-total-orders-invoices',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-total-orders-invoices.component.html',
  styleUrl: './chart-total-orders-invoices.component.scss'
})
export class ChartTotalOrdersInvoicesComponent implements OnInit, AfterViewInit, OnDestroy {
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
      const data = this.monthlySalesViewModel.allMonthlySales$();
      if (data && data.length > 0) {
        this.currentData = data;
        this.extractAvailableYears(data);
        this.updateChartData(this.filterDataByYear(data));
      }
    });

    effect(() => {
      const year = this.monthlySalesViewModel.selectedYear$();
      if (year !== this.selectedYear) {
        this.selectedYear = year;
        if (this.currentData.length > 0) {
          this.updateChartData(this.filterDataByYear(this.currentData));
        }
      }
    });
  }

  ngOnInit(): void {
    this.monthlySalesViewModel.refreshData();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initChart();
      // Observador para ajustar el gráfico cuando cambie el tamaño del contenedor
      this.observeContainerResize();
    }
    this.monthlySalesViewModel.loadAllMonthWithTotals();
  }

  private observeContainerResize(): void {
    if (!this.isBrowser || !window.ResizeObserver) return;

    const resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });

    if (this.chartContainer && this.chartContainer.nativeElement) {
      resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  private extractAvailableYears(data: MonthlySalesModel[]): void {
    const uniqueYears = new Set<number>();
    
    data.forEach(item => {
      const year = parseInt(item.date.split('-')[0]);
      uniqueYears.add(year);
    });
    
    this.years = Array.from(uniqueYears).sort((a, b) => b - a);

    if (this.years.length > 0 && !this.years.includes(this.selectedYear)) {
      this.selectedYear = this.years[0];
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
    }
  }

  onYearChange(): void {
    if (this.selectedYear) {
      this.monthlySalesViewModel.setSelectedYear(this.selectedYear);
      if (this.currentData.length > 0) {
        this.updateChartData(this.filterDataByYear(this.currentData));
      }
    }
  }

  private filterDataByYear(data: MonthlySalesModel[]): MonthlySalesModel[] {
    return data.filter(item => item.date.startsWith(this.selectedYear.toString()));
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    if (!this.chartContainer || !this.chartContainer.nativeElement) return;
    
    this.chart = echarts.init(this.chartContainer.nativeElement);
    
    const option: echarts.EChartsOption = {      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        formatter: function(params: any) {
          if (!Array.isArray(params)) {
            params = [params];
          }
          
          let tooltipContent = '<div style="font-weight: bold; margin-bottom: 5px;">' + params[0].name + '</div>';
          
          params.sort((a: any, b: any) => a.seriesType === 'line' ? -1 : 1);
          
          params.forEach((param: any) => {
            if (param && param.marker && param.seriesName) {
              const marker = param.marker;
              const seriesName = param.seriesName;
              const value = param.value;
              
              if (param.seriesType === 'line') {
                tooltipContent += '<div>' + 
                  marker + ' ' + seriesName + ': <span style="font-weight: bold;">' + parseFloat(value).toLocaleString('es-ES') + ' €</span></div>';
              } else {
                tooltipContent += '<div >' + 
                  marker + ' ' + seriesName + ': <span style="font-weight: bold;">' + parseFloat(value).toLocaleString('es-ES') + '</span></div>';
              }
            }
          });
          
          return tooltipContent;        
        },
        confine: true,
        textStyle: {
          color: '#333',
          fontSize: 12
        }
      },
      legend: {
        show: false 
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.13)'
          }
        },
        axisLabel: {
          fontSize: 12,
          margin: 16,
          color: '#ffffff'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Total Facturas (€)',
          nameLocation: 'end',
          nameTextStyle: {
            fontSize: 14,
            color: '#ffffff',
            padding: [0, 0, 12, 0]
          },
          position: 'left',
          axisLabel: {
            formatter: (value: number): string => value.toLocaleString('es-ES') + ' €',
            fontSize: 12,
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.28)'
            }
          }
        },
        {
          type: 'value',
          name: 'Nº de Ventas',
          nameLocation: 'end',
          nameTextStyle: {
            fontSize: 14,
            color: '#ffffff',
            padding: [0, 0, 12, 0]
          },
          position: 'right',
          axisLabel: {
            formatter: (value: number): string => Math.round(value).toString(),
            fontSize: 12,
            color: '#ffffff'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: 'Total Facturas',
          type: 'line',
          yAxisIndex: 0,
          smooth: false,
          lineStyle: {
            width: 3,
            color: '#DFFF03'
          },
          symbol: 'circle',
          symbolSize: 12,
          itemStyle: {
            color: '#DFFF03'
          },
          emphasis: {
            itemStyle: {
              borderWidth: 3,
              borderColor: '#DFFF03',
              color: '#DFFF03'
            }
          },
          z: 10,
          data: []
        },
        {
          name: 'Número de Ventas',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: '60%',
          itemStyle: {
            color: 'rgba(255, 255, 255, 0.52)'
          },
          emphasis: {
            itemStyle: {
              color: 'rgba(255, 255, 255, 0.69)'
            }
          },
          z: 5,
          data: []
        }
      ]
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

    const invoiceValues = Array(12).fill(0);
    const salesNumberValues = Array(12).fill(0);

    data.forEach(item => {
      const month = parseInt(item.date.split('-')[1]) - 1;
      if (!isNaN(month) && month >= 0 && month < 12) {
        invoiceValues[month] = parseFloat(item.totalSales || '0');
        salesNumberValues[month] = parseInt(item.totalSalesNumber || '0');
      }
    });

    this.chart.setOption({
      series: [
        {
          data: invoiceValues
        },
        {
          data: salesNumberValues
        }
      ]
    });
    
    setTimeout(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 0);
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
