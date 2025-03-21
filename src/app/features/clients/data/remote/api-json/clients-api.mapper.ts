import { ClientsList } from "../../../domain/clients-list.model";
import { ClientsListApi } from "./clients-list-api.model";

export class ClientsApiMapper {
    static toDomain(apiClient: ClientsListApi): ClientsList {
        return ClientsList.create(apiClient)
    }
}