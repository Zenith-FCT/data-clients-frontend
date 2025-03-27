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
  | 'ltv';

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
  isBrowser: boolean;

  // Filtros actuales con tipos correctos
  filters: Record<FilterType, FilterConfig> = {
    clients: { year: 'all' },
    newClients: { year: '2023', month: '3' },
    orders: { year: 'all' },
    totalOrders: { year: '2023', month: '3' },
    ticket: { year: 'all' },
    ltv: { year: '2023', month: '3' },
  };

  public viewModel = inject(ClientsViewModel);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    effect(() => {
      this.dataSource.data = this.viewModel.clients();
      if (this.isBrowser) {
        this.updateChartOption();
        this.updateLocationsChartOption();
      }
    });
  }

  ngOnInit(): void {
    this.viewModel.loadData();

    // Inicializar los valores predeterminados con la fecha actual
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();

    this.filters.newClients.year = currentYear;
    this.filters.newClients.month = currentMonth;
    this.filters.totalOrders.year = currentYear;
    this.filters.totalOrders.month = currentMonth;
    this.filters.ltv.year = currentYear;
    this.filters.ltv.month = currentMonth;

    // Cargar datos iniciales
    this.applyAllFilters();
  }

  // Método para filtrar por año (columnas izquierda)
  onYearFilterChange(event: any, type: FilterType): void {
    // Para Material, el evento es diferente
    const selectedValue = event.value;
    this.filters[type].year = selectedValue;

    console.log(
      `Filtro de ${type} por año cambiado a:`,
      this.filters[type].year
    );
    this.applyFilter(type);
  }

  // Método para filtrar por año y mes (columnas derecha)
  onYearMonthFilterChange(
    event: any,
    type: FilterType,
    filterType: 'year' | 'month'
  ): void {
    // Para Material, el evento es diferente
    const selectedValue = event.value;
    this.filters[type][filterType] = selectedValue;

    console.log(
      `Filtro de ${type} por ${filterType} cambiado a:`,
      this.filters[type][filterType]
    );
    this.applyFilter(type);
  }

  // Método para cambiar entre países y ciudades
  onLocationTypeChange(event: any): void {
    const newLocationType = event.value as 'country' | 'city';
    console.log('Cambiando tipo de ubicación a:', newLocationType);
    this.viewModel.changeLocationType(newLocationType);
  }

  // Aplicar un filtro específico
  private applyFilter(type: FilterType): void {
    switch (type) {
      case 'clients':
        // Filtrar clientes totales por año
        this.viewModel.updateDataByYearFilter(
          'clients',
          this.filters.clients.year
        );
        break;

      case 'newClients':
        // Filtrar nuevos clientes por año y mes
        if (this.filters.newClients.month) {
          this.viewModel.updateDataByYearAndMonthFilter(
            'newClients',
            this.filters.newClients.year,
            this.filters.newClients.month
          );
        }
        break;

      case 'orders':
        // Filtrar promedio de pedidos por año
        this.viewModel.updateDataByYearFilter(
          'orders',
          this.filters.orders.year
        );
        break;

      case 'totalOrders':
        // Filtrar pedidos totales por año y mes
        if (this.filters.totalOrders.month) {
          this.viewModel.updateDataByYearAndMonthFilter(
            'totalOrders',
            this.filters.totalOrders.year,
            this.filters.totalOrders.month
          );
        }
        break;

      case 'ticket':
        // Filtrar ticket medio por año
        this.viewModel.updateDataByYearFilter(
          'ticket',
          this.filters.ticket.year
        );
        break;

      case 'ltv':
        // Filtrar LTV por año y mes
        if (this.filters.ltv.month) {
          this.viewModel.updateDataByYearAndMonthFilter(
            'ltv',
            this.filters.ltv.year,
            this.filters.ltv.month
          );
        }
        break;
    }
  }

  // Aplicar todos los filtros
  private applyAllFilters(): void {
    // Aplicar filtros para cada tipo de datos
    Object.keys(this.filters).forEach((type) => {
      this.applyFilter(type as FilterType);
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
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
            color: '#5c6bc0',
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
}
