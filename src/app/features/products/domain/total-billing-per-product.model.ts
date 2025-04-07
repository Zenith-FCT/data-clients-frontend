export class TotalBillingPerProductModel {
    constructor(
      public productType: string,
      public productName: string,
      public totalBilling: number
    ) {}
  }