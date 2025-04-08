import {Injectable,computed,signal} from "@angular/core";
import {CouponsDataRepository} from "../../data/couponsDataRepository";
import {GetCouponsAvailableYearsUseCase} from "../../domain/useCases/GetCouponsAvailableYearsUseCase";


export interface TotalUIState {
  error: string | null;
  years: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MainCouponsViewModel {

  private getCouponsAvailableYearsUseCase: GetCouponsAvailableYearsUseCase;

  constructor(private couponsDataRepository: CouponsDataRepository) {
    this.getCouponsAvailableYearsUseCase = new GetCouponsAvailableYearsUseCase(this.couponsDataRepository);
  }


  private uiState = signal<TotalUIState>({
    years: [],
    error: null
  });

  readonly years = computed(() => this.uiState().years);
  readonly error = computed(() => this.uiState().error);

  getYearsAvailable(): void {

    this.getCouponsAvailableYearsUseCase.execute().subscribe(
      {
        next: (total) => {
          this.uiState.update(() => ({
            years: total,
            error: null
          }));
        },
        error: (error) => {
          this.uiState.update(() => ({
            years: [],
            error: error.message
          }));
        }
      }
    )
  }

}
