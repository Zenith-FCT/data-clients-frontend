import {Injectable} from '@angular/core';
import {Coupon} from '../../domain/models/coupons.models';
import {CouponsMapper} from './couponsMappers';


@Injectable({
  providedIn: 'root'
})
export class CouponsApiSourceService{

    constructor() { }
    url = 'http://localhost:3000/';

    async getMostUsedCoupons():Promise<Coupon[]>{
        try {
            const response = await fetch(`${this.url}cupones`);
            const data = await response.json();
            return CouponsMapper.toModelList(data);
        }
        catch (error) {
            return [];
        }
    }

}
