import { LtvModel } from "../../../../../domain/models/ltv.model";

export class LtvMapper {
    static toModel(data: any): LtvModel {
        return new LtvModel(
            data.id || '',
            data.fecha || '',
            data.ltv_mes || ''
        );
    }

    static toModelList(dataList: any[]): LtvModel[] {
        if (!Array.isArray(dataList)) {
            console.error("LtvMapper: dataList no es un array:", dataList);
            return [];
        }
        return dataList.map(data => this.toModel(data));
    }
}