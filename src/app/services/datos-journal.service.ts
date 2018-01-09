/**
 * Created by jmacruz on 04/01/2018.
 */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';
import {camelCase} from "@swimlane/ngx-datatable/release/utils";

export var gPaginasJournal:any;
export var gDatosCortesJournal:any;

var nomComponente = "DatosJournalService";

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
     */
    public obtenCortesJournal(filtrosCons){

        console.log("filtrosCons:: (1) "+ JSON.stringify(filtrosCons));
        let fchTmpI:any;
        let fchTmpF:any;
        let fchIniFiltro:any;
        let fchFinFiltro:any;
        let expReg1:any = /(\d+)[-/](\d{2})[-/](\d{2})[-/](\d{2})[-/](\d{2})/;
        let expReg2:any = /(\d{2})[-/](\d{2})[-/](\d{4}) (\d{2}):(\d{2})/;
        let opc = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'};
        let filtrosConsTmp = filtrosCons;

        if (typeof(filtrosCons.timeStampStart) == "number"){
            fchIniFiltro    = new Date(filtrosCons.timeStampStart);
            fchFinFiltro    = new Date(filtrosCons.timeStampEnd);
            //filtrosConsTmp  = new Date(filtrosCons.timeStampEnd);
            fchIniFiltro    = (new Date(filtrosCons.timeStampStart)).toLocaleString(undefined, opc);
            fchFinFiltro    = (new Date(filtrosCons.timeStampEnd)).toLocaleString(undefined, opc);

            fchIniFiltro    = (new Date((fchIniFiltro).replace(expReg1, "$2/$3/$1 $4:$5")));
            fchFinFiltro    = (new Date((fchFinFiltro).replace(expReg1, "$2/$3/$1 $4:$5")));
            //filtrosConsTmp  = (new Date((fchFinFiltro).replace(expReg1, "$2/$3/$1 $4:$5")));

        }
        else {
            fchIniFiltro    = (new Date((filtrosCons.timeStampStart).replace(expReg1, "$2/$3/$1 $4:$5")));
            fchFinFiltro    = (new Date((filtrosCons.timeStampEnd).replace(expReg1, "$2/$3/$1 $4:$5")));
            //filtrosConsTmp  = (new Date((filtrosConsTmp.timeStampEnd).replace(expReg1, "$2/$3/$1 $4:$5")));
        }


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

    public obtenDatosUltimoCorteJournal(filtrosCons){
        console.log("filtrosCons:: (1) "+ JSON.stringify(filtrosCons));
        let fchTmpI:any;
        let fchTmpF:any;
        let fchIniFiltro:any;
        let fchFinFiltro:any;
        let expReg1:any = /(\d+)[-/](\d{2})[-/](\d{2})[-/](\d{2})[-/](\d{2})/;
        let expReg2:any = /(\d{2})[-/](\d{2})[-/](\d{4}) (\d{2}):(\d{2})/;
        let opc = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'};
        let filtrosConsTmp = filtrosCons;

        if (typeof(filtrosCons.startDate) == "number"){
            fchIniFiltro    = new Date(filtrosCons.startDate);
            fchFinFiltro    = new Date(filtrosCons.endDate);
            filtrosConsTmp  = new Date(filtrosCons.endDate);
        }else {
            fchIniFiltro    = (new Date((filtrosCons.startDate).replace(expReg1, "$2/$3/$1 $4:$5")));
            fchFinFiltro    = (new Date((filtrosCons.endDate).replace(expReg1, "$2/$3/$1 $4:$5")));
            filtrosConsTmp  = (new Date((filtrosConsTmp.endDate).replace(expReg1, "$2/$3/$1 $4:$5")));
        }

        console.log("filtrosCons:: (2) "+ JSON.stringify(filtrosCons));

        fchIniFiltro.setDate(fchIniFiltro.getDate() - 5);  // Resta cinco dias a la fecha inicial del rango.
        console.log("filtrosCons:: (3) "+ JSON.stringify(filtrosCons));
        fchTmpI = fchIniFiltro.toLocaleDateString(undefined, opc);
        console.log("filtrosCons:: (4) "+ JSON.stringify(filtrosCons));
        fchTmpF = fchFinFiltro.toLocaleDateString(undefined, opc);

        filtrosCons.timeStampStart   = fchTmpI.replace(expReg2 , "$3-$2-$1-$4-$5");
        console.log("filtrosCons:: (5) "+ JSON.stringify(filtrosCons));
        filtrosCons.timeStampEnd     = fchTmpF.replace(expReg2 , "$3-$2-$1-$4-$5");

        console.log("filtrosCons:: (6) "+ JSON.stringify(filtrosCons));

        let cortesJournal = this.obtenCortesJournal(filtrosCons);
        let ultimoCorte:any;

        cortesJournal.forEach( (row) => {
            ultimoCorte = row;
        });

        ultimoCorte.TimeStamp = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
        //console.log(ultimoCorte);
        filtrosCons = filtrosConsTmp;

        console.log("filtrosConsTmp:: "+ JSON.stringify(filtrosConsTmp));
        return(ultimoCorte);
    }

    public obtenFechaUltimoCorteJournal(filtrosCons){
        let datosCorte:any = this.obtenDatosUltimoCorteJournal(filtrosCons);
        return(datosCorte.TimeStamp);
    }
}