/**
 *
 */

import { Injectable } from '@angular/core';

import { AcumulaBilletesModel } from '../models/acumula-billetes.model';

@Injectable()
export class UtilsService {

    private denominaBilletes:string = "|20|50|100|200|500|1000|";
    constructor() {
    }

    public convBillToJson (infoBilletes:string, denominaContador:string = "DC") { // DC = <denominación>x<cantidad billetes>

        //console.log("infoBilletes:: "+infoBilletes);
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

    /*
        Lee un arreglo de que contiene información de efectivo (Ej: depósitos: [0x20|55x50|47x100|22x200|30x500|0x1000]  )
     */
    /*
    public obtenMontoBilletesPorDenominacion(arrCantidadBilletes:string):string {

        let respMontosPorDenominacion:any = {};
        arrCantidadBilletes =[
            "[0x20|0x50|0x100|0x200|15x500|0x1000]",
            "[0x20|0x50|7x100|23x200|33x500|0x1000]",
            "[0x20|0x50|0x100|0x200|23x500|0x1000]",
            "[0x20|0x50|0x100|0x200|65x500|0x1000]",
            "[0x20|0x50|5x100|19x200|25x500|1x1000]",
            "[0x20|0x50|0x100|5x200|71x500|1x1000]",
            "[0x20|0x50|31x100|15x200|45x500|1x1000]",
            "[0x20|1x50|14x100|16x200|57x500|0x1000]",
            "[0x20|0x50|0x100|0x200|2x500|0x1000]"
        ];

        for(let idx; idx < arrCantidadBilletes.length; idx++){

        }

    }
*/
    /*
        arrCantidadBilletes: Arreglo con las denominaciones y numero de billetes (Ej: [0x20|55x50|47x100|22x200|30x500|0x1000])
        delimitador: Caracter delimitador entre grupos de billetes y denominaciòn.
        posDenom: Indica la posiciòn de la denominacion y billetes (DB=<denomina> x <billetes>  /  BD=<billetes> x <denomina>
     */
    public obtenNumBilletesPorDenominacion(arrCantidadBilletes, delimitador, posDenom = "DB") {

        let numBilletes = {opers: 0, b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
        let charDelim   = (delimitador == undefined || delimitador == null || delimitador == "") ? "|" : delimitador;
        let numBill     = 0;
        let denomina    = 0;
        let denominaBilletes: AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);

        for ( let reg of arrCantidadBilletes ) {

            reg = reg.replace(/\[(.*)\]/, "$1"); // Elimina corchetes cuadrados.

            // Lee cada grupo de billetes con denominaciones.
            for(let elem of reg.split(charDelim)){

                if (elem == undefined || elem == null || elem == ""){
                    continue;
                }

                if(posDenom == "BD"){    elem = elem.split("x");

                    numBill  = Number(elem[0]);
                    denomina = elem[1];
                }else{
                    denomina  = elem[0];
                    numBill   = Number(elem[1]);
                }

                let cveDenomina = "b"+denomina;

                denominaBilletes[cveDenomina] += numBill;
                denominaBilletes.monto += (denomina * numBill);
            }
            denominaBilletes.opers++;
        }

        return(denominaBilletes);
    }

    /*
        sort_by
        Ordena un objeto JSON por un simple campo

        Ref: https://gist.github.com/mbeaty/1218651
     */
    public sort_by(field, reverse, primer){

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


