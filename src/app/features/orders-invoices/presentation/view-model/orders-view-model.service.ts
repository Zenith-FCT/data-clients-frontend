import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';
import { GetTotalOrdersUseCase } from '../../domain/use-cases/get-total-orders.use-case';

@Injectable({
  providedIn: 'root'
})
export class OrdersViewModelService implements OnDestroy {
  private getTotalAmountOrdersUseCase = inject(GetTotalAmountOrdersUseCase);
  private getTotalOrdersUseCase = inject(GetTotalOrdersUseCase);
  
  private _totalOrdersAmount = new BehaviorSubject<number>(0);
  private _totalOrders = new BehaviorSubject<number>(0);
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  private destroy$ = new Subject<void>();

  public totalOrdersAmount$: Observable<number> = this._totalOrdersAmount.asObservable();
  public totalOrders$: Observable<number> = this._totalOrders.asObservable();
  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();

  constructor() {
  }

  public loadTotalOrdersAmount(): void {
    this._error.next(null);
    this._isLoading.next(true);
    
    this.getTotalAmountOrdersUseCase.execute()
      .pipe(
        tap(total => {
          this._totalOrdersAmount.next(total);
        }),
        catchError(error => {
          this._error.next('Error al cargar el total de pedidos. Intente nuevamente.');
          return of(0); 
        }),
        finalize(() => {
          
          this._isLoading.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public loadTotalOrders(): void {
    this._error.next(null);
    this._isLoading.next(true);

    this.getTotalOrdersUseCase.execute()
      .pipe(
        tap(total => {
          this._totalOrders.next(total);
        }),
        catchError(error => {
          this._error.next('Error al cargar el total de pedidos. Intente nuevamente.');
          return of(0);
        }),
        finalize(() => {
          this._isLoading.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

  }

  public refreshData(forceRefresh: boolean = false): void {
    this.loadTotalOrdersAmount();
    this.loadTotalOrders();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
