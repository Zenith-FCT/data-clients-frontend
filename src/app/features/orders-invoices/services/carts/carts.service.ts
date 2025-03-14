import { Injectable } from '@angular/core';
import { carritosAbandonadosModel } from '../../domain/models/carts-model';
import { CartsMapper } from '../../data/mappers/carts-mapper';

@Injectable({
  providedIn: 'root'
})
export class CartsService {

  constructor() { }
  url = 'http://localhost:3000/carritos_abandonados';

  async getCarts():Promise<carritosAbandonadosModel[]>{
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return CartsMapper.toModelList(data);
    } catch (error) {
      // apartado para luego tratar errores
      return [];
    }
  }
  
  async getCart(id: string): Promise<carritosAbandonadosModel> {
    try {
      const response = await fetch(`${this.url}/${id}`);
      const data = await response.json();
      
      if (data) {
        return CartsMapper.toModel(data);
      } else {
        return {} as carritosAbandonadosModel;
      }
    } catch (error) {
      // apartado para luego tratar errores
      return {} as carritosAbandonadosModel;
    }
  }
}