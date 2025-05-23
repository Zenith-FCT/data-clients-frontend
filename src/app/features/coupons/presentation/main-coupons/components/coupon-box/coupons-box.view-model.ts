import {Injectable,computed,signal} from "@angular/core";
import {CouponsDataRepository} from "../../../../data/couponsDataRepository";
import {GetTotalCouponsByMonthUseCase} from '../../../../domain/useCases/getTotalCouponsByMonthUseCase';
import {GetTotalCouponsByYearUseCase} from "../../../../domain/useCases/getTotalCouponsByYearUseCase";
import {GetTotalCouponsUseCase} from "../../../../domain/useCases/getTotalCouponsUseCase";
import {GetTotalDiscountByMonthUseCase} from "../../../../domain/useCases/getTotalDiscountByMonthUseCase";
import {GetTotalDiscountByYearUseCase} from "../../../../domain/useCases/getTotalDiscountByYearUseCase";
import {GetTotalDiscountCouponsUseCase} from "../../../../domain/useCases/getTotalDiscountCouponsUseCase";


export interface TotalUIState {
  isLoading: boolean;
  error: string | null;
  total: number;
}

export interface TotalDateUIState {
  year: string;
  month: string;
  totalYears: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BoxCouponsViewModel {

  private getTotalDiscountCouponsUseCase: GetTotalDiscountCouponsUseCase;
  private getTotalCouponsUseCase: GetTotalCouponsUseCase;
  private getTotalCouponsByMonthUseCase: GetTotalCouponsByMonthUseCase;
  private getTotalDiscountByMonthUseCase: GetTotalDiscountByMonthUseCase;
  private getTotalCouponsByYearUseCase: GetTotalCouponsByYearUseCase;
  private getTotalDiscountByYearUseCase: GetTotalDiscountByYearUseCase

  constructor(private couponsDataRepository: CouponsDataRepository) {
    this.getTotalDiscountCouponsUseCase = new GetTotalDiscountCouponsUseCase(this.couponsDataRepository);
    this.getTotalCouponsUseCase = new GetTotalCouponsUseCase(this.couponsDataRepository);
    this.getTotalCouponsByMonthUseCase = new GetTotalCouponsByMonthUseCase(this.couponsDataRepository);
    this.getTotalDiscountByMonthUseCase = new GetTotalDiscountByMonthUseCase(this.couponsDataRepository);
    this.getTotalCouponsByYearUseCase = new GetTotalCouponsByYearUseCase(this.couponsDataRepository);
    this.getTotalDiscountByYearUseCase = new GetTotalDiscountByYearUseCase(this.couponsDataRepository);
  }

  private uiStateDate = signal<TotalDateUIState>({
    year: "",
    month: "",
    totalYears: false
  });


  private uiStateTotalCoupons = signal<TotalUIState>({
    total: 0,
    isLoading: false,
    error: null
  });

  private uiStateTotalDiscount = signal<TotalUIState>({
    total: 0,
    isLoading: false,
    error: null
  });

  private uiStateCouponsByMonth = signal<TotalUIState>({
    total: 0,
    isLoading: false,
    error: null
  })

  private uiStateDiscountByMonth = signal<TotalUIState>({
    total: 0,
    isLoading: false,
    error: null
  })

  readonly year = computed(() => this.uiStateDate().year);
  readonly month = computed(() => this.uiStateDate().month);
  readonly totalYears = computed(() => this.uiStateDate().totalYears);

  readonly totalCoupons = computed(() => this.uiStateTotalCoupons().total);
  readonly isLoadingCoupons= computed(() => this.uiStateTotalCoupons().isLoading);
  readonly errorCoupons = computed(() => this.uiStateTotalCoupons().error);

  readonly totalDiscount = computed(() => this.uiStateTotalDiscount().total);
  readonly isLoadingDiscount = computed(() => this.uiStateTotalDiscount().isLoading);
  readonly errorDiscount = computed(() => this.uiStateTotalDiscount().error);

  readonly totalCouponsMonth = computed(() => this.uiStateCouponsByMonth().total);
  readonly isLoadingCouponsMonth = computed(() => this.uiStateCouponsByMonth().isLoading);
  readonly errorCouponsMonth = computed(() => this.uiStateCouponsByMonth().error);

  readonly totalDiscountMonth = computed(() => this.uiStateDiscountByMonth().total);
  readonly isLoadingDiscountMonth = computed(() => this.uiStateDiscountByMonth().isLoading);
  readonly errorDiscountMonth = computed(() => this.uiStateDiscountByMonth().error);

  changeDate(month: string, year: string, totalYears: boolean): void {
    this.uiStateDate.update(() => ({
      year: year,
      month: month,
      totalYears: totalYears
    }))
  }

  getTotalCoupons(): void {
    this.uiStateTotalCoupons.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalCouponsUseCase.execute().subscribe(
      {
        next: (total) => {
          this.uiStateTotalCoupons.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateTotalCoupons.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getTotalDiscount(): void {
    this.uiStateTotalDiscount.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalDiscountCouponsUseCase.execute().subscribe(
      {
        next: (total) => {
          this.uiStateTotalDiscount.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateTotalDiscount.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getTotalCouponsByMonth(month: string, year: string): void {
    this.uiStateCouponsByMonth.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalCouponsByMonthUseCase.execute(month, year).subscribe(
      {
        next: (total) => {
          this.uiStateCouponsByMonth.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateCouponsByMonth.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getTotalDiscountByMonth(month: string, year: string): void {
    this.uiStateDiscountByMonth.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalDiscountByMonthUseCase.execute(month, year).subscribe(
      {
        next: (total) => {
          this.uiStateDiscountByMonth.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateDiscountByMonth.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getTotalCouponsByYear(year: string): void {
    this.uiStateTotalCoupons.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalCouponsByYearUseCase.execute(year).subscribe(
      {
        next: (total) => {
          this.uiStateTotalCoupons.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateTotalCoupons.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getTotalDiscountByYear(year: string): void {
    this.uiStateTotalDiscount.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalDiscountByYearUseCase.execute(year).subscribe(
      {
        next: (total) => {
          this.uiStateTotalDiscount.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateTotalDiscount.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getCouponsByYear(year: string): void {
    this.uiStateCouponsByMonth.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalCouponsByYearUseCase.execute(year).subscribe(
      {
        next: (total) => {
          this.uiStateCouponsByMonth.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateCouponsByMonth.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

  getDiscountByYear(year: string): void {
    this.uiStateDiscountByMonth.update(() => ({
      total: 0,
      isLoading: true,
      error: null
    }));
    this.getTotalDiscountByYearUseCase.execute(year).subscribe(
      {
        next: (total) => {
          this.uiStateDiscountByMonth.update(() => ({
            total: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiStateDiscountByMonth.update(() => ({
            total: 0,
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

}
