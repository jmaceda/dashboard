/**
 *
 */

import { Injectable } from '@angular/core';


@Injectable()
export class UtilsService {

    private denominaBilletes:string = "|20|50|100|200|500|1000|";
    constructor() {
    }

    public convBillToJson (infoBilletes:string, denominaContador:string = "DC") {

        //console.log("infoBilletes:: "+infoBilletes);
        let montoTotal      = 0;
        let respBillJson    = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
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
                respBillJson.monto += Number(denomina) * Number(cantidad);
            }
        }
        return(respBillJson);
    }
}

