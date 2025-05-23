import { Component, inject, OnInit, ChangeDetectionStrategy, effect, signal, PLATFORM_ID, Inject, ChangeDetectorRef, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, forkJoin, of } from 'rxjs';
import { NgxEchartsModule } from 'ngx-echarts';

import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './main-clients.view-model';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from '../domain/get-total-average-orders-use-case';
import { GetAverageTicketUseCase } from '../domain/get-average-ticket-use-case';
import { GetClientsPerProductUseCase } from '../domain/get-clients-per-product-use-case';
import { GetTotalClientsByYearUseCase } from '../domain/get-total-clients-by-year-use-case';
import { GetNewClientsByYearMonthUseCase } from '../domain/get-new-clients-by-year-month-use-case';
import { GetAverageOrdersByYearUseCase } from '../domain/get-average-orders-by-year-use-case';
import { GetTotalOrdersByYearMonthUseCase } from '../domain/get-total-orders-by-year-month-use-case';
import { GetAverageTicketByYearUseCase } from '../domain/get-average-ticket-by-year-use-case';
import { GetLTVByYearMonthUseCase } from '../domain/get-ltv-by-year-month-use-case';
import { GetTopLocationsByClientsUseCase } from '../domain/get-top-locations-by-clients-use-case';
import { ProductClientDistribution } from '../domain/product-distribution.model';
import { TopLocationsByClients } from '../domain/top-locations-by-clients.model';

type FilterType = 'clients' | 'newClients' | 'orders' | 'totalOrders' | 'ticket' | 'ltv' | 'monthlyClients' | 'monthlyOrders';

interface FilterConfig {
  year: string;
  month?: string;
}

