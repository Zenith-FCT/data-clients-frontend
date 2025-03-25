import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, tap } from 'rxjs';
import { ClientsList } from '../domain/clients-list.model';
import { GetClientsListUseCase } from '../domain/get-clients-list-use-case';
import { GetTotalClientsUseCase } from '../domain/get-total-clients-use-case';

interface ClientsState {
  clients: ClientsList[];
  totalClients: number;
  loading: boolean;
  error: string | null;
}

@Injectable()
export class ClientsViewModel {
  private _state = signal<ClientsState>({
    clients: [],
    totalClients: 0,
    loading: false,
    error: null,
  });

  readonly clients = computed(() => this._state().clients);
  readonly totalClients = computed(() => this._state().totalClients);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  private getClientsListUseCase = inject(GetClientsListUseCase);
  private getTotalClientsUseCase = inject(GetTotalClientsUseCase);

  loadData(): void {
    this.loadClients();
    this.loadTotalClients();
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
}
