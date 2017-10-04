// importamos el modulo Injectable de AngularJS
import { Injectable } from '@angular/core';
import { DepositosModel }   from '../models/depositos';
import { DesglosaBilletes } from '../services/DesglosaBilletes.service';
import { sprintf }          from "sprintf-js";
//import Dexie                from 'dexie';
import { Logger, Level }                                 from "angular2-logger/core";

var bdRedBlu = 'RedBluDB';
var dbDexieLocal;


// Permitimos que este objeto se pueda inyectar con la DI
@Injectable()
export class GuardaDepositosBD {

    public infoDepositos: DepositosModel[] = [];
    public arrDepositos: DepositosModel[]  = [];


    calculaTiempoDeposito(dbDexie, idSesDep, nivelDep, fchIniDep, fchTerDep, numIntentos, montoDeposito, datosDeposito, fallidos){

                var fchIni = new Date(fchIniDep);
                var fchTer = new Date(fchTerDep);
                var ftoHra = "%02d:%02d:%02d";
        //console.log("calculaTiempoDeposito:: nivelDep["+nivelDep+"]  fchIni["+fchIni+"]   fchTer["+fchTer+"]  fallidos["+fallidos+"]") 
        //console.log("calculaTiempoDeposito:: fchIni["+fchIni+"]   fchTer["+fchTer+"]  ftoHra["+ftoHra+"]")
                var hraIniDep = sprintf(ftoHra, fchIni.getHours(), fchIni.getMinutes(), fchIni.getSeconds());
                var hraTerDep = sprintf(ftoHra, fchTer.getHours(), fchTer.getMinutes(), fchTer.getSeconds());
        //console.log("calculaTiempoDeposito:: hraIniDep["+hraIniDep+"]   hraTerDep["+hraTerDep+"]")
        
                var difMiliSegs = fchTer.getTime() - fchIni.getTime();  // Total de MiliSegundos
        //console.log("calculaTiempoDeposito:: difMiliSegs["+difMiliSegs+"]")       
        
                var totSegundos = Math.round(difMiliSegs / 1000);  // Total de Segundos
        //console.log("calculaTiempoDeposito:: totSegundos["+totSegundos+"]") 
        
                var horas = Math.trunc((totSegundos / 60) / 60);
        //console.log("calculaTiempoDeposito:: horas["+horas+"]") 
        
                var minutos = Math.trunc(totSegundos / 60);  // Solo minutos.
        //console.log("calculaTiempoDeposito:: minutos["+minutos+"]")  
        
                var segundos = totSegundos - ( ((horas * 60) * 60) + (minutos*60) )  //    Math.trunc(totMinutos / 60);
        //console.log("calculaTiempoDeposito:: segundos["+segundos+"]")
                
                var deposito     = new DepositosModel ();
                var denominaBill = this._desglosaBilletes.getDesglose(datosDeposito);
                var totalSegs    = 0;
        
                // Llamamos al método del servicio
        
        
                deposito.idSesDep     = idSesDep;       // Id de Sesión de Depósito (al iniciar un deposito o multideposito)
                deposito.nivelDep     = nivelDep;       // Nivel de depósito: 1=depósito / 2=sesión de depósito
                deposito.hraIniDep    = hraIniDep;
                deposito.hraTerDep    = hraTerDep;
                deposito.numIntentos  = numIntentos;
                deposito.monto        = montoDeposito;
                deposito.denominaBill = denominaBill;   // Denominación de billetes depositados.
                deposito.difMiliSegs  = difMiliSegs;    // Total de MiliSegundos utilizados en el depósito.
                deposito.totSegundos  = totSegundos;    // Total de segundos utilizados en el depósito.
                deposito.horas        = horas;
                deposito.minutos      = minutos;
                deposito.segundos     = segundos;
                deposito.fallidos     = fallidos;
        
                this.infoDepositos.push(deposito);
        
                this.arrDepositos.push(deposito);
                /*
                db.add('depositos', { 'id': id, 'nivelDeposito': nivelDeposito, 
                                      'horaInicio' : hraIniDep,   'horaTermino': hraTerDep,
                                      'numIntentos': numIntentos, 'monto'      : montoDeposito, 'billetes': this.extraeBilletes(datosDeposito)
                                    }).then(() => {
                    // Do something after the value was added
                }, (error) => {
                    console.log(error);
                });
                */
        
                var datosDepositos = { 'idSesDep'    : idSesDep,         'nivelDep'   : nivelDep, 
                                       'hraIniDep'   : hraIniDep,    'hraTerDep'  : hraTerDep,
                                       'numIntentos' : numIntentos,  'monto'      : montoDeposito,
                                       'denominaBill': denominaBill, 'difMiliSegs': difMiliSegs,
                                       'totSegundos' : totSegundos,  'horas'      : horas,
                                       'minutos'     : minutos,      'segundos'   : segundos,
                                       'fallidos'    : fallidos
                };
        
                //this.addDepositoToDB(deposito);
        /*
                if (dbDexie.isOpen() == false){

                    dbDexie = new Dexie(bdRedBlu);
                    
                    dbDexie.version(1).stores({
                        tabDepositos: "++id, nivelDep, [idSesDep+nivelDep]"
                    });
            
                    dbDexie.open().catch (function (err) {
                        console.log('Failed to open db: ' + (err.stack || err));
                    });
                }

                dbDexie.tabDepositos.add( datosDepositos ).then(function() {
                    //console.log("Se registro correctamente los datos de un Depósito");
                }).catch(function (e) {
                    // Something failed. It may be already in the open() call.
                    console.log ("Error al registrar datos de un nuevo Depósito");
                    console.log (e.stack || e);
                });
        */
        
                /*
                console.log("Dexie.spawn:: id["+id+"]");
                */
        /*
                db2.add('depositosx', datosDepositos).then(() => {
                    // Do something after the value was added
                    console.log("Se inserto un registro en journal-db ["+idDep+"]");
                }, (error) => {
                    console.log("Error insert journal-db: ["+idDep+"] "+error);
                });
        */
                //for (var i in customerData) {
                //    request.objStore.add(datosDepositos);
                //}

        return(dbDexie);
        
    }


    constructor(public logger: Logger, public _desglosaBilletes: DesglosaBilletes){}

}