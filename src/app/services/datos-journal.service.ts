/**
 * Created by jmacruz on 04/01/2018.
 */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';

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

    public obtenCortesJournal(filtrosCons){

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };
        let datosCortesJournal: any = [];

        console.log("paramsCons: >"+JSON.stringify(paramsCons)+"<");
        console.log("---> Inicio: "+new Date());
        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);

        if (gPaginasJournal.TotalPages > 0) {

            //this.arrDatosCortesEtv = [];

            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
                datosCortesJournal = datosCortesJournal.concat(gDatosCortesJournal);
            }
        }

        console.log(nomComponente+".obtenCortesJournal:: "+JSON.stringify(datosCortesJournal));
        return(datosCortesJournal);

    }

    public obtenUltimoCorteJournal(filtrosCons){
        let cortesJournal = this.obtenCortesJournal(filtrosCons);
        let ultimoCorte:any;

        //console.log(nomComponente+".obtenUltimoCorteJournal:: ["+JSON.stringify(cortesJournal)+"]");

        cortesJournal.forEach( (row) => {
            ultimoCorte = row;
        });

        ultimoCorte.TimeStamp = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
        console.log(nomComponente+".obtenUltimoCorteJournal:: ["+JSON.stringify(ultimoCorte)+"]");
    }

}