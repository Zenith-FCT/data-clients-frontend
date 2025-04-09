import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrdersInvoiceViewModelService } from '../../../../view-model/orders-invoice-viewmodel.service';
import { Subject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TmModel } from '../../../../../domain/use-cases/get-all-monthly-tm.use-case';
import * as echarts from 'echarts';

@Component({
  selector: 'app-chart-tm',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './chart-tm.component.html',
  styleUrl: './chart-tm.component.scss'
})
export class ChartTmComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  private chart: echarts.ECharts | null = null;
  private destroy$ = new Subject<void>();
  private currentData: TmModel[] = [];
  private isBrowser: boolean;
  years: number[] = [];
  
  private readonly chartColors = [
    'rgba(255, 99, 132, 0.2)',   
    'rgba(54, 162, 235, 0.2)', 
    'rgba(255, 206, 86, 0.2)',  
    'rgba(75, 192, 192, 0.2)',  
    'rgba(153, 102, 255, 0.2)', 
    'rgba(255, 159, 64, 0.2)',  
    'rgba(76, 175, 80, 0.2)',  
    'rgba(121, 85, 72, 0.2)',  
    'rgba(233, 30, 99, 0.2)',  
    'rgba(156, 39, 176, 0.2)',  
    'rgba(3, 169, 244, 0.2)', 
    'rgba(255, 87, 34, 0.2)' 
  ];

  private readonly chartBorderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(121, 85, 72, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(255, 87, 34, 1)'
  ];
  
  dataLoaded = false;
  chartInitialized = false;

  constructor(
    public readonly ordersInvoiceViewModel: OrdersInvoiceViewModelService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      const tmList = this.ordersInvoiceViewModel.monthlyTmList$();
      if (tmList && tmList.length > 0) {
        this.currentData = tmList;
        this.dataLoaded = true;
        
        this.updateAvailableYears(tmList);
        
        const selectedYear = this.ordersInvoiceViewModel.selectedTmYear$();
        if (this.years.length > 0 && !this.years.includes(selectedYear)) {
          this.ordersInvoiceViewModel.setSelectedTmYear(this.years[0]);
        }
        
        const filteredData = this.filterDataByYear(tmList, selectedYear);
        if (this.chartInitialized) {
          this.updateChart(filteredData);
        }
      }
    });
  }

  ngOnInit(): void {
    this.ordersInvoiceViewModel.loadMonthlyTmList();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initChart();
        this.chartInitialized = true;
        
        if (this.currentData.length > 0) {
          const selectedYear = this.ordersInvoiceViewModel.selectedTmYear$();
          this.updateChart(this.filterDataByYear(this.currentData, selectedYear));
        }
      }, 500); 
    }
  }

  onYearChange(event: any): void {
    if (event.value) {
      this.ordersInvoiceViewModel.setSelectedTmYear(event.value);
      if (this.currentData.length > 0) {
        this.updateChart(this.filterDataByYear(this.currentData, event.value));
      }
    }
  }

  private updateAvailableYears(data: TmModel[]): void {
    const uniqueYears = [...new Set(data.map(item => item.year))];
    this.years = uniqueYears.sort((a, b) => b - a);
  }

  private filterDataByYear(data: TmModel[], year: number): TmModel[] {
    return data.filter(item => item.year === year);
  }

  private initChart(): void {
    if (!this.isBrowser) return;
    
    if (!this.chartContainer || !this.chartContainer.nativeElement) return;
    
    this.chart = echarts.init(this.chartContainer.nativeElement);
    
    const colors = [...this.chartColors];
    const borderColors = [...this.chartBorderColors];
    
    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        formatter: function(params: any) {
          return `Ticket Medio: ${parseFloat(params.value).toLocaleString('es-ES')} €`;
        },
        textStyle: {
          color: '#000000',
          fontSize: 14
        },
      },
      grid: {
        left: '5%',
        right: '8%',
        bottom: '3%', 
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.3)'
          }
        },
        axisLabel: {
          fontSize: 14,
          margin: 12,
          color: '#000000'
        }
      },
      yAxis: {
        type: 'value',
        name: 'Valor Medio (€)',
        nameLocation: 'end',
        nameTextStyle: {
          fontWeight: 'bold',
          fontSize: 14,
          color: '#000000'
        },
        axisLine: {
          show: false        },
        axisLabel: {
          formatter: (value: number): string => value.toLocaleString('es-ES') + ' €',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },      series: [
        {
          name: 'Ticket Medio Mensual',
          type: 'bar',
          barWidth: '70%',
          data: [],
          markLine: {
            silent: true,
            data: []
          },
          itemStyle: {
            color: function(params: echarts.DefaultLabelFormatterCallbackParams) {
              return colors[params.dataIndex % colors.length];
            }
          },
          emphasis: {
            itemStyle: {
              color: function(params: echarts.DefaultLabelFormatterCallbackParams) {
                const index = params.dataIndex % colors.length;
                const baseColor = colors[index];
                return baseColor.replace('0.2', '0.5');
              }
            }
          }
        }
      ]
    };
    
    this.chart.setOption(option);
    if (this.isBrowser && typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeChart.bind(this));
    }
  }

  private updateChart(data: TmModel[]): void {
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
      const monthIndex = item.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        values[monthIndex] = parseFloat(item.tm);
      }
    });

    this.chart.setOption({
      series: [{
        data: values
      }]
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
