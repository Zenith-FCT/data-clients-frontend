import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Coupon} from '../domain/models/coupons.models';
import {CouponsRepository} from '../domain/repositories/coupons.repository';
import {CouponsApiSourceService} from './remote/couponsApiSource.service';


@Injectable({
  	providedIn: 'root'
})
export class CouponsDataRepository implements CouponsRepository {
  constructor(private dataSource: CouponsApiSourceService) {}

    getMostUsedCoupons(): Observable<Coupon[]> {
      return new Observable(obs => {
        this.dataSource.getMostUsedCoupons().then(coupons => {
          obs.next(coupons);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getTotalCoupons(): Observable<number> {
      return new Observable(obs => {
        this.dataSource.getTotalCoupons().then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getTotalDiscount(): Observable<number> {
      return new Observable(obs => {
        this.dataSource.getTotalDiscount().then(totalDiscount => {
          obs.next(totalDiscount);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getTotalCouponsByMonth(month: string, year: string): Observable<number> {
      return new Observable(obs => {
        this.dataSource.getTotalCouponsByMonth(month, year).then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getTotalDiscountByMonth(month: string, year: string): Observable<number> {
      return new Observable(obs => {
        this.dataSource.getTotalDiscountByMonth(month, year).then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getMonthlyCouponsByYear(year: string): Observable<number[]> {
      return new Observable(obs => {
        this.dataSource.getMonthlyCouponsByYear(year).then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getMonthlyDiscountByYear(year: string): Observable<number[]> {
      return new Observable(obs => {
        this.dataSource.getMonthlyDiscountByYear(year).then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }

    getAvailableYears(): Observable<string[]> {
      return new Observable(obs => {
        this.dataSource.getAvailableYears().then(total => {
          obs.next(total);
          obs.complete();
        }).catch((error) =>
          obs.error(error)
        )
      })
    }
}
