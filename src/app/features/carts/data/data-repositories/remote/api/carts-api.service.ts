import { Injectable } from "@angular/core";
import { CartsMapper, TotalOrdersMapper } from "./mappers/carts-mapper";
import { CartModel, TotalOrders } from "../../../../domain/models/carts.model";

@Injectable({
    providedIn: 'root'
})
export class CartsApiService {
    url = 'http://localhost:3000/';

    async getCarts(): Promise<CartModel[]> {
        try {
            const response = await fetch(`${this.url}carts_lost_monthly`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return CartsMapper.toModelList(data);
        } catch (error) {
            throw error;
        }
    }

    async getTotalOrders(): Promise<TotalOrders[]> {
        try {
            const response = await fetch(`${this.url}total_orders`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return TotalOrdersMapper.toModelList(data);
        } catch (error) {
            throw error;
        }
    }
}