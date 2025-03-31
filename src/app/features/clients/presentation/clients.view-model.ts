import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, tap } from 'rxjs';
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from '../domain/get-total-average-orders-use-case';
import { GetAverageTicketUseCase } from '../domain/get-average-ticket-use-case';
import { GetClientsPerProductUseCase } from '../domain/get-clients-per-product-use-case';
import { ProductClientDistribution } from '../domain/product-distribution.model';

import { GetTotalClientsByYearUseCase } from '../domain/get-total-clients-by-year-use-case';
import { GetNewClientsByYearMonthUseCase } from '../domain/get-new-clients-by-year-month-use-case';
import { GetAverageOrdersByYearUseCase } from '../domain/get-average-orders-by-year-use-case';
import { GetTotalOrdersByYearMonthUseCase } from '../domain/get-total-orders-by-year-month-use-case';
import { GetAverageTicketByYearUseCase } from '../domain/get-average-ticket-by-year-use-case';
import { GetLTVByYearMonthUseCase } from '../domain/get-ltv-by-year-month-use-case';
import { GetTopLocationsByClientsUseCase } from '../domain/get-top-locations-by-clients-use-case';
import { TopLocationsByClients } from '../domain/top-locations-by-clients.model';


interface ClientsState {
  clients: ClientsList[];
  totalClients: number;
  totalAverageOrders: number;
  averageTicket: number;
  clientsPerProduct: ProductClientDistribution[];
  loading: boolean;
  error: string | null;
  newClients: number;
  totalOrders: number;
  ltv: number;
  topLocationsByClients: TopLocationsByClients[];
  currentLocationType: 'country' | 'city';

}

@Injectable()
export class ClientsViewModel {
  private _state = signal<ClientsState>({
    clients: [],
    totalClients: 0,
    totalAverageOrders: 0,
    averageTicket: 0,
    clientsPerProduct: [],
    loading: false,
    error: null,
    newClients: 0,
    totalOrders: 0,
    ltv: 0,
    topLocationsByClients: [],
    currentLocationType: 'country'

  });

  readonly clients = computed(() => this._state().clients);
  readonly totalClients = computed(() => this._state().totalClients);
  readonly totalAverageOrders = computed(() => this._state().totalAverageOrders);
  readonly averageTicket = computed(() => this._state().averageTicket);
  readonly clientsPerProduct = computed(() => this._state().clientsPerProduct);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly newClients = computed(() => this._state().newClients);
  readonly totalOrders = computed(() => this._state().totalOrders);
  readonly ltv = computed(() => this._state().ltv);
  readonly topLocationsByClients = computed(() => this._state().topLocationsByClients);
  readonly currentLocationType = computed(() => this._state().currentLocationType);


  private getClientsListUseCase = inject(GetClientsListUseCase);
  private getTotalClientsUseCase = inject(GetTotalClientsUseCase);
  private getTotalAverageOrdersUseCase = inject(GetTotalAverageOrdersUseCase);
  private getAverageTicketUseCase = inject(GetAverageTicketUseCase);
  private getClientsPerProductUseCase = inject(GetClientsPerProductUseCase);
  private getTotalClientsByYearUseCase = inject(GetTotalClientsByYearUseCase);
  private getNewClientsByYearMonthUseCase = inject(GetNewClientsByYearMonthUseCase);
  private getAverageOrdersByYearUseCase = inject(GetAverageOrdersByYearUseCase);
  private getTotalOrdersByYearMonthUseCase = inject(GetTotalOrdersByYearMonthUseCase);
  private getAverageTicketByYearUseCase = inject(GetAverageTicketByYearUseCase);
  private getLTVByYearMonthUseCase = inject(GetLTVByYearMonthUseCase);
  private getTopLocationsByClientsUseCase = inject(GetTopLocationsByClientsUseCase);


  getAverageTicket(): number {
    return this.averageTicket();
  }

  loadData(): void {
    this.loadClients();
    this.loadTotalClients();
    this.loadTotalAverageOrders();
    this.loadAverageTicket();
    this.loadClientsPerProduct();
    this.loadTopLocationsByClients();
    this.loadInitialDerivedMetrics();
  }

