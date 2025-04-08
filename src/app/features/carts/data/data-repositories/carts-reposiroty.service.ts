import { Observable, from } from "rxjs";
import { CartModel, TotalOrders } from "../../domain/models/carts.model";
import { Injectable } from "@angular/core";
import { CartsApiService } from "./remote/api/carts-api.service";
import { CartsRepository } from "../../domain/repositories/carts-repository";

@Injectable({
    providedIn: 'root'
})
export class CartsDataRepository implements CartsRepository {

    constructor(private apiService: CartsApiService) {}
    getTotalOrders(): Observable<TotalOrders[]> {
        return from(this.apiService.getTotalOrders());
    }
    getCarts(): Observable<CartModel[]> {
        return from(this.apiService.getCarts());
    }
}