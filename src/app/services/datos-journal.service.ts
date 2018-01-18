/**
 * Created by jmacruz on 04/01/2018.
 */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { sprintf }  from "sprintf-js";
import * as moment from 'moment';

import { SoapService }      from './soap.service';
import {camelCase} from "@swimlane/ngx-datatable/release/utils";

export var gPaginasJournal:any;
export var gDatosCortesJournal:any;

var nomComponente = "DatosJournalService";
var diasIniRango:number = 30;

@Injectable()
export class DatosJournalService implements OnInit {

    constructor(public _soapService: SoapService){
        console.log(nomComponente+".constructor:: init");
    }

    ngOnInit(){}



    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        // TotalItems / TotalPages
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosCortesJournal:any, status){
        gDatosCortesJournal = datosCortesJournal;
    }

    /*
       Params:
             ipAtm:             Ip del ATM a consultar (xxx.xxx.xxx.xxx)
             timeStampStart:    Fecha y hora de inicio de la consulta (yyyy-mm-aa hh:mm)
             timeStampEnd:      Fecha y hora de inicio de la consulta (yyyy-mm-aa hh:mm)

       Notas: La fecha de los datos de los cortes esta en formato TimeStamp.
     */
    public obtenCortesJournal(filtrosCons){


        console.log("filtrosCons:: (1) "+ JSON.stringify(filtrosCons));

        filtrosCons.timeStampStart = this.restaDiasFecha(filtrosCons.timeStampStart);

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };
        let datosCortesJournal: any = [];

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);

        if (gPaginasJournal.TotalPages > 0) {
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
                datosCortesJournal = datosCortesJournal.concat(gDatosCortesJournal);
            }
        }

        return(datosCortesJournal);
    }


    public restaDiasFecha(prmFecha){

        let expReg1:any = /(\d+)[-/](\d{2})[-/](\d{2})[-/](\d{2})[-/](\d{2})/;
        let expReg2:any = /(\d{2})[-/](\d{2})[-/](\d{4}) (\d{2}):(\d{2})/;
        let opc         = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'};

        let ldFecha1:any;
        let ldFecha2:any;
        let ldFecha3:any;
        let ldFecha4:any;

        if (typeof(prmFecha) == "number"){
            ldFecha1 = new Date(prmFecha).toLocaleDateString(undefined, opc);
            ldFecha1 = (new Date((ldFecha1).replace(expReg2, "$3/$2/$1 $4:$5")));
        }else{
            ldFecha1 = (new Date((prmFecha).replace(expReg1, "$2/$3/$1 $4:$5")));
        }

        ldFecha2 = new Date(ldFecha1.setDate(ldFecha1.getDate() - diasIniRango));  // Resta cinco dias a la fecha inicial del rango.

        console.log(nomComponente+".restaDiasFecha:: ldFecha2["+ldFecha2+"]");

        if (typeof(prmFecha) == "number"){
            ldFecha3 = ldFecha2.getTime();
        }else{
            ldFecha4 = (ldFecha2.toLocaleDateString(undefined, opc)).replace(/[\/ :]/g, "-").split("-");
            ldFecha3 = sprintf("%04d-%02d-%02d-%02d-%02d", ldFecha4[2], ldFecha4[1], ldFecha4[0], ldFecha4[3], ldFecha4[4]);
        }

        return(ldFecha3);
    }

    public obtenDatosUltimoCorteJournal(filtrosCons){
        console.log("filtrosCons:: (1) "+ JSON.stringify(filtrosCons));

        let fchaX = this.restaDiasFecha(filtrosCons.timeStampStart);

        let cortesJournal = this.obtenCortesJournal(filtrosCons);
        let ultimoCorte:any;

        cortesJournal.forEach( (row) => {
            ultimoCorte = row;
        });

        ultimoCorte.TimeStamp = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});

        return(ultimoCorte);
    }

    public obtenFechaUltimoCorteJournal(filtrosCons){
        let datosCorte:any = this.obtenDatosUltimoCorteJournal(filtrosCons);
        return(datosCorte.TimeStamp);
    }
}