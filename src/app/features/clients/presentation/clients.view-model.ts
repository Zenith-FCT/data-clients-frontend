import { computed, inject, Injectable, signal, OnDestroy, DestroyRef } from '@angular/core';
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
  monthlyOrders: number[]; // Añadimos la propiedad para almacenar los pedidos mensuales
}

@Injectable()
export class ClientsViewModel implements OnDestroy {
  private _state = signal<ClientsState>( {
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
    monthlyOrders: Array(12).fill(0) // Inicializamos con un array de 12 ceros
  });

  private _clientsCache: ClientsList[] = [];
  private destroy$ = new Subject<void>();
  
  // Inyectamos DestroyRef para usar el nuevo enfoque
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
  readonly monthlyOrders = computed(() => this._state().monthlyOrders); // Añadimos el computed para acceder a los pedidos mensuales

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

  getNewClients(): number {
    return this.newClients();
  }

  getTotalOrders(): number {
    return this.totalOrders();
  }

  getLTV(): number {
    return this.ltv();
  }
  
  // Método para obtener nuevos clientes por año y mes para el gráfico
  async getNewClientsByYearMonth(year: string, month: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.getNewClientsByYearMonthUseCase.execute(year, month).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (total) => {
          resolve(total);
        },
        error: (err) => {
          console.error(`Error obteniendo nuevos clientes para ${year}/${month}:`, err);
          reject(err); // Propagamos el error en lugar de generar datos aleatorios
        }
      });
    });
  }

  loadData(): void {
    // Actualizamos el estado una sola vez para indicar que estamos cargando
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));

    // Utilizamos forkJoin para ejecutar varias peticiones en paralelo
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
          // Aseguramos que el estado de carga se resetee incluso en caso de error
          this._state.update(state => ({
            ...state,
            loading: false
          }));
        })
      )
      .subscribe({
        next: (results) => {
          // Actualizamos el estado una sola vez con todos los resultados
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

          // Guardamos en caché los clientes para uso futuro
          this._clientsCache = results.clients;
          
          // Cargamos datos dependientes
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
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear().toString();
    const currentMonth = (currentDate.getMonth() + 1).toString();
    
    // Realizamos todas las peticiones en paralelo usando forkJoin
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
          // Actualizamos el estado una sola vez con todos los resultados
          this._state.update(state => ({
            ...state,
            newClients: results.newClients,
            totalOrders: results.totalOrders,
            ltv: results.ltv
          }));
        },
        error: (err) => {
          console.error('Error cargando métricas derivadas:', err);
          // No mostramos el error al usuario ya que esto es una carga secundaria
        }
      });
    });
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
    // Indicamos que estamos cargando datos
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));
    
    // Importamos forkJoin de rxjs para ejecutar peticiones en paralelo
    import('rxjs').then(({ forkJoin, of }) => {
      // Si solo queremos cargar un tipo de datos específico
      if (type === 'clients' || type === 'orders' || type === 'ticket') {
        // Ejecutamos la llamada individual según el tipo solicitado
        let observable;
        
        switch (type) {
          case 'clients':
            observable = this.getTotalClientsByYearUseCase.execute(year);
            break;
          case 'orders':
            observable = this.getAverageOrdersByYearUseCase.execute(year);
            break;
          case 'ticket':
            observable = this.getAverageTicketByYearUseCase.execute(year);
            break;
        }
        
        observable.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (result) => {
            // Actualizamos solo el campo correspondiente al tipo
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
            
            // Calculamos métricas derivadas después de la actualización
            this.calculateDerivedMetrics();
          },
          error: (err) => {
            console.error(`Error loading ${type} data for year ${year}:`, err);
            this._state.update(state => ({
              ...state,
              loading: false,
              error: `Error loading ${type} data for year ${year}`
            }));
          }
        });
      }
    });
  }
  
  private applyYearMonthFilter(type: string, year: string, month: string): void {
    // Indicamos que estamos cargando datos
    this._state.update(state => ({
      ...state,
      loading: true,
      error: null
    }));
    
    // Importamos forkJoin de rxjs para ejecutar peticiones en paralelo
    import('rxjs').then(({ forkJoin }) => {
      // Si solo queremos cargar un tipo de datos específico
      if (type === 'newClients' || type === 'totalOrders' || type === 'ltv') {
        // Ejecutamos la llamada individual según el tipo solicitado
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
        }
        
        observable.pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (result) => {
            // Actualizamos solo el campo correspondiente al tipo
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
            console.error(`Error loading ${type} data for ${year}/${month}:`, err);
            this._state.update(state => ({
              ...state,
              loading: false,
              error: `Error loading ${type} data for ${year}/${month}`
            }));
          }
        });
      }
    });
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
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    this.getTotalClientsUseCase.execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getTotalAverageOrdersUseCase.execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getAverageTicketUseCase.execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getClientsPerProductUseCase.execute()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getTotalClientsByYearUseCase.execute(year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getNewClientsByYearMonthUseCase.execute(year, month)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getAverageOrdersByYearUseCase.execute(year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getTotalOrdersByYearMonthUseCase.execute(year, month)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getAverageTicketByYearUseCase.execute(year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.getLTVByYearMonthUseCase.execute(year, month)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}