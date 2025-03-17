import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';

@Injectable({
  providedIn: 'root'
})
export class OrdersViewModelService implements OnDestroy {
  private getTotalAmountOrdersUseCase = inject(GetTotalAmountOrdersUseCase);
  
  // Estados observables
  private _totalOrdersAmount = new BehaviorSubject<number>(0);
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  // Controlador para cancelar suscripciones
  private destroy$ = new Subject<void>();

  // Exposing observables for the view
  public totalOrdersAmount$: Observable<number> = this._totalOrdersAmount.asObservable();
  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();

  constructor() {
  }

  public loadTotalOrdersAmount(): void {
    // Limpiar error previo
    this._error.next(null);
    // Establecer estado de carga
    this._isLoading.next(true);
    
    // Usar el caso de uso con RxJS para manejar asincronía
    this.getTotalAmountOrdersUseCase.execute()
      .pipe(
        tap(total => {
          // Actualizar el valor del total
          this._totalOrdersAmount.next(total);
        }),
        catchError(error => {
          // Manejar error específicamente en el ViewModel
          this._error.next('Error al cargar el total de pedidos. Intente nuevamente.');
          return of(0); // Retornar un valor por defecto para continuar el flujo
        }),
        finalize(() => {
          // Siempre marcar como no cargando al finaliza
          this._isLoading.next(false);
        }),
        takeUntil(this.destroy$) // Cancelar suscripción cuando el componente se destruye
      )
      .subscribe();
  }

  public refreshData(forceRefresh: boolean = false): void {
    this.loadTotalOrdersAmount();
  }

  // Limpia recursos al destruir el servicio
  
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
