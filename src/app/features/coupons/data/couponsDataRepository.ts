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
}
