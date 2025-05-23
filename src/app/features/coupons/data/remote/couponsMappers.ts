import {Coupon} from "../../domain/models/coupons.models";

export class CouponsMapper {
  static toModel(data: any): Coupon {
      return new Coupon(
          data.name,
          data.count,
      );
  }

  static toModelList(dataList: any[]): Coupon[] {
      if (!Array.isArray(dataList)) {
          return [];
      }

      return dataList.map(data => this.toModel(data));
  }
}
