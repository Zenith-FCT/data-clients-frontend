import { ClientsList } from "../../../domain/clients-list.model";
import { ProductClientDistribution } from "../../../domain/product-distribution.model";
import { ClientsListApi } from "./clients-list-api.model";
import { ProductClientDistributionApi } from "./product-client-distribution-api.model";

export class ClientsApiMapper {
    static toDomain(apiClient: ClientsListApi): ClientsList {
        return ClientsList.create(apiClient)
    }
    
    static productDistributionToDomain(apiDistribution: ProductClientDistributionApi): ProductClientDistribution {
        return {
            name: apiDistribution.name,
            value: apiDistribution.value,
            percentage: apiDistribution.percentage
        };
    }
    
    static productDistributionListToDomain(apiDistributionList: ProductClientDistributionApi[]): ProductClientDistribution[] {
        return apiDistributionList.map(item => this.productDistributionToDomain(item));
    }
}