/**
 * Created by jmaceda on 16/01/2018.
 */
import { Injectable }     from '@angular/core';

let nomComponente = "ResumenOperacionesService";

@Injectable()
export class ResumenOperacionesService {

    public registraMovtosPorHora(inforMovtosPorHora:any, horaMovto, tipoMovto, montoMovto){

        let detalleMovtosPorHora:any = {hora: 0, numCons: 0, acumNumCons: 0, montoCons: 0, numRetiro: 0, acumNumRetiro: 0, montoRetiro: 0, montoTotal: 0};
        let cveReg = "R"+horaMovto;
        let datosMovto:any = detalleMovtosPorHora;
        let infoMovtosTmp:any = inforMovtosPorHora[cveReg];

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
        inforMovtosPorHora[cveReg]  = infoMovtosTmp;

        return(inforMovtosPorHora);
    }


    // info.montoRetiro, info.acumMontoRetiro, info.comisCons, info.comisRet, info.comisTotal
    public acumulaMovtosPorHora(inforMovtosPorHora){

        let numConsAnt:number       = 0;
        let numRetAnt:number        = 0;
        let montoRetiroAnt:number   = 0;
        let montoComisionAnt:number   = 0;
        let comisConsultas:number = 5;
        let comisRetiros:number = 10;

        for (let idx in inforMovtosPorHora) {
            let info = inforMovtosPorHora[idx];

            inforMovtosPorHora[idx].acumNumCons         = inforMovtosPorHora[idx].numCons +numConsAnt;
            inforMovtosPorHora[idx].acumNumRetiro       = inforMovtosPorHora[idx].numRetiro +numRetAnt;
            inforMovtosPorHora[idx].acumMontoRetiro     = inforMovtosPorHora[idx].montoRetiro +montoRetiroAnt;
            inforMovtosPorHora[idx].acumMontoRetiro     = inforMovtosPorHora[idx].montoRetiro +montoRetiroAnt;
            inforMovtosPorHora[idx].comisCons           = inforMovtosPorHora[idx].numCons * comisConsultas;
            inforMovtosPorHora[idx].comisRet            = inforMovtosPorHora[idx].numRetiro * comisRetiros;
            inforMovtosPorHora[idx].comisTotal          = inforMovtosPorHora[idx].comisCons + inforMovtosPorHora[idx].comisRet;
            inforMovtosPorHora[idx].comisAcum           = inforMovtosPorHora[idx].comisTotal +montoComisionAnt;

            numConsAnt      = inforMovtosPorHora[idx].acumNumCons;
            numRetAnt       = inforMovtosPorHora[idx].acumNumRetiro;
            montoRetiroAnt  = inforMovtosPorHora[idx].acumMontoRetiro;
            montoComisionAnt = inforMovtosPorHora[idx].comisAcum;
        }
        return(inforMovtosPorHora);
    }
}
