import {Observable} from "rxjs";
import {Coupon} from "../models/coupons.models";

export interface CouponsRepository {
  getMostUsedCoupons(): Observable<Coupon[]>;
}
