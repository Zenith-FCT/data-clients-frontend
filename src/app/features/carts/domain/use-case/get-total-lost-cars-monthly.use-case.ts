import { Observable, map } from "rxjs";
import { CartsRepository } from "../repositories/carts-repository";
import { CartModel } from "../models/carts.model";

export class GetTotalLostCartsMonthlyUseCase {
    constructor(private cartsRepository: CartsRepository) {}

    execute(year: number, month: number): Observable<number> {
        return this.cartsRepository.getCarts().pipe(
            map((carts: CartModel[]) => {
                const filteredCarts = carts.filter(cart => {
                    const [cartYear, cartMonth] = cart.date.split('-').map(Number);
                    return cartYear === year && cartMonth === month;
                });
                
                return filteredCarts.reduce((sum, cart) => {
                    const value = parseFloat(cart.total);
                    return sum + (isNaN(value) ? 0 : value);
                }, 0);
            })
        );
    }
}