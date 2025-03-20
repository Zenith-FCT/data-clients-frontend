import {Injectable,computed,inject,signal} from "@angular/core";
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

  private uiState = signal<CouponsUIState>({
    coupons: [],
    isLoading: false,
    error: null
  })

  readonly coupons = computed(() => this.uiState().coupons);
  readonly isLoading = computed(() => this.uiState().isLoading);
  readonly error = computed(() => this.uiState().error);

  private getMostUsedCouponsUseCase = inject(GetMostUsedCouponsUseCase);


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
