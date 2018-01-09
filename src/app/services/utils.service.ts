/**
 *
 */

import { Injectable } from '@angular/core';


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

        let numBilletes = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, monto: 0};
        let charDelim   = (delimitador == undefined || delimitador == null || delimitador == "") ? "|" : delimitador;
        let numBill     = 0;
        let denomina    = 0;

        for ( let reg of arrCantidadBilletes ) {

            reg = reg.replace(/\[(.*)\]/, "$1"); // Elimina corchetes cuadrados.

            // Lee cada grupo de billetes con denominaciones.
            for(let elem of reg.split(charDelim)){
                elem = elem.split("x");

                if(posDenom == "BD"){
                    numBill  = Number(elem[0]);
                    denomina = elem[1];
                }else{
                    denomina  = elem[0];
                    numBill   = Number(elem[1]);
                }

                numBilletes.b20   += (denomina == 20)   ? numBill : 0;
                numBilletes.b50   += (denomina == 50)   ? numBill : 0;
                numBilletes.b100  += (denomina == 100)  ? numBill : 0;
                numBilletes.b200  += (denomina == 200)  ? numBill : 0;
                numBilletes.b500  += (denomina == 500)  ? numBill : 0;
                numBilletes.b1000 += (denomina == 1000) ? numBill : 0;
            }
        }

        numBilletes.monto = (numBilletes.b20 * 20) + (numBilletes.b50 * 50) + (numBilletes.b100 * 100) + (numBilletes.b200 * 200)  + (numBilletes.b500 * 500) + (numBilletes.b1000 * 1000);
        return(numBilletes);
    }
}

