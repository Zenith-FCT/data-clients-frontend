import {Injectable,computed,signal} from "@angular/core";
import {Coupon} from "../../../../domain/models/coupons.models";
import {GetMostUsedCouponsUseCase} from "../../../../domain/useCases/getMOstUsedCouponsUseCase";


export interface CouponsUIState {
  isLoading: boolean;
  error: string | null;
  coupons: Coupon[];
}

@Injectable({
  providedIn: 'root'
})
export class MonthlySalesViewModel {

  constructor(private getMostUsedCouponsUseCase: GetMostUsedCouponsUseCase) {}

  private uiState = signal<CouponsUIState>({
    coupons: [],
    isLoading: false,
    error: null
  })

  readonly coupons = computed(() => this.uiState().coupons);
  readonly isLoading = computed(() => this.uiState().isLoading);
  readonly error = computed(() => this.uiState().error);


  getMostUsedCoupons(): void {
    this.uiState.update(() => ({
      coupons: [],
      isLoading: true,
      error: null
    }));
    this.getMostUsedCouponsUseCase.execute().subscribe(
      {
        next: (coupons) => {
          this.uiState.update(() => ({
            coupons: coupons,
            isLoading: false,
            error: null
          }));
        },
        error: (error) => {
          this.uiState.update(() => ({
            coupons: [],
            isLoading: false,
            error: error.message
          }));
        }
      }
    )
  }

}
