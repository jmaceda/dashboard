import { Injectable }               from '@angular/core';
import { OnInit }                   from '@angular/core';

import { sprintf }                  from "sprintf-js";
import * as moment                  from 'moment';
import { ExportToCSVService }       from './export-to-csv.service';
import { SoapService }              from './soap.service';
import {camelCase}                  from "@swimlane/ngx-datatable/release/utils";

export var gPaginasJournal:any;
export var gDatosJournal:any;

var nomComponente = "DatosJournalService";
var diasIniRango:number = 10;
var iva:number = 16;


@Injectable()
export class DatosJournalService implements OnInit {

    constructor(public _soapService: SoapService){
        console.log(nomComponente+".constructor:: init");
    }

    ngOnInit(){}

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosCortesJournal:any, status){
        gDatosJournal = datosCortesJournal;
    }

    public obtenCortesJournal(filtrosCons){

        console.log("filtrosCons:: (1) "+ JSON.stringify(filtrosCons));
        let paramsCons: any = {};

        for (let idx=1; idx < 4; idx++) {
            filtrosCons.timeStampStart = this.restaDiasFecha(filtrosCons.timeStampStart, (idx*10));

            paramsCons = {
                ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
                events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
            };

            this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);
            if (gPaginasJournal.TotalPages > 0){
                break;
            }
        }

        if (gPaginasJournal.TotalPages == 0){
            paramsCons.timeStampStart = "2018-01-01-00-00";
        }

        let datosCortesJournal: any = [];

        if (gPaginasJournal.TotalPages > 0) {
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosCortesJournal = datosCortesJournal.concat(gDatosJournal);
            }
        }

        return(datosCortesJournal);
    }


    public restaDiasFecha(prmFecha, numDiasResta){

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

        if (numDiasResta > 0){
            diasIniRango = numDiasResta;
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

    // Obten monto de Comisiones del día (Retiros, Consultas y Depósitos)
    public obtenComisionesPorAtm(infoAtm){

        let ftoFchSys:any           = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let ftoHora:any             = {hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let expFchSys:any           = /(\d+)\/(\d+)\/(\d+)/;
        let expHora:any             = /(\d+):(\d+):(\d+)/;
        let fchSys:any              = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');
        let timeStampStart:string   = fchSys + "-00-00";
        let timeStampEnd:string     = fchSys + "-23-59";
        let comisonesAtm:any        = {
            "numRetiros": 0,"comisionesRetiros": 0,"montoRetiros": 0,"hraPrimerRetiro": "","hraUtimoRetiro": "",
            "numConsultas": 0,"comisionesConsultas": 0,"hraPrimeraConsulta": "","hraUtimaConsulta": "", 'totalComisiones': 0,
            'numDepositos': 0, 'montoDepositos': 0,"hraPrimerDeposito": "","hraUtimoDeposito": ""
        };
        let fchMovto:string         = "";

        // Obten número de paginas de Journal de un ATM
        let paramsCons: any = {
            ip: [infoAtm.Ip], timeStampStart: timeStampStart, timeStampEnd: timeStampEnd,
            events: ["Withdrawal", "BalanceCheck", "CashManagement"], minAmount: -1, maxAmount: -1,
            authId: -1, cardNumber: -1, accountId: -1
        };
        console.log(JSON.stringify(paramsCons));
        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        // Obten datos del Journal de un ATM
        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);
                console.log("Se van a calcular las comisiones");
                //console.log(JSON.stringify(gDatosJournal));
                /*
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false)
                .then(result => {
                    console.log(result);
                */


                    gDatosJournal.forEach( (reg) => {

                        comisonesAtm.Description = infoAtm.Description;
                        comisonesAtm.idAtm       = reg.AtmName;
                        //comisonesAtm.ipAtm = reg.Ip;

                        if (reg.SwitchResponseCode == 0) {
                            fchMovto = new Date(reg.TimeStamp).toLocaleString('es-sp', ftoHora); //.replace(expHora, '');
                            switch (reg.OperationType) {
                                case 'BalanceCheck': {
                                    comisonesAtm.numConsultas++;
                                    comisonesAtm.comisionesConsultas += (reg.Surcharge / ((iva / 100) + 1));
                                    comisonesAtm.hraPrimeraConsulta = (comisonesAtm.hraPrimeraConsulta == '') ? fchMovto : comisonesAtm.hraPrimeraConsulta;
                                    comisonesAtm.hraUtimaConsulta = fchMovto;
                                    comisonesAtm.totalComisiones += (reg.Surcharge / ((iva / 100) + 1));
                                    break;
                                }
                                case 'Withdrawal': {
                                    comisonesAtm.numRetiros++;
                                    comisonesAtm.comisionesRetiros += (reg.Surcharge / ((iva / 100) + 1));
                                    comisonesAtm.montoRetiros += reg.Amount;
                                    comisonesAtm.hraPrimerRetiro = (comisonesAtm.hraPrimerRetiro == '') ? fchMovto : comisonesAtm.hraPrimerRetiro;
                                    comisonesAtm.hraUtimoRetiro = fchMovto;
                                    comisonesAtm.totalComisiones += (reg.Surcharge / ((iva / 100) + 1));
                                    break;
                                }
                                case 'CashManagement': {
                                    comisonesAtm.numDepositos++;
                                    comisonesAtm.montoDepositos += reg.Amount;
                                    comisonesAtm.hraPrimerDeposito = (comisonesAtm.hraPrimerDeposito == '') ? fchMovto : comisonesAtm.hraPrimerDeposito;
                                    comisonesAtm.hraUtimoDeposito = fchMovto;
                                    break;
                                }
                            }
                        }
                    });
                /*
                }).catch(error => {
                    console.log(error);
                });
                */
            }
            //console.log("comisionesAtm -->"+JSON.stringify(comisonesAtm)+"<--");
            //this.dataJournalRedBlu = datosJournal;
        }
        return(comisonesAtm);
    }
}
// {infoAtm.Desc, NumRetiros, ComisRetiros, hraPrimerRet, hrasUltRet, NumCons, ComisCons,, hraPrimerCons, hrasUltCons, TotComis, NumDepos, MontoDepos)