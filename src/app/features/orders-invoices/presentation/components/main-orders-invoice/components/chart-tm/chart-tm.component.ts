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
  
  private readonly chartColors = Array(12).fill('rgba(255, 255, 255, 0.48)');
  private readonly chartBorderColors = Array(12).fill('rgba(255, 255, 255, 1)');
  
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
    
    // Asegurémonos de que el contenedor sea visible antes de inicializar
    const containerWidth = this.chartContainer.nativeElement.clientWidth;
    const containerHeight = this.chartContainer.nativeElement.clientHeight;
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      // El contenedor no tiene dimensiones visibles, programamos un reintento
      setTimeout(() => this.initChart(), 300);
      return;
    }
    
    this.chart = echarts.init(this.chartContainer.nativeElement, undefined, { 
      renderer: 'canvas',
      width: 'auto',
      height: 'auto'
    });
    
    const colors = [...this.chartColors];
    const borderColors = [...this.chartBorderColors];
    
    // Determinar si estamos en una ventana pequeña
    const isSmallWindow = window.innerWidth < 800;
    
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
        confine: true,
      },
      grid: {
        left: isSmallWindow ? '5%' : '3%',
        right: isSmallWindow ? '5%' : '15%',
        bottom: isSmallWindow ? '15%' : '7%',
        top: isSmallWindow ? '15%' : '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.21)'
          }
        },
        axisLabel: {
          fontSize: isSmallWindow ? 10 : 13,
          margin: isSmallWindow ? 8 : 10,
          color: '#ffffff',
          interval: isSmallWindow ? 1 : 'auto',  // Mostrar etiquetas alternadas en ventanas pequeñas
          rotate: isSmallWindow ? 45 : 0  // Mayor rotación en ventanas pequeñas
        }
      },
      yAxis: {
        type: 'value',
        name: 'Valor Medio (€)',
        nameLocation: 'end',
        nameTextStyle: {
          fontWeight: 'bold',
          fontSize: isSmallWindow ? 12 : 14,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          formatter: (value: number): string => value.toLocaleString('es-ES') + ' €',
          fontSize: isSmallWindow ? 10 : 12,
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)'
          }
        }
      },
      series: [
        {
          name: 'Ticket Medio Mensual',
          type: 'bar',
          barWidth: isSmallWindow ? '50%' : '60%',
          barMaxWidth: isSmallWindow ? 30 : 50,
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
      // Usamos un enfoque más robusto para monitorear cambios de tamaño
      const resizeObserver = new ResizeObserver(() => {
        this.resizeChart();
      });
      resizeObserver.observe(this.chartContainer.nativeElement);
      
      // Mantenemos también el evento de resize para compatibilidad
      window.addEventListener('resize', this.resizeChart.bind(this));
    }
    
    // Asegurémonos de que el gráfico se ajuste inicialmente al contenedor
    this.chart.resize();
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

    // Determinar si estamos en una ventana pequeña
    const isSmallWindow = window.innerWidth < 800;
    
    // Ajustar la configuración del grid para optimizar el espacio según el tamaño actual
    const gridConfig = {
      left: isSmallWindow ? '5%' : '3%',
      right: isSmallWindow ? '5%' : '15%',
      bottom: isSmallWindow ? '15%' : '7%',
      top: isSmallWindow ? '15%' : '12%',
      containLabel: true
    };
    
    this.chart.setOption({
      grid: gridConfig,
      xAxis: {
        axisLabel: {
          rotate: isSmallWindow ? 45 : 0,
          interval: isSmallWindow ? 1 : 'auto',
          fontSize: isSmallWindow ? 10 : 13,
          margin: isSmallWindow ? 8 : 10
        }
      },
      yAxis: {
        nameTextStyle: {
          fontSize: isSmallWindow ? 12 : 14
        },
        axisLabel: {
          fontSize: isSmallWindow ? 10 : 12
        }
      },
      series: [{
        data: values,
        barWidth: isSmallWindow ? '50%' : '60%',
        barMaxWidth: isSmallWindow ? 30 : 50
      }]
    });
    
    // Forzar un resize después de actualizar los datos
    this.chart.resize();
  }

  private resizeChart(): void {
    if (!this.chart) return;
    
    // Verificar si el contenedor es visible
    const containerWidth = this.chartContainer?.nativeElement?.clientWidth || 0;
    const containerHeight = this.chartContainer?.nativeElement?.clientHeight || 0;
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      return; // El contenedor no es visible, no hacemos nada
    }
    
    // Determinar si estamos en una ventana pequeña
    const isSmallWindow = window.innerWidth < 800;
    
    // Ajustar la configuración del grid para optimizar el espacio según el tamaño actual
    const gridConfig = {
      left: isSmallWindow ? '5%' : '3%',
      right: isSmallWindow ? '5%' : '15%',
      bottom: isSmallWindow ? '15%' : '7%',
      top: isSmallWindow ? '15%' : '12%',
      containLabel: true
    };
    
    this.chart.setOption({
      grid: gridConfig,
      xAxis: {
        axisLabel: {
          rotate: isSmallWindow ? 45 : 0,
          interval: isSmallWindow ? 1 : 'auto',
          fontSize: isSmallWindow ? 10 : 13,
          margin: isSmallWindow ? 8 : 10
        }
      },
      yAxis: {
        nameTextStyle: {
          fontSize: isSmallWindow ? 12 : 14
        },
        axisLabel: {
          fontSize: isSmallWindow ? 10 : 12
        }
      },
      series: [{
        barWidth: isSmallWindow ? '50%' : '60%',
        barMaxWidth: isSmallWindow ? 30 : 50
      }]
    });
    
    this.chart.resize();
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