@Component({
  selector: 'app-clients',
  standalone: true,  
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,    MatOptionModule,
    MatButtonToggleModule,
    NgxEchartsModule,
    MatInputModule,
    MatRippleModule,
    MatProgressSpinnerModule
  ],providers: [...clientsProviders],
  templateUrl: './main-clients.component.html',
  styleUrls: ['./main-clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ClientsComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<ClientsList>([]);
  displayedColumns: string[] = ['email', 'orderCount', 'ltv', 'averageOrderValue'];
  
  // Paginación
  pageSize = 7; // 7 elementos por página
  currentPage = 0;
  totalItems = 0;
  totalPages = 0;
  displayData: ClientsList[] = [];
  paginationDots: number[] = [];
  emptyRows: number[] = [];
  
  globalYear = new Date().getFullYear().toString();
  globalMonth = (new Date().getMonth() + 1).toString();onGlobalYearChange(event: MatSelectChange): void {
    this.globalYear = event.value;
    
    // Solo actualizar los filtros que no tienen selectores específicos
    Object.keys(this.filters).forEach(key => {
      // Excluir filtros que tienen sus propios selectores
      if (key !== 'clients' && key !== 'orders' && key !== 'ticket' && this.filters[key as FilterType].year) {
        this.filters[key as FilterType].year = event.value;
        
        if (key === 'monthlyClients') {          
          // Cargar nuevos datos para gráfico de clientes
          this.loadMonthlyClientsData(event.value);
        } else if (key === 'monthlyOrders') {
          // Cargar nuevos datos para gráfico de pedidos
          this.loadMonthlyOrdersData(event.value);
        } else if (this.filters[key as FilterType].month) {
          // Si el filtro tiene mes, actualiza con año y mes
          this.viewModel.updateDataByYearAndMonthFilter(
            key as FilterType,
            event.value,
            this.filters[key as FilterType].month!
          );
        } else {
          // Si el filtro solo tiene año
          this.viewModel.updateDataByYearFilter(key as FilterType, event.value);
        }
      }
    });
  }

  onGlobalMonthChange(event: MatSelectChange): void {
    this.globalMonth = event.value;
    Object.keys(this.filters).forEach(key => {
      if (this.filters[key as FilterType].month) {
        this.filters[key as FilterType].month = event.value;
        if (this.filters[key as FilterType].year) {
          this.viewModel.updateDataByYearAndMonthFilter(
            key as FilterType,
            this.filters[key as FilterType].year,
            event.value
          );
        }
      }
    });
  }  chartOption: any;
  locationsChartOption: any;
  monthlyClientsChartOption: any = {};
  monthlyOrdersChartOption: any = {};
  monthlyClientsChart: any = null;
  monthlyOrdersChart: any = null;
  loadingView = true;
  isBrowser: boolean;monthlyNewClientsData = signal<number[]>(Array(12).fill(0));
  monthlyOrdersData = signal<number[]>(Array(12).fill(0));
  filters: Record<FilterType, FilterConfig> = {
    clients: { year: "all" },
    newClients: { 
      year: new Date().getFullYear().toString(), 
      month: (new Date().getMonth() + 1).toString() 
    },
    orders: { year: "all" },
    totalOrders: { 
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString()
    },
    ticket: { year: "all" },
    ltv: { 
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString()
    },
    monthlyClients: { year: new Date().getFullYear().toString() },
    monthlyOrders: { year: new Date().getFullYear().toString() }
  };

  private months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];  public viewModel = inject(ClientsViewModel);
  public getNewClientsByYearMonthUseCase = inject(GetNewClientsByYearMonthUseCase);
  public getTotalOrdersByYearMonthUseCase = inject(GetTotalOrdersByYearMonthUseCase);
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, 
              private changeDetector: ChangeDetectorRef,
              private elementRef: ElementRef,
              private renderer: Renderer2) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      this.dataSource.data = this.viewModel.clients();
      this.totalItems = this.viewModel.clients().length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.paginationDots = Array(this.totalPages).fill(0).map((_, i) => i);
      this.updateDisplayData();
      
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      if (this.isBrowser) {
        this.updateChartOption();
        this.updateLocationsChartOption();
        this.updateMonthlyClientsChartOption();
        this.updateMonthlyOrdersChartOption();
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const headerCells = this.elementRef.nativeElement.querySelectorAll('th.mat-header-cell');
      headerCells.forEach((cell: HTMLElement) => {
        this.renderer.setStyle(cell, 'color', '#000000');
        this.renderer.setStyle(cell, 'font-weight', 'bold');
        cell.style.setProperty('color', '#000000', 'important');
        cell.style.setProperty('font-weight', 'bold', 'important');
      });
      
      this.applyBorderToLastRow();
    }, 0);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updateDisplayData();
    }
  }
  
  // Método para crear un rango de números (necesario para la paginación)
  createRange(number: number): number[] {
    return Array.from({ length: number }, (_, i) => i);
  }
  
  // Método para actualizar los datos mostrados en la tabla
  updateDisplayData(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.displayData = this.dataSource.data.slice(start, end);
    
    // Calcular filas vacías para mantener altura constante
    const emptyRowCount = this.pageSize - this.displayData.length;
    this.emptyRows = emptyRowCount > 0 ? Array(emptyRowCount).fill(0).map((_, i) => i) : [];
    
    setTimeout(() => this.applyBorderToLastRow(), 100);
  }

  private applyBorderToLastRow(): void {
    const rows = this.elementRef.nativeElement.querySelectorAll('tr.mat-mdc-row:not(.empty-row)');
    
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      
      const cells = lastRow.querySelectorAll('td');
      cells.forEach((cell: HTMLElement) => {
        cell.style.setProperty('border-bottom', '1px solid #FFFFFF', 'important');
      });
    }
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      // Activar pantalla de carga
      this.loadingView = true;
      
      // Inicializar valores para filtros
      this.globalYear = new Date().getFullYear().toString(); // Por defecto, mostrar año actual
      this.globalMonth = (new Date().getMonth() + 1).toString(); // Mes actual
      
      // Asegurarse de que los filtros con opción "all" mantengan esa opción
      this.filters.clients.year = "all";
      this.filters.orders.year = "all";
      this.filters.ticket.year = "all";
      
      // Para filtros basados solo en mes y año, usar los valores globales
      Object.keys(this.filters).forEach(key => {
        if (key !== 'clients' && key !== 'orders' && key !== 'ticket') {
          if (this.filters[key as FilterType].year) {
            this.filters[key as FilterType].year = this.globalYear;
          }
          if (this.filters[key as FilterType].month) {
            this.filters[key as FilterType].month = this.globalMonth;
          }
        }
      });
      
      // Cargar datos
      this.viewModel.loadData();
      this.loadMonthlyData();
    }
  }

  onYearFilterChange(event: MatSelectChange, type: FilterType): void {
    this.filters[type].year = event.value;
    this.viewModel.updateDataByYearFilter(type, event.value);
  }

  onYearMonthFilterChange(
    event: MatSelectChange,
    type: FilterType,
    field: 'year' | 'month'
  ): void {
    if (this.filters[type]) {
      this.filters[type][field] = event.value;
      
      if (this.filters[type].year && this.filters[type].month) {
        this.viewModel.updateDataByYearAndMonthFilter(
          type,
          this.filters[type].year,
          this.filters[type].month
        );
      }
    }
  }

  onLocationTypeChange(event: { value: 'country' | 'city' }): void {
    this.viewModel.updateLocationType(event.value);
  }  onMonthlyClientsChartYearFilterChange(event: MatSelectChange): void {
    const year = event.value;
    this.filters.monthlyClients.year = year;
    
    // Cargar nuevos datos
    this.loadMonthlyClientsData(year);
  }  onMonthlyClientsChartInit(event: any): void {
    console.log('Gráfico de clientes mensuales inicializado');
    this.monthlyClientsChart = event;
  }
  
  onMonthlyOrdersChartInit(event: any): void {
    console.log('Gráfico de pedidos mensuales inicializado');
    this.monthlyOrdersChart = event;
  }  private loadMonthlyData(): void {
    if (this.filters.monthlyClients.year) {
      this.loadMonthlyClientsData(this.filters.monthlyClients.year);
    }
    if (this.filters.monthlyOrders.year) {
      this.loadMonthlyOrdersData(this.filters.monthlyOrders.year);
    }
  }

  onMonthlyOrdersChartYearFilterChange(event: MatSelectChange): void {
    const year = event.value;
    this.filters.monthlyOrders.year = year;
    
    // Cargar nuevos datos
    this.loadMonthlyOrdersData(year);
  }  private loadMonthlyClientsData(year: string): void {
    if (!this.isBrowser) return;
    
    const requests = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString();
      return this.getNewClientsByYearMonthUseCase.execute(year, month).pipe(
        catchError(() => of(0))
      );    
    });
    
    forkJoin(requests).subscribe({
      next: (results) => {
        console.log('Datos cargados de clientes mensuales:', year, results);
        
        // Actualizar los datos
        this.monthlyNewClientsData.set(results);
        
        // Crear las opciones del gráfico
        this.updateMonthlyClientsChartOption();
        
        // Si tenemos una referencia al gráfico, actualizarlo directamente
        if (this.monthlyClientsChart) {
          console.log('Actualizando gráfico de clientes mensuales directamente');
          this.monthlyClientsChart.setOption(this.monthlyClientsChartOption, true, true);
        } else {
          console.log('No hay referencia al gráfico de clientes mensuales');
        }
        
        // Desactivar pantalla de carga
        this.loadingView = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos de clientes mensuales:', err);
        this.monthlyNewClientsData.set(Array(12).fill(0));
        this.updateMonthlyClientsChartOption();
        
        if (this.monthlyClientsChart) {
          this.monthlyClientsChart.setOption(this.monthlyClientsChartOption, true, true);
        }
        
        // Desactivar pantalla de carga incluso en caso de error
        this.loadingView = false;
        this.changeDetector.detectChanges();
      }
    });
  }  private loadMonthlyOrdersData(year: string): void {
    if (!this.isBrowser) return;
    
    const requests = Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString();
      return this.getTotalOrdersByYearMonthUseCase.execute(year, month).pipe(
        catchError(() => of(0))
      );    
    });
    
    forkJoin(requests).subscribe({
      next: (results) => {
        console.log('Datos cargados de pedidos mensuales:', year, results);
        
        // Actualizar los datos
        this.monthlyOrdersData.set(results);
        
        // Crear las opciones del gráfico
        this.updateMonthlyOrdersChartOption();
        
        // Si tenemos una referencia al gráfico, actualizarlo directamente
        if (this.monthlyOrdersChart) {
          console.log('Actualizando gráfico de pedidos mensuales directamente');
          this.monthlyOrdersChart.setOption(this.monthlyOrdersChartOption, true, true);
        } else {
          console.log('No hay referencia al gráfico de pedidos mensuales');
        }
        
        // Desactivar pantalla de carga
        this.loadingView = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos de pedidos mensuales:', err);
        this.monthlyOrdersData.set(Array(12).fill(0));
        this.updateMonthlyOrdersChartOption();
        
        if (this.monthlyOrdersChart) {
          this.monthlyOrdersChart.setOption(this.monthlyOrdersChartOption, true, true);
        }
        
        // Desactivar pantalla de carga incluso en caso de error
        this.loadingView = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  private updateChartOption(): void {
    if (!this.isBrowser) return;

    const distribution = this.viewModel.clientsPerProduct();
    if (!distribution || distribution.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
        }
      };
      return;
    }

    const sortedData = [...distribution].sort((a, b) => b.value - a.value);
    const topCategories = sortedData.slice(0, 5);
    
    if (sortedData.length > 5) {
      const otherValue = sortedData
        .slice(5)
        .reduce((sum, item) => sum + item.value, 0);
      if (otherValue > 0) {
        topCategories.push({ name: 'Otros', value: otherValue });
      }
    }    
    const colors = ['#ccf200', '#f2f3ec', '#a8c300', '#bfc1b8', '#40403f', '#1a1c00', '#6a6b69'];
    
    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          return params.name + ': ' + Math.floor(params.value) + ' clientes (' + Math.floor(params.percent) + '%)';
        },
        backgroundColor: 'rgba(255, 255, 255, 0.64)',
        padding: 10,
        confine: true,
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: topCategories.map(item => item.name),
        textStyle: {
          color: '#ffffff'
        }
      },
      color: colors,
      series: [{
        name: 'Clientes por Categoría',
        type: 'pie',
        radius: '75%',
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside', 
          formatter: '{b}: {c}',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          overflow: 'truncate',
          width: 80,
          distance: 15,
          align: 'center',
          lineHeight: 14
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
          smooth: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: topCategories
      }]
    };
  }

  private updateLocationsChartOption(): void {
    if (!this.isBrowser) return;

    const locations = this.viewModel.topLocationsByClients();
    const locationType = this.viewModel.currentLocationType();
    
    if (!locations || locations.length === 0) {
      this.locationsChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center'
        }
      };
      return;
    }    const sortedLocations = [...locations].sort((a, b) => b.clientCount - a.clientCount);
    const locationLabels = sortedLocations.map(item => 
      locationType === 'country' ? item.country : item.city
    );    // Redondear los valores de clientes para eliminar decimales
    const locationValues = sortedLocations.map(item => Math.floor(item.clientCount));
    
    this.locationsChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params: any[]) {
          const param = params[0];
          return param.name + '<br/>' + param.seriesName + ': ' + Math.floor(param.value);
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },      xAxis: {
        type: 'category',
        data: locationLabels,
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.13)'
          }
        },
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 12,
          margin: 16,
          color: '#ffffff'
        }
      },      yAxis: {
        type: 'value',
        name: 'Nº Clientes',
        minInterval: 1, // Asegurar que los valores son enteros
        axisLabel: {
          fontSize: 12,
          color: '#ffffff',
          formatter: function(value: number) {
            return Math.floor(value); // Mostrar solo enteros en el eje Y
          }
        },
        nameTextStyle: {
          fontSize: 14,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.28)'
          }
        }},series: [{
        name: 'Clientes',
        type: 'bar',
        data: locationValues,
        itemStyle: {
          color: 'rgba(255, 255, 255, 0.52)',
          borderRadius: [4, 4, 0, 0]
        },        label: {
          show: true,
          position: 'top',
          color: '#FFFFFF',
          formatter: function(params: any) {
            return Math.floor(params.value);
          }
        }
      }]
    };
  }  private updateMonthlyClientsChartOption(): void {
    if (!this.isBrowser) return;

    const data = this.monthlyNewClientsData();
    if (!data || data.length === 0) {
      this.monthlyClientsChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center'
        }
      };
      return;
    }    // Crear una copia completamente nueva del objeto de opciones
    const newOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params: any[]) {
          const param = params[0];
          return param.name + '<br/>' + param.seriesName + ': ' + Math.round(param.value);
        }
      },
      grid: {
        left: '10%',  // Aumentar el margen izquierdo para que quepa la etiqueta
        right: '4%',
        bottom: '3%',
        containLabel: true
      },      xAxis: {
        type: 'category',
        data: this.months,
        axisLine: {
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
      yAxis: {
        type: 'value',
        name: 'Nuevos Clientes',
        nameLocation: 'middle',
        nameGap: 40,
        minInterval: 1,
        nameTextStyle: {
          fontSize: 14,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        axisLabel: {
          fontSize: 12,
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.28)'
          }
        }
      },      series: [{
        name: 'Nuevos Clientes',
        type: 'bar',
        data: data.map(value => Math.floor(value)),
        itemStyle: {
          color: 'rgba(255, 255, 255, 0.52)',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#FFFFFF'
        }
      }]
    };

    // Asignar las nuevas opciones
    this.monthlyClientsChartOption = newOption;
  }  private updateMonthlyOrdersChartOption(): void {
    if (!this.isBrowser) return;

    const data = this.monthlyOrdersData();
    if (!data || data.length === 0) {
      this.monthlyOrdersChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center'
        }
      };
      return;
    }    // Crear una copia completamente nueva del objeto de opciones
    const newOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params: any[]) {
          const param = params[0];
          return param.name + '<br/>' + param.seriesName + ': ' + Math.round(param.value);
        }
      },
      grid: {
        left: '10%',  // Aumentar el margen izquierdo para que quepa la etiqueta
        right: '4%',
        bottom: '3%',
        containLabel: true
      },      xAxis: {
        type: 'category',
        data: this.months,
        axisLine: {
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
      yAxis: {
        type: 'value',
        name: 'Pedidos',
        nameLocation: 'middle',
        nameGap: 40,
        minInterval: 1,
        nameTextStyle: {
          fontSize: 14,
          color: '#ffffff',
          padding: [0, 0, 12, 0]
        },
        axisLabel: {
          fontSize: 12,
          color: '#ffffff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.28)'
          }
        }
      },series: [{
        name: 'Pedidos',
        type: 'bar',
        data: data.map(value => Math.round(value)),
        itemStyle: {
          color: 'rgba(255, 255, 255, 0.52)',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          color: '#FFFFFF'
        }
      }]
    };

    // Asignar las nuevas opciones
    this.monthlyOrdersChartOption = newOption;
  }
  /**
   * Convierte el número del mes a su nombre en español
   * @param monthNumber Número del mes (1-12) o undefined
   * @returns Nombre del mes en español o "Todos" si es undefined
   */
  getMonthNameFromNumber(monthNumber: string | undefined): string {
    if (!monthNumber) {
      return 'Todos';
    }
    
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthIndex = parseInt(monthNumber, 10) - 1;
    
    if (monthIndex >= 0 && monthIndex < 12) {
      return monthNames[monthIndex];
    }
    
    return 'Mes desconocido';
  }
}