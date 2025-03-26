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
          throw new Error("Error al recoger los datos");
        }
    }

    async getTotalCoupons(): Promise<number> {
      try {
        const response = await fetch(`${this.url}cupones/total`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }


    async getTotalDiscount(): Promise<number> {
      try {
        const response = await fetch(`${this.url}cupones/totalDiscount`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getTotalCouponsByMonth(month: string, year: string): Promise<number> {
      try {
        const response = await fetch(`${this.url}cupones/month?month=${month}&year=${year}`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getTotalDiscountByMonth(month: string, year: string): Promise<number> {
      try {
        const response = await fetch(`${this.url}cupones/discountMonth?month=${month}&year=${year}`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

}
