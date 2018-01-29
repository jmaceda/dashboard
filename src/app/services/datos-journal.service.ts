import { Injectable }               from '@angular/core';
import { OnInit }                   from '@angular/core';

import { sprintf }                  from "sprintf-js";
import * as moment                  from 'moment';
import { ExportToCSVService }       from './export-to-csv.service';
import { SoapService }              from './soap.service';
import {camelCase}                  from "@swimlane/ngx-datatable/release/utils";

export var gPaginasJournal:any;
export var gDatosCortesJournal:any;

var nomComponente = "DatosJournalService";
var diasIniRango:number = 10;

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

    public obtenColumnasVista(){
        let columnas = [
                { key: 'TimeStamp',         title: 'Fecha/Hora'},
                { key: 'Ip',        		title: 'IP' },
                { key: 'AtmName',        	title: 'ATM' },
                { key: 'CardNumber',        title: 'Tarjeta número' },
                { key: 'OperationType',     title: 'Tipo de Operación' },
                { key: 'TransactionCount',  title: 'Contador Transacción' },
                { key: 'Amount',            title: 'Monto' },
                { key: 'HWErrorCode',       title: 'Código de Error de HW' },
                { key: 'Denomination',      title: 'Denominación' },
                { key: 'Aquirer',           title: 'Emisor' },
                { key: 'Event',             title: 'Evento', filtering: {filterString: '', placeholder: 'Evento'}},
                { key: 'AccountId',        	title: 'Cuenta Número'},
                { key: 'AccountType',       title: 'Tipo de Cuenta'},
                { key: 'Location',        	title: 'Ubicación'},
                { key: 'Arqc',        		title: 'Arqc' },
                { key: 'Arpc',        		title: 'Arpc' },
                { key: 'FlagCode',        	title: 'Flag Code' },
                { key: 'TerminalCaps',      title: 'Cap. Terminal' },
                { key: 'PosMode',        	title: 'POS Code' },
                { key: 'AuthId',        	title: 'Id. Autorización' },
                { key: 'SwitchAuthCode',    title: 'Código de Autorización del Switch' },
                { key: 'Surcharge',        	title: 'Surcharge' },
                { key: 'SwitchResponseCode',title: 'Código de Respuesta del Switch' },
                { key: 'Data',              title: 'Datos' },
                { key: 'Available',         title: 'Disponible' },
                { key: 'SwitchAtmId',       title: 'Switch ATM Id' },
                { key: 'Reference1',        title: 'Referencia 1' },
                { key: 'Reference2',        title: 'Referencia 2' },
                { key: 'Reference3',        title: 'Referencia 3' },
                /*
                 { key: 'AtmId',        		title: 'Id Atm', },
                 { key: 'SerializedId',      title: 'Id Serial' },
                 { key: 'Id',        		title: 'Id' },
                 */
            ];

        return(columnas);
    }

    public exportaJournal2Excel(dataJournalRedBlu){

        let arr2Excel:any[] = [];
        let tmpFchHora:any;
        let tmpMonto:any;
        let tmpMontoDisponible:any;
        let ftoFecha:any    = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};

        dataJournalRedBlu.forEach((reg)=> {
            tmpFchHora          = new Date(reg.TimeStamp).toLocaleString(undefined, ftoFecha);
            tmpMonto            = reg.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpMontoDisponible  = reg.Available.toLocaleString("es-MX",{style:"currency", currency:"MXN"});

            arr2Excel.push(
                {
                    "Fecha/Hora":           	            tmpFchHora,
                    "IP":                   	            reg.Ip,
                    "ATM":                  	            reg.AtmName,
                    "Atm Id":             	                reg.AtmId,
                    "Tarjeta número":       	            reg.CardNumber,
                    "Tipo de Operación":    	            reg.OperationType,
                    "Contador de Transacción":              reg.TransactionCount,
                    "Monto":                                tmpMonto,
                    "Código de error de HW":                reg.HWErrorCode,
                    "Denominación":       		            reg.Denomination,
                    "Emisor":            		            reg.Aquirer,
                    "Evento":              		            reg.Event,
                    "Cuenta Número":          	            reg.AccountId,
                    "Tipo de Cuenta":        	            reg.AccountType,
                    "Ubicacion":				            reg.Location,
                    "ARQC":               		            reg.Arqc,
                    "ARPC":               		            reg.Arpc,
                    "Flag Code":           		            reg.FlagCode,
                    "Terminal Capabilities":                reg.TerminalCaps,
                    "POS Code":            		            reg.PosMode,
                    "Código de Autorización del Switch":	reg.SwitchAuthCode,
                    "Surcharge":          					reg.Surcharge.toLocaleString("es-MX"),
                    "Código de Respuesta del Switch": 		reg.SwitchResponseCode,
                    "Datos":               					reg.Data,
                    "Disponible":          					tmpMontoDisponible,
                    "Switch ATM Id":        				reg.SwitchAtmId,
                    "Referencia 1":         				reg.Reference1,
                    "Referencia 2":         				reg.Reference2,
                    "Referencia 3":         				reg.Reference3,
                     //SerializedId:       reg.SerializedId,
                     //Id:                 reg.Id
                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'Journal.csv');
        }
    }
}