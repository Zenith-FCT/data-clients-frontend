import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';
import { OrdersDataRepository } from '../../data/data-repositories/orders-repository.service';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModelService implements OnDestroy {
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  private _monthlySales = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();
  public monthlySales$: Observable<number> = this._monthlySales.asObservable();

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;

  constructor(
    private ordersRepository: OrdersDataRepository,
    private monthlySalesRepository: MonthlySalesDataRepository
  ) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
  }

  public loadMonthlySales(year: number, month: number): void {
    this._error.next(null);
    this._isLoading.next(true);


    this.getMonthlySalesUseCase.execute(year, month).pipe(
      tap((total: number) => {
        this._monthlySales.next(total);
      }),
      catchError(error => {
        this._error.next('Error al cargar las ventas mensuales. Intente nuevamente.');
        return of(0);
      }),
      takeUntil(this.destroy$),
      finalize(() => {
        this._isLoading.next(false);
      })
    ).subscribe();
  }


  public refreshData(forceRefresh: boolean = false): void {
    const currentDate = new Date();
    this.loadMonthlySales(currentDate.getMonth(), currentDate.getFullYear());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}