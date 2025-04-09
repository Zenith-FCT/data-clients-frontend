import {Injectable} from '@angular/core';
import {Coupon} from '../../domain/models/coupons.models';
import {CouponsMapper} from './couponsMappers';


@Injectable({
  providedIn: 'root'
})
export class CouponsApiSourceService{

    url = 'https://json-server-example-data.vercel.app/';

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
        const response = await fetch(`${this.url}cuponesTotal`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }


    async getTotalDiscount(): Promise<number> {
      try {
        const response = await fetch(`${this.url}cuponesTotalDiscount`);
        const data = await response.json();
        return data.total;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getTotalCouponsByMonth(month: string, year: string): Promise<number> {
      try {
        const response = await fetch(`${this.url}cuponesByYear${year}`);
        const data = await response.json();
        return data[Number(month)].count;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getTotalDiscountByMonth(month: string, year: string): Promise<number> {
      try {
        const response = await fetch(`${this.url}cuponesByYear${year}`);
        const data = await response.json();
        return data[Number(month)].count;
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getMonthlyCouponsByYear(year: string): Promise<number[]> {
      try {
        const response = await fetch(`${this.url}cuponesByYear${year}`);
        const data = await response.json();
        return data.map( (c:{count: number })=> c.count );
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
    }

    async getAvailableYears():Promise<string[]>{
      try {
          const response = await fetch(`${this.url}cuponesAvailableYears`);
          const data = await response.json();
          return data.map( (years: {year: string;}) => years.year );
      }
      catch (error) {
        throw new Error("Error al recoger los datos");
      }
  }

}
