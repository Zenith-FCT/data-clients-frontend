export class carritosAbandonadosModel {
  id: String;
  fecha: string;
  email: String;
  constructor(id: String, fecha: string, email: String) {
    this.id = id;
    this.fecha = fecha;
    this.email = email;
  }
}