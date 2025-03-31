import {Injectable,computed,signal} from "@angular/core";
import {CouponsDataRepository} from "../../../../data/couponsDataRepository";
import {GetMonthlyCouponsByYearUseCase} from "../../../../domain/useCases/getMonthlyCouponsByYearUseCase";


export interface TotalUIState {
  isLoading: boolean;
  error: string | null;
  count: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CouponCountGraphicViewModel {

  private getMonthlyCouponsByYearUseCase: GetMonthlyCouponsByYearUseCase;

  constructor(private couponsDataRepository: CouponsDataRepository) {
    this.getMonthlyCouponsByYearUseCase = new GetMonthlyCouponsByYearUseCase(this.couponsDataRepository);
  }


  private uiState = signal<TotalUIState>({
    count: [],
    isLoading: false,
    error: null
  });

  readonly count = computed(() => this.uiState().count);
  readonly isLoading = computed(() => this.uiState().isLoading);
  readonly error = computed(() => this.uiState().error);

  getTotalCoupons(year: string): void {
    this.uiState.update(() => ({
      count: [],
      isLoading: true,
      error: null
    }));
    this.getMonthlyCouponsByYearUseCase.execute(year).subscribe(
      {
        next: (total) => {
          this.uiState.update(() => ({
            count: total,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiState.update(() => ({
            count: [],
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

}
