export class clientes{
    id:String;
    email:String;
    nombre:String;
    edad:String;
    sexo:String;
    cp:String;
    localidad:String;
    pais:String;
    fecha_lead:String;
    fecha_1er_pedido:String;
    periodo_conversion:String;
    fecha_ult_pedido:String;
    tiempo_ltv:String;
    entrada_lead:String;
    nº_pedidos:String;
    ltv:String;
    tm:String;
    periodo_medio_compra:String;
    periodo_desde_ultimo_pedido:String;

    constructor(
        id:String,
        email:String,
        nombre:String,
        edad:String,
        sexo:String,
        cp:String,
        localidad:String,
        pais:String,
        fecha_lead:String,
        fecha_1er_pedido:String,
        periodo_conversion:String,
        fecha_ult_pedido:String,
        tiempo_ltv:String,
        entrada_lead:String,
        nº_pedidos:String,
        ltv:String,tm:String,
        periodo_medio_compra:String,
        periodo_desde_ultimo_pedido:String
    ){
        this.id = id;
        this.email = email;
        this.nombre = nombre;
        this.edad = edad;
        this.sexo = sexo;
        this.cp = cp;
        this.localidad = localidad;
        this.pais = pais;
        this.fecha_lead = fecha_lead;
        this.fecha_1er_pedido = fecha_1er_pedido;
        this.periodo_conversion = periodo_conversion;
        this.fecha_ult_pedido = fecha_ult_pedido;
        this.tiempo_ltv = tiempo_ltv;
        this.entrada_lead = entrada_lead;
        this.nº_pedidos = nº_pedidos;
        this.ltv = ltv;
        this.tm = tm;
        this.periodo_medio_compra = periodo_medio_compra;
        this.periodo_desde_ultimo_pedido = periodo_desde_ultimo_pedido;
    }

}