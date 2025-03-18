import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { GetTotalAmountOrdersUseCase } from '../../domain/use-cases/get-total-amount-orders.use-case';
import { GetTotalOrdersUseCase } from '../../domain/use-cases/get-total-orders.use-case';
import { OrdersRepository } from '../../domain/repositories/orders-repository';
import { OrdersDataRepository } from '../../data/data-repositories/orders-repository.service';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';

@Injectable({
  providedIn: 'root'
})
export class OrdersViewModelService implements OnDestroy {
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  private _totalOrdersAmount = new BehaviorSubject<number>(0);
  private _totalOrders = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();
  public totalOrdersAmount$: Observable<number> = this._totalOrdersAmount.asObservable();
  public totalOrders$: Observable<number> = this._totalOrders.asObservable();

  private getTotalAmountOrdersUseCase: GetTotalAmountOrdersUseCase;
  private getTotalOrdersUseCase: GetTotalOrdersUseCase;
  private getMonthlySalesUseCase: GetMonthlySalesUseCase;

  constructor(
    private ordersRepository: OrdersDataRepository
  ) {
    this.getTotalAmountOrdersUseCase = new GetTotalAmountOrdersUseCase(this.ordersRepository);
    this.getTotalOrdersUseCase = new GetTotalOrdersUseCase(this.ordersRepository);
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.ordersRepository);
  }

  public loadTotalOrdersAmount(): void {
    this._error.next(null);
    this._isLoading.next(true);
    
    this.getTotalAmountOrdersUseCase.execute()
      .pipe(
        catchError(error => {
          this._error.next('Error al cargar el total de pedidos. Intente nuevamente.');
          return of(0);
        }),
        finalize(() => {
          this._isLoading.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(amount => this._totalOrdersAmount.next(amount));
  }

  public loadTotalOrders(): void {
    this._error.next(null);
    this._isLoading.next(true);

    this.getTotalOrdersUseCase.execute()
      .pipe(
        catchError(error => {
          this._error.next('Error al cargar el total de pedidos. Intente nuevamente.');
          return of(0);
        }),
        finalize(() => {
          this._isLoading.next(false);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(total => this._totalOrders.next(total));
  }

  loadMonthlySales(month: number): Observable<number> {
    this._error.next(null);
    this._isLoading.next(true);

    return this.getMonthlySalesUseCase.execute(month).pipe(
      catchError(error => {
        this._error.next('Error al cargar las ventas mensuales. Intente nuevamente.');
        return of(0);
      }),
      finalize(() => {
        this._isLoading.next(false);
      }),
      takeUntil(this.destroy$)
    );
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
