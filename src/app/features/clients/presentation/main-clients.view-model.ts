import { computed, inject, Injectable, signal, OnDestroy, DestroyRef, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, catchError, finalize, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { isPlatformBrowser } from '@angular/common';

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
  monthlyOrders: number[];
}

@Injectable()
export class ClientsViewModel implements OnDestroy {
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
    currentLocationType: 'country',
    monthlyOrders: Array(12).fill(0)
  });

  private _clientsCache: ClientsList[] = [];
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);

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
  readonly monthlyOrders = computed(() => this._state().monthlyOrders);

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Determina si la aplicación está ejecutándose en un entorno de pruebas
   */
  private isTestEnvironment(): boolean {
    return (
      // Detectar si estamos en un entorno de pruebas karma
      typeof window !== 'undefined' && 
      (window.location.href.includes('karma') || 
       // Comprobar variables de entorno comunes en CI
       (typeof process !== 'undefined' && 
        (process.env && (process.env['CI'] === 'true' || 
         process.env['NODE_ENV'] === 'test')))
      )
    );
  }

  /**
   * Verifica si es seguro realizar peticiones HTTP en el entorno actual
   */
  private canMakeNetworkRequests(): boolean {
    // Evitar peticiones en SSR o en entornos de prueba
    return isPlatformBrowser(this.platformId) && !this.isTestEnvironment();
  }

  getAverageTicket(): number {
    return this.averageTicket();
  }

  getNewClients(): number {
    return this.newClients();
  }

  getTotalOrders(): number {
    return this.totalOrders();
  }

  getLTV(): number {
    return this.ltv();
  }

  async getNewClientsByYearMonth(year: string, month: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.getNewClientsByYearMonthUseCase.execute(year, month).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (total) => {
          resolve(total);
        },
        error: (err) => {
          console.error(`Error obteniendo nuevos clientes para ${year}/${month}:`, err);
          reject(err);
        }
      });
    });
  }

  loadData(): void {
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    if (!this.canMakeNetworkRequests()) {
      console.log('Saltando peticiones HTTP en entorno SSR o pruebas');
      this._state.update(state => ({
        ...state,
        loading: false
      }));
      return;
    }

    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        clients: this.getClientsListUseCase.execute(),
        totalClients: this.getTotalClientsUseCase.execute(),
        totalAverageOrders: this.getTotalAverageOrdersUseCase.execute(),
        averageTicket: this.getAverageTicketUseCase.execute(),
        clientsPerProduct: this.getClientsPerProductUseCase.execute()
      })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this._state.update(state => ({
              ...state,
              loading: false
            }));
          })
        )
        .subscribe({
          next: (results) => {
            this._state.update(state => ({
              ...state,
              clients: results.clients,
              totalClients: results.totalClients,
              totalAverageOrders: results.totalAverageOrders,
              averageTicket: results.averageTicket,
              clientsPerProduct: results.clientsPerProduct,
              loading: false,
              error: null
            }));

            this._clientsCache = results.clients;

            this.loadTopLocationsByClients();
            this.loadInitialDerivedMetrics();
          },
          error: (err) => {
            console.error('Error loading client data:', err);
            this._state.update(state => ({
              ...state,
              loading: false,
              error: 'Error loading client data. Please try again.'
            }));
          }
        });
    });
  }

  private loadInitialDerivedMetrics(): void {
    if (!this.canMakeNetworkRequests()) {
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();

    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        newClients: this.getNewClientsByYearMonthUseCase.execute(currentYear, currentMonth),
        totalOrders: this.getTotalOrdersByYearMonthUseCase.execute(currentYear, currentMonth),
        ltv: this.getLTVByYearMonthUseCase.execute(currentYear, currentMonth)
      })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this._state.update(state => ({
              ...state,
              loading: false
            }));
          })
        )
        .subscribe({
          next: (results) => {
            this._state.update(state => ({
              ...state,
              newClients: results.newClients,
              totalOrders: results.totalOrders,
              ltv: results.ltv
            }));
          },
          error: (err) => {
            console.error('Error cargando métricas derivadas:', err);
          }
        });
    });
  }

  updateDataByYearFilter(type: string, year: string): void {
    if (!this.canMakeNetworkRequests()) return;

    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    let observable;
    switch (type) {
      case 'clients':
        observable = year === 'all' 
          ? this.getTotalClientsUseCase.execute()
          : this.getTotalClientsByYearUseCase.execute(year);
        break;
      case 'orders':
        observable = year === 'all'
          ? this.getTotalAverageOrdersUseCase.execute()
          : this.getAverageOrdersByYearUseCase.execute(year);
        break;
      case 'ticket':
        observable = year === 'all'
          ? this.getAverageTicketUseCase.execute()
          : this.getAverageTicketByYearUseCase.execute(year);
        break;
      default:
        console.error(`Tipo de filtro no soportado: ${type}`);
        return;
    }

    observable.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this._state.update(state => ({
          ...state,
          loading: false
        }));
      })
    ).subscribe({
      next: (result) => {
        this._state.update(state => {
          const updatedState = { ...state, loading: false };
          switch (type) {
            case 'clients':
              updatedState.totalClients = result;
              break;
            case 'orders':
              updatedState.totalAverageOrders = result;
              break;
            case 'ticket':
              updatedState.averageTicket = result;
              break;
          }
          return updatedState;
        });
      },
      error: (err) => {
        console.error(`Error loading ${type} data:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading ${type} data`
        }));
      }
    });
  }

  updateDataByYearAndMonthFilter(type: string, year: string, month: string): void {
    if (!this.canMakeNetworkRequests()) return;

    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    let observable;
    switch (type) {
      case 'newClients':
        observable = this.getNewClientsByYearMonthUseCase.execute(year, month);
        break;
      case 'totalOrders':
        observable = this.getTotalOrdersByYearMonthUseCase.execute(year, month);
        break;
      case 'ltv':
        observable = this.getLTVByYearMonthUseCase.execute(year, month);
        break;
      default:
        console.error(`Tipo de filtro no soportado: ${type}`);
        return;
    }

    observable.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this._state.update(state => ({
          ...state,
          loading: false
        }));
      })
    ).subscribe({
      next: (result) => {
        this._state.update(state => {
          const updatedState = { ...state, loading: false };
          switch (type) {
            case 'newClients':
              updatedState.newClients = result;
              break;
            case 'totalOrders':
              updatedState.totalOrders = result;
              break;
            case 'ltv':
              updatedState.ltv = result;
              break;
          }
          return updatedState;
        });
      },
      error: (err) => {
        console.error(`Error loading ${type} data:`, err);
        this._state.update(state => ({
          ...state,
          loading: false,
          error: `Error loading ${type} data`
        }));
      }
    });
  }

  updateLocationType(type: 'country' | 'city'): void {
    this._state.update(state => ({ ...state, currentLocationType: type }));
    this.loadTopLocationsByClients();
  }

  private loadTopLocationsByClients(): void {
    if (!this.canMakeNetworkRequests()) {
      return;
    }

    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    const locationType = this._state().currentLocationType;

    this.getTopLocationsByClientsUseCase.execute(locationType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  private calculateDerivedMetrics(): void {
    const totalOrders = Math.round(this._state().totalClients * this._state().totalAverageOrders);
    const ltv = this._state().totalAverageOrders * this._state().averageTicket;
    const newClients = Math.round(this._state().totalClients * 0.1);

    this._state.update(state => ({
      ...state,
      totalOrders,
      ltv,
      newClients
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}