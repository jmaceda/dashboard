/**
 *
 */

import { Injectable } from '@angular/core';
import { AcumulaBilletesModel } from '../models/acumula-billetes.model';

var nomComponente:string = "utils.service";

@Injectable()
export class UtilsService {

    private denominaBilletes:string = "|20|50|100|200|500|1000|";
    constructor() {}

    public convBillToJson (infoBilletes:string, denominaContador:string = "DC") { // DC = <denominación>x<cantidad billetes>
        if(infoBilletes == "" || infoBilletes == null || infoBilletes == undefined){
            return("");
        }

        let montoTotal      = 0;
        let respBillJson    = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, totbill: 0, monto: 0};
        let posInicial      = infoBilletes.indexOf('[');
        let posFinal        = infoBilletes.indexOf(']', posInicial);

        posInicial          = (posInicial == -1) ? 0 : posInicial;
        posFinal            = (posFinal == -1) ? infoBilletes.length : posFinal;

        let billetes1       = infoBilletes.substr(posInicial, (posFinal - posInicial)).replace(/[\[\]]/g,'');
        let arrBilletes     = billetes1.split("|");
        let denomina:any    = "";
        let cantidad:any    = "";

        for(let idx=0; idx < arrBilletes.length; idx++){

            if (arrBilletes[idx].split("x")[0] != "" && arrBilletes[idx].split("x")[0] != null) {

                if (denominaContador == "DC"){
                    denomina = arrBilletes[idx].split("x")[0];
                    cantidad = arrBilletes[idx].split("x")[1];
                } else {
                    cantidad = arrBilletes[idx].split("x")[0];
                    denomina = arrBilletes[idx].split("x")[1];
                }

                respBillJson['b' + denomina] = Number(cantidad);
                respBillJson.totbill += Number(cantidad);
                respBillJson.monto += Number(denomina) * Number(cantidad);
            }
        }
        return(respBillJson);
    }

    public obtenNumBilletesPorDenominacion(arrCantidadBilletes, delimitador, posDenom) {

        let numBilletes = {opers: 0, b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
        let charDelim   = (delimitador == undefined || delimitador == null || delimitador == "") ? "|" : delimitador;
        let numBill     = 0;
        let denomina    = 0;
        let denominaBilletes: AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);

        for ( let reg of arrCantidadBilletes ) {

            reg = reg.replace(/\[(.*)\]/, "$1"); // Elimina corchetes cuadrados.

            if (reg != ("null"+charDelim)) {
                for (let elem of reg.split(charDelim)) {
                    if (elem == undefined || elem == null || elem == "") {
                        continue;
                    }

                    elem            = elem.split("x");

                    if (posDenom == "BD") {
                        numBill     = Number(elem[0]);
                        denomina    = elem[1];
                    } else {
                        denomina    = elem[0];
                        numBill     = Number(elem[1]);
                    }

                    let cveDenomina = "b" + denomina;

                    denominaBilletes[cveDenomina]   += numBill;
                    denominaBilletes.monto          += (denomina * numBill);
                }
                denominaBilletes.opers++;
            }
        }
        return(denominaBilletes);
    }

    public sort_by(field, reverse, primer?){

        reverse = (reverse) ? -1 : 1;

        return function(a,b){

            a = a[field];
            b = b[field];

            if (typeof(primer) != 'undefined'){
                a = primer(a);
                b = primer(b);
            }

            if (a<b) return reverse * -1;
            if (a>b) return reverse * 1;
            return 0;

        }
    }

    public order_by(path, reverse, primer, then) {
        let get = function (obj, path) {
                if (path) {
                    let len = 0;
                    path = path.split('.');
                    for (let i = 0, len = path.length - 1; i < len; i++) {
                        obj = obj[path[i]];
                    }
                    return obj[path[len]];
                }
                return obj;
        };
        let prime = function (obj) {
            return primer ? primer(get(obj, path)) : get(obj, path);
        };

        return function (a, b) {
            let A = prime(a),
                B = prime(b);

            return (
                    (A < B) ? -1 :
                        (A > B) ?  1 :
                            (typeof then === 'function') ? then(a, b) : 0
                ) * [1,-1][+!!reverse];
        };
    };

}


