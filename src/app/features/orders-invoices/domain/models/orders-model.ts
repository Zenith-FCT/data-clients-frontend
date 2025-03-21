class Product {
    productName: string;
    sku: string;
    category: string;
  
    constructor(productName: string, sku: string, category: string) {
      this.productName = productName;
      this.sku = sku;
      this.category = category;
    }
  }
  
  export class Order {
    id: string;
    orderNumber: string;
    orderDate: string;
    clientName: string;
    email: string;
    totalOrder: string;
    totalDiscount: string;
    discountCouponName: string;
    productList: Product[];
  
    constructor(
      id: string,
      numeroPedido: string,
      orderDate: string,
      clientName: string,
      email: string,
      orderTotal: string,
      totalDiscount: string,
      discountCouponName: string,
      productList: Product[]
    ) {
      this.id = id;
      this.orderNumber = numeroPedido;
      this.orderDate = orderDate;
      this.clientName = clientName;
      this.email = email;
      this.totalOrder = orderTotal;
      this.totalDiscount = totalDiscount;
      this.discountCouponName = discountCouponName;
      this.productList = productList;
    }
  }