  private loadInitialDerivedMetrics(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    
    this.loadNewClientsByYearMonth(currentYear, currentMonth);
    this.loadTotalOrdersByYearMonth(currentYear, currentMonth);
    this.loadLTVByYearMonth(currentYear, currentMonth);
  }

  updateDataByYearFilter(type: string, year: string): void {
    console.log(`Aplicando filtro por año ${year} para ${type}`);
    
    if (year === 'all') {
      if (type === 'clients') this.loadTotalClients();
      else if (type === 'orders') this.loadTotalAverageOrders();
      else if (type === 'ticket') this.loadAverageTicket();
      
      this.calculateDerivedMetrics();
      return;
    }
    
    if (this._clientsCache.length === 0) {
      this._state.update(state => ({
        ...state,
        loading: true
      }));
      
      this.getClientsListUseCase.execute().subscribe({
        next: (clients) => {
          this._clientsCache = clients;
          this.applyYearFilter(type, year);
        },
        error: (err) => {
          console.error('Error al cargar datos para filtrado:', err);
          this._state.update(state => ({
            ...state,
            loading: false,
            error: 'Error al aplicar filtros'
          }));
        }
      });
    } else {
      this.applyYearFilter(type, year);
    }
  }
  
  updateDataByYearAndMonthFilter(type: string, year: string, month: string): void {
    console.log(`Aplicando filtro por año ${year} y mes ${month} para ${type}`);
    
    if (this._clientsCache.length === 0) {
      this._state.update(state => ({
        ...state,
        loading: true
      }));
      
      this.getClientsListUseCase.execute().subscribe({
        next: (clients) => {
          this._clientsCache = clients;
          this.applyYearMonthFilter(type, year, month);
        },
        error: (err) => {
          console.error('Error al cargar datos para filtrado:', err);
          this._state.update(state => ({
            ...state,
            loading: false,
            error: 'Error al aplicar filtros'
          }));
        }
      });
    } else {
      this.applyYearMonthFilter(type, year, month);
    }
  }
  
  private applyYearFilter(type: string, year: string): void {
    const yearInt = parseInt(year);
    
    switch (type) {
      case 'clients':
        this.loadTotalClientsByYear(year);
        break;
        
      case 'orders':
        this.loadAverageOrdersByYear(year);
        break;
        
      case 'ticket':
        this.loadAverageTicketByYear(year);
        break;
    }
    
    this.calculateDerivedMetrics();
  }
  
  private applyYearMonthFilter(type: string, year: string, month: string): void {
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);
    
