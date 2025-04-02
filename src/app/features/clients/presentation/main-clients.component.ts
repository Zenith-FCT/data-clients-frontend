import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  effect,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { catchError, forkJoin, of } from 'rxjs'; // Importamos los operadores de RxJS necesarios

import { NgxEchartsModule } from 'ngx-echarts';
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { clientsProviders } from '../clients.providers';
import { ClientsViewModel } from './clients.view-model';
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

type FilterType =
  | 'clients'
  | 'newClients'
  | 'orders'
  | 'totalOrders'
  | 'ticket'
  | 'ltv'
  | 'monthlyClients'
  | 'monthlyOrders';

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
    MatSelectModule,
    MatOptionModule,
    MatButtonToggleModule,
    NgxEchartsModule,

  ],
  providers: [
    GetClientsListUseCase,
    GetTotalClientsUseCase,
    GetTotalAverageOrdersUseCase,
    GetAverageTicketUseCase,
    GetClientsPerProductUseCase,
    // Nuevos casos de uso
    GetTotalClientsByYearUseCase,
    GetNewClientsByYearMonthUseCase,
    GetAverageOrdersByYearUseCase,
    GetTotalOrdersByYearMonthUseCase,
    GetAverageTicketByYearUseCase,
    GetLTVByYearMonthUseCase,
    GetTopLocationsByClientsUseCase,

    ...clientsProviders,
    ClientsViewModel,
  ],
  templateUrl: './main-clients.component.html',
  styleUrls: ['./main-clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ClientsComponent implements OnInit {
  dataSource = new MatTableDataSource<ClientsList>([]);
  displayedColumns: string[] = [
    'email',
    'orderCount',
    'ltv',
    'averageOrderValue',
  ];
  chartOption: any;
  locationsChartOption: any;
  monthlyClientsChartOption: any;
  monthlyOrdersChartOption: any; // Nuevo gráfico para pedidos por mes
  isBrowser: boolean;
  // Filtros actuales con tipos correctos
  filters: Record<FilterType, FilterConfig> = {
    clients: { year: 'all' },
    newClients: { year: '2023', month: '3' },
    orders: { year: 'all' },
    totalOrders: { year: '2023', month: '3' },
    ticket: { year: 'all' },
    ltv: { year: '2023', month: '3' },
    monthlyClients: { year: '2023' },
    monthlyOrders: { year: '2023' }, // Nuevo filtro para el gráfico de pedidos mensuales
  };

  // Datos de nuevos clientes por mes (se actualizarán según el año seleccionado)
  private monthlyNewClientsData: number[] = [];
  private monthlyOrdersData: number[] = []; // Datos de pedidos mensuales
  private months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  public viewModel = inject(ClientsViewModel);
  public getNewClientsByYearMonthUseCase = inject(GetNewClientsByYearMonthUseCase);
  public getTotalOrdersByYearMonthUseCase = inject(GetTotalOrdersByYearMonthUseCase); // Para cargar pedidos por mes

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      this.dataSource.data = this.viewModel.clients();
      if (this.isBrowser) {
        this.updateChartOption();
        this.updateLocationsChartOption();
        this.updateMonthlyClientsChartOption();
        this.updateMonthlyOrdersChartOption(); // Actualizar el nuevo gráfico de pedidos
      }
    });
  }

  // Añadimos propiedad para almacenar los años disponibles
  years = ['all', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  
  ngOnInit(): void {
    // Obtener el mes y año actuales
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString(); // getMonth() es base 0
    
    // Asegurarse de que el año actual esté en la lista de años disponibles
    if (!this.years.includes(currentYear)) {
      this.years.push(currentYear);
    }
    
    // Actualizar los filtros con los valores actuales
    this.filters = {
      clients: { year: currentYear },
      newClients: { year: currentYear, month: currentMonth },
      orders: { year: currentYear },
      totalOrders: { year: currentYear, month: currentMonth },
      ticket: { year: currentYear },
      ltv: { year: currentYear, month: currentMonth },
      monthlyClients: { year: currentYear },
      monthlyOrders: { year: currentYear }
    };
    
    // Cargar todos los datos principales de una vez
    this.viewModel.loadData();
    
    // Preparar datos para los gráficos mensuales si estamos en el navegador
    if (this.isBrowser) {
      // Inicializar los gráficos con datos de este año
      this.loadMonthlyData(currentYear);
    }
  }
  
  /**
   * Carga los datos mensuales tanto para nuevos clientes como para pedidos
   * @param year Año para el cual cargar los datos
   */
  private loadMonthlyData(year: string): void {
    if (!this.isBrowser) return;
    
    // Inicializar arrays con ceros
    this.monthlyNewClientsData = Array(12).fill(0);
    this.monthlyOrdersData = Array(12).fill(0);
    
    // Actualizar los gráficos con el estado de carga
    this.updateMonthlyClientsChartOption();
    this.updateMonthlyOrdersChartOption();
    
    // Usamos forkJoin para hacer todas las peticiones en paralelo
    import('rxjs').then(({ forkJoin, of }) => {
      // Creamos dos arrays con las 12 peticiones cada uno (una por mes)
      const clientRequests = this.createMonthlyRequests<number>(
        year,
        (y, m) => this.getNewClientsByYearMonthUseCase.execute(y, m),
        'nuevos clientes'
      );
      
      const orderRequests = this.createMonthlyRequests<number>(
        year,
        (y, m) => this.getTotalOrdersByYearMonthUseCase.execute(y, m),
        'pedidos'
      );
      
      // Ejecutamos ambos grupos de peticiones en paralelo
      forkJoin({
        clients: forkJoin(clientRequests),
        orders: forkJoin(orderRequests)
      }).subscribe({
        next: (results) => {
          this.monthlyNewClientsData = results.clients;
          this.monthlyOrdersData = results.orders;
          
          // Actualizar ambos gráficos
          this.updateMonthlyClientsChartOption();
          this.updateMonthlyOrdersChartOption();
        },
        error: (err) => {
          console.error('Error al cargar los datos mensuales:', err);
          // Aseguramos que los gráficos se actualicen incluso en caso de error
          this.updateMonthlyClientsChartOption();
          this.updateMonthlyOrdersChartOption();
        }
      });
    });
  }
  
  /**
   * Crea un array de peticiones mensuales con manejo de errores
   * @param year Año para el cual crear las peticiones
   * @param requestFn Función que genera cada petición
   * @param entityName Nombre de la entidad para mensajes de error
   * @returns Array de 12 observables (uno por mes)
   */
  private createMonthlyRequests<T>(
    year: string, 
    requestFn: (year: string, month: string) => any,
    entityName: string
  ): any[] {
    return Array.from({length: 12}, (_, i) => {
      const monthString = (i + 1).toString();
      return requestFn(year, monthString).pipe(
        catchError(error => {
          console.error(`Error al cargar ${entityName} para ${year}/${monthString}:`, error);
          return of(0);
        })
      );
    });
  }

  // Método para manejar cambios en filtros de gráficos mensuales
  onMonthlyChartYearFilterChange(event: any): void {
    const year = event.value;
    this.filters.monthlyClients.year = year;
    this.filters.monthlyOrders.year = year; // Actualizamos ambos filtros a la vez
    this.loadMonthlyData(year);
  }
  
  // Método para manejar cambios en el filtro de año para el gráfico de pedidos mensuales
  onMonthlyOrdersChartYearFilterChange(event: any): void {
    const year = event.value;
    this.filters.monthlyOrders.year = year;
    this.loadMonthlyData(year);
  }
  
  // Cargar datos de nuevos clientes mensuales
  private loadMonthlyNewClients(year: string): void {
    if (!this.isBrowser) return;
    
    // Reiniciar el array con ceros
    this.monthlyNewClientsData = Array(12).fill(0);
    
    // Mostrar un estado de carga inicial
    this.updateMonthlyClientsChartOption();
    
    // Usamos forkJoin para hacer todas las peticiones en paralelo
    import('rxjs').then(({ forkJoin, of }) => {
      const requests = Array.from({length: 12}, (_, i) => {
        const monthString = (i + 1).toString();
        return this.getNewClientsByYearMonthUseCase.execute(year, monthString)
          .pipe(
            catchError(error => {
              console.error(`Error al cargar nuevos clientes para ${year}/${monthString}:`, error);
              return of(0);
            })
          );
      });
      
      forkJoin(requests).subscribe({
        next: (results) => {
          this.monthlyNewClientsData = results;
          this.updateMonthlyClientsChartOption();
        },
        error: (err) => {
          console.error('Error al cargar los datos de clientes mensuales:', err);
          this.updateMonthlyClientsChartOption();
        }
      });
    });
  }
  
  // Cargar datos de pedidos mensuales
  private loadMonthlyOrders(year: string): void {
    if (!this.isBrowser) return;
    
    // Reiniciar el array con ceros
    this.monthlyOrdersData = Array(12).fill(0);
    
    // Mostrar un estado de carga inicial
    this.updateMonthlyOrdersChartOption();
    
    // Usamos forkJoin para hacer todas las peticiones en paralelo y obtener los resultados de una vez
    import('rxjs').then(({ forkJoin, of }) => {
      // Creamos un array con las 12 peticiones (una por mes)
      const requests = Array.from({length: 12}, (_, i) => {
        const monthString = (i + 1).toString();
        // Capturamos errores individuales para que una petición fallida no haga fallar todo el conjunto
        return this.getTotalOrdersByYearMonthUseCase.execute(year, monthString)
          .pipe(
            catchError(error => {
              console.error(`Error al cargar pedidos para ${year}/${monthString}:`, error);
              // Devolvemos 0 en caso de error para ese mes
              return of(0);
            })
          );
      });
      
      // Ejecutamos todas las peticiones en paralelo
      forkJoin(requests).subscribe({
        next: (results) => {
          // Actualizamos el array de datos con los resultados
          this.monthlyOrdersData = results;
          // Actualizamos el gráfico con todos los datos completos
          this.updateMonthlyOrdersChartOption();
        },
        error: (err) => {
          // Este error solo ocurriría si hay un problema con forkJoin en sí
          console.error('Error al cargar los datos de pedidos mensuales:', err);
          // Aseguramos que el gráfico se actualice incluso en caso de error
          this.updateMonthlyOrdersChartOption();
        }
      });
    });
  }

  private updateChartOption(): void {
    if (!this.isBrowser) return; // No ejecutar esto en el servidor

    const distribution = this.viewModel.clientsPerProduct();

    if (!distribution || distribution.length === 0) {
      this.chartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },

      };
      return;
    }

    // Ordenar los datos por valor descendente para mejor visualización
    const sortedData = [...distribution].sort((a, b) => b.value - a.value);

    // Limitar a las top 5 categorías para mejor visualización
    const topCategories = sortedData.slice(0, 5);

    // Agregar "Otros" si hay más categorías
    if (sortedData.length > 5) {
      const otherCategories = sortedData.slice(5);
      const otherValue = otherCategories.reduce(
        (sum, item) => sum + item.value,
        0
      );

      if (otherValue > 0) {
        topCategories.push({
          name: 'Otros',
          value: otherValue,
        });
      }
    }

    this.chartOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} clientes ({d}%)',
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        borderColor: '#444',
        textStyle: {
          color: '#333',
        },
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        data: topCategories.map((item) => item.name),
        textStyle: {
         color: '#333',
        },
      },
      series: [
        {
          name: 'Clientes por Categoría',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,

          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold',
              color: '#333',


            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}',
            color: '#333',
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: '#666',
            },

          },
          data: topCategories,
        },
      ],
    };
  }

  private updateLocationsChartOption(): void {
    if (!this.isBrowser) return; // No ejecutar esto en el servidor

    const locations = this.viewModel.topLocationsByClients();
    const locationType = this.viewModel.currentLocationType();

    if (!locations || locations.length === 0) {
      this.locationsChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    // Ordenar los datos por valor descendente
    const sortedLocations = [...locations].sort(
      (a, b) => b.clientCount - a.clientCount
    );

    // Preparar datos para el gráfico de barras
    const locationLabels = sortedLocations.map((item) =>
      locationType === 'country' ? item.country : item.city
    );

    const locationValues = sortedLocations.map((item) => item.clientCount);

    // Configuración para gráfico de barras vertical
    this.locationsChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c} clientes',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        textStyle: {
          color: '#333',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%', // Ajustado para dar más espacio a las etiquetas del eje X
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: locationLabels,
        axisLabel: {
          color: '#333',
          rotate: 45, // Rotar etiquetas para mejor visibilidad
          interval: 0, // Mostrar todas las etiquetas
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Nº Clientes',
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          color: '#333',
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      series: [
        {
          name: 'Clientes',
          type: 'bar',
          data: locationValues,
          itemStyle: {
            color: '#d32f2f', // Cambiado de #5c6bc0 a rojo corporativo #d32f2f
            borderRadius: [4, 4, 0, 0], // Redondear las esquinas superiores de las barras
          },
          label: {
            show: true,
            position: 'top',
            valueAnimation: true,
            color: '#333',
            formatter: '{c}',
          },
        },
      ],
    };
  }

  // Actualiza el gráfico de barras de nuevos clientes por mes
  private updateMonthlyClientsChartOption(): void {
    if (!this.isBrowser) return; // No ejecutar esto en el servidor

    if (!this.monthlyNewClientsData || this.monthlyNewClientsData.length === 0) {
      this.monthlyClientsChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    // Configuración para el gráfico de barras de nuevos clientes por mes
    this.monthlyClientsChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c} nuevos clientes',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        textStyle: {
          color: '#333',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.months,
        axisLabel: {
          color: '#333',
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Nuevos Clientes',
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          color: '#333',
          formatter: '{value}' // Asegurar que se muestren valores sin decimales
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        minInterval: 1, // Forzar que el intervalo mínimo sea 1 (sin decimales)
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ddd'
          }
        }
      },
      series: [
        {
          name: 'Nuevos Clientes',
          type: 'bar',
          data: this.monthlyNewClientsData.map(value => Math.round(value)), // Redondear valores para garantizar enteros
          itemStyle: {
            color: '#E53935', // Color rojo que combina bien con el tema Material
            borderRadius: [4, 4, 0, 0], // Redondear las esquinas superiores de las barras
          },
          label: {
            show: true,
            position: 'top',
            valueAnimation: true,
            color: '#333',
            formatter: '{c}', // Mostrar el valor sin decimales
          },
        },
      ],
    };
  }

  // Actualiza el gráfico de barras de pedidos por mes
  private updateMonthlyOrdersChartOption(): void {
    if (!this.isBrowser) return; // No ejecutar esto en el servidor

    if (!this.monthlyOrdersData || this.monthlyOrdersData.length === 0) {
      this.monthlyOrdersChartOption = {
        title: {
          text: 'No hay datos disponibles',
          left: 'center',
          textStyle: {
            color: '#333',
          },
        },
      };
      return;
    }

    // Configuración para el gráfico de barras de pedidos por mes
    this.monthlyOrdersChartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c} pedidos',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        textStyle: {
          color: '#333',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.months,
        axisLabel: {
          color: '#333',
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Pedidos',
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          color: '#333',
          formatter: '{value}' // Asegurar que se muestren valores sin decimales
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
        minInterval: 1, // Forzar que el intervalo mínimo sea 1 (sin decimales)
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#ddd'
          }
        }
      },
      series: [
        {
          name: 'Pedidos',
          type: 'bar',
          data: this.monthlyOrdersData.map(value => Math.round(value)), // Redondear valores para garantizar enteros
          itemStyle: {
            color: '#E53935', // Color rojo que combina bien con el tema Material
            borderRadius: [4, 4, 0, 0], // Redondear las esquinas superiores de las barras
          },
          label: {
            show: true,
            position: 'top',
            valueAnimation: true,
            color: '#333',
            formatter: '{c}', // Mostrar el valor sin decimales
          },
        },
      ],
    };
  }

  // Método para manejar cambios en el selector de año (para filtros de un solo año)
  onYearFilterChange(event: any, type: FilterType): void {
    const year = event.value;
    this.filters[type].year = year;
    this.viewModel.updateDataByYearFilter(type, year);
  }
  
  // Método para manejar cambios en selectores de año-mes
  onYearMonthFilterChange(event: any, type: FilterType, fieldName: 'year' | 'month'): void {
    const value = event.value;
    if (this.filters[type] && this.filters[type].hasOwnProperty(fieldName)) {
      (this.filters[type] as any)[fieldName] = value;
      
      // Solo actualizamos los datos si tenemos tanto año como mes
      if (this.filters[type].year && this.filters[type].month) {
        this.viewModel.updateDataByYearAndMonthFilter(
          type, 
          this.filters[type].year, 
          this.filters[type].month || '1'
        );
      }
    }
  }
  
  // Método para manejar cambios en el tipo de ubicación (país/ciudad)
  onLocationTypeChange(event: any): void {
    const locationType = event.value as 'country' | 'city';
    this.viewModel.changeLocationType(locationType);
  }
}
