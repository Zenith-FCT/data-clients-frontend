import { Component, inject, OnInit, ChangeDetectionStrategy, effect, signal, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
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
export class ClientsComponent implements OnInit {
  dataSource = new MatTableDataSource<ClientsList>([]);
  displayedColumns: string[] = ['email', 'orderCount', 'ltv', 'averageOrderValue'];  globalYear = new Date().getFullYear().toString();
  globalMonth = (new Date().getMonth() + 1).toString();  onGlobalYearChange(event: MatSelectChange): void {
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
  
  constructor(@Inject(PLATFORM_ID) platformId: Object, private changeDetector: ChangeDetectorRef) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      this.dataSource.data = this.viewModel.clients();
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
  }  ngOnInit(): void {
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

    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} clientes ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: topCategories.map(item => item.name)
      },
      series: [{
        name: 'Clientes por Categoría',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}'
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
    }

    const sortedLocations = [...locations].sort((a, b) => b.clientCount - a.clientCount);
    const locationLabels = sortedLocations.map(item => 
      locationType === 'country' ? item.country : item.city
    );
    const locationValues = sortedLocations.map(item => item.clientCount);

    this.locationsChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: locationLabels,
        axisLabel: {
          rotate: 45,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: 'Nº Clientes'
      },
      series: [{
        name: 'Clientes',
        type: 'bar',
        data: locationValues,
        itemStyle: {
          color: '#d32f2f',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top'
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
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '10%',  // Aumentar el margen izquierdo para que quepa la etiqueta
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.months
      },
      yAxis: {
        type: 'value',
        name: 'Nuevos Clientes',
        nameLocation: 'middle',
        nameGap: 40,  // Espacio entre el nombre y el eje
        minInterval: 1
      },
      series: [{
        name: 'Nuevos Clientes',
        type: 'bar',
        data: data.map(value => Math.round(value)),
        itemStyle: {
          color: '#E53935',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top'
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
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '10%',  // Aumentar el margen izquierdo para que quepa la etiqueta
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.months
      },
      yAxis: {
        type: 'value',
        name: 'Pedidos',
        nameLocation: 'middle',
        nameGap: 40,  // Espacio entre el nombre y el eje
        minInterval: 1
      },
      series: [{
        name: 'Pedidos',
        type: 'bar',
        data: data.map(value => Math.round(value)),
        itemStyle: {
          color: '#E53935',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top'
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