    switch (type) {
      case 'newClients':
        this.loadNewClientsByYearMonth(year, month);
        break;
        
      case 'totalOrders':
        this.loadTotalOrdersByYearMonth(year, month);
        break;
        
      case 'ltv':
        this.loadLTVByYearMonth(year, month);
        break;
    }
  }
  
  private getSeasonalFactor(month: number): number {
    const seasonalFactors = [
      0.8,
      0.7,
      1.1,
      1.2,
      1.0,
      1.0,
      1.3,
      1.3,
      0.9,
      1.0,
      1.1,
      1.5
    ];
    
    return seasonalFactors[month - 1];

  }

  loadClients(): void {
    this._state.update(state => ({
        ...state,
        clients: [],
        loading: true,
        error: null,
    }));
    
    this.getClientsListUseCase
      .execute()
      .subscribe({
        next: (clients) => {
            this._state.update(state => ({
                ...state,
                clients: clients,
                loading: false,
            })); 
        },
        error: (err) => {
            console.error('Error loading clients:', err);
            this._state.update(state => ({
                ...state,
                loading: false,
                error: 'Error loading clients',
            }));
        }
      });
  }

  private loadTotalClients(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getTotalClientsUseCase.execute().subscribe({
      next: (total) => {
        this._state.update(state => ({
          ...state,
          totalClients: total,
          loading: false
        }));
      },
      error: (err) => {
        this._state.update(state => ({
          ...state,
          loading: false,
          error: 'Error loading total clients'
        }));
      }
    });
  }

  private loadTotalAverageOrders(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getTotalAverageOrdersUseCase.execute().subscribe({
      next: (average) => {
        this._state.update(state => ({
          ...state,
          totalAverageOrders: average,
          loading: false
        }));
      },
      error: (err) => {
        this._state.update(state => ({
          ...state,
          loading: false,
          error: 'Error loading average orders'
        }));
      }
    });
  }

  private loadAverageTicket(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getAverageTicketUseCase.execute().subscribe({
      next: (average) => {
        this._state.update(state => ({
          ...state,
          averageTicket: average,
          loading: false
        }));
      },
      error: (err) => {
        this._state.update(state => ({
          ...state,
          loading: false,
          error: 'Error loading average ticket'
        }));
      }
    });
  }

  private loadClientsPerProduct(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getClientsPerProductUseCase.execute().subscribe({
      next: (distribution: ProductClientDistribution[]) => {
        this._state.update(state => ({
          ...state,
          clientsPerProduct: distribution,
          loading: false
        }));
      },
      error: (err: Error) => {
        console.error('Error loading clients per product:', err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: 'Error loading clients per product distribution'
        }));
      }
    });
  }

  private loadTotalClientsByYear(year: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getTotalClientsByYearUseCase.execute(year).subscribe({
      next: (total) => {
        this._state.update(state => ({
          ...state,
          totalClients: total,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading total clients for year ${year}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading total clients for year ${year}`
        }));
      }
    });
  }
  
  private loadNewClientsByYearMonth(year: string, month: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getNewClientsByYearMonthUseCase.execute(year, month).subscribe({
      next: (total) => {
        this._state.update(state => ({
          ...state,
          newClients: total,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading new clients for ${year}/${month}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading new clients for ${year}/${month}`
        }));
      }
    });
  }
  
  private loadAverageOrdersByYear(year: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getAverageOrdersByYearUseCase.execute(year).subscribe({
      next: (average) => {
        this._state.update(state => ({
          ...state,
          totalAverageOrders: average,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading average orders for year ${year}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading average orders for year ${year}`
        }));
      }
    });
  }
  
  private loadTotalOrdersByYearMonth(year: string, month: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getTotalOrdersByYearMonthUseCase.execute(year, month).subscribe({
      next: (total) => {
        this._state.update(state => ({
          ...state,
          totalOrders: total,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading total orders for ${year}/${month}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading total orders for ${year}/${month}`
        }));
      }
    });
  }
  
  private loadAverageTicketByYear(year: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getAverageTicketByYearUseCase.execute(year).subscribe({
      next: (average) => {
        this._state.update(state => ({
          ...state,
          averageTicket: average,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading average ticket for year ${year}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading average ticket for year ${year}`
        }));
      }
    });
  }
  
  private loadLTVByYearMonth(year: string, month: string): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    this.getLTVByYearMonthUseCase.execute(year, month).subscribe({
      next: (ltv) => {
        this._state.update(state => ({
          ...state,
          ltv: ltv,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading LTV for ${year}/${month}:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading LTV for ${year}/${month}`
        }));
      }
    });
  }

  changeLocationType(locationType: 'country' | 'city'): void {
    if (this._state().currentLocationType !== locationType) {
      this._state.update(state => ({
        ...state,
        currentLocationType: locationType
      }));
      this.loadTopLocationsByClients();
    }
  }

  private loadTopLocationsByClients(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    const locationType = this._state().currentLocationType;
    
    this.getTopLocationsByClientsUseCase.execute(locationType).subscribe({
      next: (locations) => {
        this._state.update(state => ({
          ...state,
          topLocationsByClients: locations,
          loading: false
        }));
      },
      error: (err) => {
        console.error(`Error loading top ${locationType} locations:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading top ${locationType} locations`
        }));
      }
    });
  }

  // Calcular métricas derivadas a partir de los datos base
  private calculateDerivedMetrics(): void {
    // Total de pedidos = totalClients * totalAverageOrders
    const totalOrders = Math.round(this._state().totalClients * this._state().totalAverageOrders);
    
    // LTV (Lifetime Value) = totalAverageOrders * averageTicket
    const ltv = this._state().totalAverageOrders * this._state().averageTicket;
    
    // Estimación de nuevos clientes (usaremos 10% de clientes totales como estimación)
    const newClients = Math.round(this._state().totalClients * 0.1);
    
    this._state.update(state => ({
      ...state,
      totalOrders,
      ltv,
      newClients
    }));
  }
}
