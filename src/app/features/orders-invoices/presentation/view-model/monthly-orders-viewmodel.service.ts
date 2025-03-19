import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of, takeUntil, tap } from 'rxjs';
import { OrdersDataRepository } from '../../data/data-repositories/orders-repository.service';
import { GetMonthlySalesUseCase } from '../../domain/use-cases/get-monthly-sales.use-cases';
import { GetMonthlySalesTotalsUseCase, MonthlySalesTotal } from '../../domain/use-cases/get-monthly-sales-totals.use-case';
import { MonthlySalesDataRepository } from '../../data/data-repositories/monthly-sales-repository.service';

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModelService implements OnDestroy {
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  private _monthlySales = new BehaviorSubject<number>(0);
  private _monthlySalesTotals = new BehaviorSubject<MonthlySalesTotal[]>([]);
  private destroy$ = new Subject<void>();

  public isLoading$: Observable<boolean> = this._isLoading.asObservable();
  public error$: Observable<string | null> = this._error.asObservable();
  public monthlySales$: Observable<number> = this._monthlySales.asObservable();
  public monthlySalesTotals$: Observable<MonthlySalesTotal[]> = this._monthlySalesTotals.asObservable();

  private getMonthlySalesUseCase: GetMonthlySalesUseCase;
  private getMonthlySalesTotalsUseCase: GetMonthlySalesTotalsUseCase;

  constructor(
    private ordersRepository: OrdersDataRepository,
    private monthlySalesRepository: MonthlySalesDataRepository
  ) {
    this.getMonthlySalesUseCase = new GetMonthlySalesUseCase(this.monthlySalesRepository);
    this.getMonthlySalesTotalsUseCase = new GetMonthlySalesTotalsUseCase(this.ordersRepository);
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

  public loadMonthlySalesTotals(year?: number): void {
    this._error.next(null);
    this._isLoading.next(true);

    this.getMonthlySalesTotalsUseCase.execute(year)
      .pipe(
        tap((totals: MonthlySalesTotal[]) => this._monthlySalesTotals.next(totals)),
        catchError(error => {
          this._error.next('Error al cargar los totales de ventas mensuales. Intente nuevamente.');
          return of([]);
        }),
        takeUntil(this.destroy$),
        finalize(() => {
          this._isLoading.next(false);
        })
      )
      .subscribe();
  }

  public refreshData(forceRefresh: boolean = false): void {
    const currentDate = new Date();
    this.loadMonthlySales(currentDate.getMonth(), currentDate.getFullYear());
    this.loadMonthlySalesTotals(currentDate.getFullYear());
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}