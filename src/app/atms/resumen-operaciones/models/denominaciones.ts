/*
 * Nombre     : denominaciones.ts
 * Ubicación  : app/home/models
 * Descripción: Información de las denominaciones de retiro/depósito de efectivo.
 */

export class DenominacionesModel {
    
    //Fields 
    tipo        : String  // Tipo de moneda B=Billete / M=Moneda
    denominacion: Number
    cantidad    : Number
    monto       : Number

    constructor (tipo, denominacion, cantidad, monto){
        this.tipo         = tipo;
        this.denominacion = denominacion;
        this.cantidad     = cantidad;
        this.monto        = monto;
    }
}