import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, tap } from 'rxjs';
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';
import { GetTotalAverageOrdersUseCase } from '../domain/get-total-average-orders-use-case';

interface ClientsState {
  clients: ClientsList[];
  totalClients: number;
  totalAverageOrders: number;
  loading: boolean;
  error: string | null;
}

@Injectable()
export class ClientsViewModel {
  private _state = signal<ClientsState>({
    clients: [],
    totalClients: 0,
    totalAverageOrders: 0,
    loading: false,
    error: null,
  });

  readonly clients = computed(() => this._state().clients);
  readonly totalClients = computed(() => this._state().totalClients);
  readonly totalAverageOrders = computed(() => this._state().totalAverageOrders);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  private getClientsListUseCase = inject(GetClientsListUseCase);
  private getTotalClientsUseCase = inject(GetTotalClientsUseCase);
  private getTotalAverageOrdersUseCase = inject(GetTotalAverageOrdersUseCase);

  loadData(): void {
    this.loadClients();
    this.loadTotalClients();
    this.loadTotalAverageOrders();
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
}
