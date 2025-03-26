import {Injectable,computed,signal} from "@angular/core";
import {CouponsDataRepository} from "../../../../data/couponsDataRepository";
import {GetTotalCouponsUseCase} from "../../../../domain/useCases/getTotalCouponsUseCase";
import {GetTotalDiscountCouponsUseCase} from "../../../../domain/useCases/getTotalDiscountCouponsUseCase";


export interface TotalUIState {
  isLoading: boolean;
  error: string | null;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoxCouponsViewModel {

  private getTotalDiscountCouponsUseCase: GetTotalDiscountCouponsUseCase;
  private getTotalCouponsUseCase: GetTotalCouponsUseCase;

  constructor(private couponsDataRepository: CouponsDataRepository) {
    this.getTotalDiscountCouponsUseCase = new GetTotalDiscountCouponsUseCase(this.couponsDataRepository);
    this.getTotalCouponsUseCase = new GetTotalCouponsUseCase(this.couponsDataRepository);
  }


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

  readonly totalCoupons = computed(() => this.uiStateTotalCoupons().total);
  readonly isLoadingCoupons= computed(() => this.uiStateTotalCoupons().isLoading);
  readonly errorCoupons = computed(() => this.uiStateTotalCoupons().error);

  readonly totalDiscount = computed(() => this.uiStateTotalDiscount().total);
  readonly isLoadingDiscount = computed(() => this.uiStateTotalDiscount().isLoading);
  readonly errorDiscount = computed(() => this.uiStateTotalDiscount().error);

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

}
