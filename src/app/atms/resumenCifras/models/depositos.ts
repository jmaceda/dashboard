/*
 * Nombre     : denominaciones.ts
 * Ubicación  : app/home/models
 * Descripción: Información de las denominaciones de retiro/depósito de efectivo.
 */

//import { DenominacionesModel } from './denominaciones'

export class DepositosModel {
    
    //Fields 
    idSesDep    : Number  // Id de Sesión de Depósito (al iniciar un deposito o multideposito)
    nivelDep    : Number  // Nivel de depósito: 1=depósito / 2=sesión de depósito
    hraIniDep   : String
    hraTerDep   : String
    monto       : Number  // Monto del depósito.
    numIntentos : Number  // Numero de intentos
    denominaBill: String  //{'b20': 0, 'b50': 0, 'b100': 0, 'b200': 0, 'b500': 0, 'b1000': 0, 'monto': 0}  // DenominacionesModel[]
    difMiliSegs : Number  // Total de Milisegundos
    totSegundos : Number  // Total de Segundos
    horas       : Number  // Horas.
    minutos     : Number  // Minutos.
    segundos    : Number  // Segundos.
    fallidos    : number  // Depositos fallidos.
    
    constructor (){

    }
}
