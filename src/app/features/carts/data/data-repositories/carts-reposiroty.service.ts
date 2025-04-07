import { Observable, from } from "rxjs";
import { CartModel } from "../../domain/models/carts.model";
import { Injectable } from "@angular/core";
import { CartsApiService } from "./remote/api/carts-api.service";

@Injectable({
    providedIn: 'root'
})
export class CartsDataRepository {

    constructor(private apiService: CartsApiService) {}
    getCarts(): Observable<CartModel[]> {
        return from(this.apiService.getCarts());
    }
}