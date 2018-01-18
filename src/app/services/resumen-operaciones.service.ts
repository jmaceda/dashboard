/**
 * Created by jmaceda on 16/01/2018.
 */
import { Injectable }     from '@angular/core';

let nomComponente = "ResumenOperacionesService";

@Injectable()
export class ResumenOperacionesService {

    public registraMovtosPorHora(infoMovtosPorHora:any, horaMovto, tipoMovto, montoMovto){

        let detalleMovtosPorHora:any = {hora: 0, numCons: 0, acumNumCons: 0, montoCons: 0, numRetiro: 0, acumNumRetiro: 0, montoRetiro: 0, montoTotal: 0};
        let cveReg = "R"+horaMovto;
        let datosMovto:any = detalleMovtosPorHora;
        let infoMovtosTmp:any = infoMovtosPorHora[cveReg];

        infoMovtosTmp = (infoMovtosTmp == undefined) ? detalleMovtosPorHora : infoMovtosTmp;

        switch(tipoMovto){
            case "ROK": {
                infoMovtosTmp.numRetiro++;
                infoMovtosTmp.acumNumRetiro += infoMovtosTmp.numRetiro;
                infoMovtosTmp.montoRetiro += montoMovto;
                break;
            }

            case "COK": {
                infoMovtosTmp.numCons++;
                infoMovtosTmp.acumNumCons += infoMovtosTmp.numCons;
                infoMovtosTmp.montoCons += montoMovto;
                break;
            }

        }
        infoMovtosTmp.hora          = horaMovto;
        infoMovtosTmp.montoTotal   += montoMovto;
        infoMovtosPorHora[cveReg]  = infoMovtosTmp;

        return(infoMovtosPorHora);
    }


    // info.montoRetiro, info.acumMontoRetiro, info.comisCons, info.comisRet, info.comisTotal
    public acumulaMovtosPorHora(infoMovtosPorHora){

        let numConsAnt:number           = 0;
        let numRetAnt:number            = 0;
        let montoRetiroAnt:number       = 0;
        let montoComisionAnt:number     = 0;
        let comisConsultas:number       = 5;
        let comisRetiros:number         = 10;

        for (let idx in infoMovtosPorHora) {
            let info = infoMovtosPorHora[idx];

            infoMovtosPorHora[idx].acumNumCons         = infoMovtosPorHora[idx].numCons +numConsAnt;
            infoMovtosPorHora[idx].acumNumRetiro       = infoMovtosPorHora[idx].numRetiro +numRetAnt;
            infoMovtosPorHora[idx].acumMontoRetiro     = infoMovtosPorHora[idx].montoRetiro +montoRetiroAnt;
            infoMovtosPorHora[idx].acumMontoRetiro     = infoMovtosPorHora[idx].montoRetiro +montoRetiroAnt;
            infoMovtosPorHora[idx].comisCons           = infoMovtosPorHora[idx].numCons * comisConsultas;
            infoMovtosPorHora[idx].comisRet            = infoMovtosPorHora[idx].numRetiro * comisRetiros;
            infoMovtosPorHora[idx].comisTotal          = infoMovtosPorHora[idx].comisCons + infoMovtosPorHora[idx].comisRet;
            infoMovtosPorHora[idx].comisAcum           = infoMovtosPorHora[idx].comisTotal +montoComisionAnt;

            numConsAnt      = infoMovtosPorHora[idx].acumNumCons;
            numRetAnt       = infoMovtosPorHora[idx].acumNumRetiro;
            montoRetiroAnt  = infoMovtosPorHora[idx].acumMontoRetiro;
            montoComisionAnt = infoMovtosPorHora[idx].comisAcum;
        }
        return(infoMovtosPorHora);
    }

    public verificaMovtosPorHora(infoMovtosPorHora){

        //let copiaInfoMovtosPorHora:any = infoMovtosPorHora;
        let cveR6:any                  = "R6";
        let cveRx:any;


        let x:any = {hora: 0, numCons: 0, acumNumCons: 0, montoCons: 0, numRetiro: 0, acumNumRetiro: 0, montoRetiro: 0, montoTotal: 0, comisCons: 0, comisRet: 0, comisTotal: 0, comisAcum: 0};

        console.log("1) "+nomComponente+".verificaMovtosPorHora:: -->"+infoMovtosPorHora+"<--");
        for(let idx=0; idx < 8; idx++){
            cveRx="R"+idx;
            x.numCons       += infoMovtosPorHora[cveRx].numCons;
            x.numRetiro     += infoMovtosPorHora[cveRx].numRetiro;
            x.acumNumCons   += infoMovtosPorHora[cveRx].acumNumCons;
            x.acumNumRetiro += infoMovtosPorHora[cveRx].acumNumRetiro;
            x.montoCons     += infoMovtosPorHora[cveRx].montoCons;
            x.montoRetiro   += infoMovtosPorHora[cveRx].montoRetiro;
            x.montoTotal    += infoMovtosPorHora[cveRx].montoTotal;
        }
        //console.log("2) "+nomComponente+".verificaMovtosPorHora:: "+infoMovtosPorHora);
        //let y:any = infoMovtosPorHora.shift();
        //infoMovtosPorHora.splice(0,6);
        console.log("2) "+nomComponente+".verificaMovtosPorHora:: -->"+JSON.stringify(x)+"<--");
        console.log("3) "+nomComponente+".verificaMovtosPorHora:: "+JSON.stringify(infoMovtosPorHora));
    }
}
