import {Observable} from "rxjs";
import {CouponsRepository} from "../repositories/coupons.repository";

export class GetCouponsAvailableYearsUseCase {

  constructor(private couponService: CouponsRepository) {}


  execute(): Observable<string[]> {
      return this.couponService.getAvailableYears()
  }

}
