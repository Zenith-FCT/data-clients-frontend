import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, tap } from 'rxjs';
import { Clients } from '../domain/clients.model';
import { GetAllClientsUseCase } from '../domain/get-all-clients-use-case';

interface ClientsState {
  clients: Clients[];
  loading: boolean;
  error: string | null;
}

@Injectable()
export class ClientsViewModel {
  private _state = signal<ClientsState>({
    clients: [],
    loading: false,
    error: null,
  });

  readonly clients = computed(() => this._state().clients);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  private getAllClientsUseCase = inject(GetAllClientsUseCase);

  loadClients(): void {
    this._state.update(state => ({
        ...state,
        clients: [],
        loading: true,
        error: null,
    }));
    
    this.getAllClientsUseCase
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
}
