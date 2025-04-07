import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CartsApiService {
    url = 'http://localhost:3000/';

    async getCarts(): Promise<any[]> {
        try {
            const response = await fetch(`${this.url}carts`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}