export class MonthlySalesModel{
    id:string;
    date:string;
    totalSales:string;

    constructor(id:string, date:string, totalSales:string){
        this.id = id;
        this.date = date;
        this.totalSales = totalSales;
    }
}