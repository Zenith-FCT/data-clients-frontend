import { MonthlySalesModel } from "../../../../../domain/models/monthly-sales.model";

export class MonthlySalesMapper {
    static toModel(data: any): MonthlySalesModel {
        return new MonthlySalesModel(
            data.id || '',
            data.fecha || '',
            data.total || '',
            data.total_ventas || ''
        );
    }

    static toModelList(dataList: any[]): MonthlySalesModel[] {
        if (!Array.isArray(dataList)) {
            console.error("MonthlySalesMapper: dataList no es un array:", dataList);
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}