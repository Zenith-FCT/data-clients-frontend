import {Injectable,inject} from '@angular/core';
import {Coupon} from '../domain/models/coupons.models';
import {CouponsRepository} from '../domain/repositories/coupons.repository';
import {CouponsApiSourceService} from './remote/couponsApiSource.service';
import {Observable} from 'rxjs';


@Injectable({
  	providedIn: 'root'
})
export class CouponsDataRepository implements CouponsRepository {

  	private dataSource = inject(CouponsApiSourceService)

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
