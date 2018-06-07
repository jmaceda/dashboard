import { Injectable }               from '@angular/core';
import { OnInit }                   from '@angular/core';

import { sprintf }                  from "sprintf-js";
import * as moment                  from 'moment';
import { ExportToCSVService }       from './export-to-csv.service';
import { SoapService }              from './soap.service';

export var gPaginasJournal:any;
export var gDatosJournal:any;

var nomComponente = "DatosJournalService";
var diasIniRango:number = 10;
var iva:number = 16;


@Injectable()
export class DatosJournalService implements OnInit {

    constructor(public _soapService: SoapService){}

    ngOnInit(){}

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosCortesJournal:any, status){
        gDatosJournal = datosCortesJournal;
    }

    public obtenCortesJournal(filtrosCons){

        let paramsCons: any = {};
        console.log(nomComponente+".obtenCortesJournal:: filtrosCons["+JSON.stringify(filtrosCons)+"]");
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
            ldFecha1 = new Date(prmFecha).toLocaleDateString('sp-SP', opc);
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
            console.log(nomComponente+".restaDiasFecha:: Error en la siguiente línea con sprintf 'expecting number but found string'");
            console.log(nomComponente+".restaDiasFecha:: prmFecha["+prmFecha+"]  ldFecha2["+ldFecha2+"]  ldFecha4["+ldFecha4+"]");
            ldFecha3 = sprintf("%04d-%02d-%02d-%02d-%02d", ldFecha4[2], ldFecha4[1], ldFecha4[0], ldFecha4[3], ldFecha4[4]);
        }
        return(ldFecha3);
    }

    public obtenDatosUltimoCorteJournal(filtrosCons){

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
            ];

        return(columnas);
    }

    public exportaJournal2Excel(dataJournalRedBlu){
        console.log(nomComponente+".exportaJournal2Excel:: Inicio");
        let arr2Excel:any[] = [];
        let tmpFchHora:any;
        let tmpMonto:any;
        let tmpMontoDisponible:any;
        let ftoFecha:any    = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let ftoFchSys:any   = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let ftoHora:any     = {hour: '2-digit', minute: '2-digit', second: '2-digit'};

        dataJournalRedBlu.forEach((reg)=> {
            tmpFchHora          = new Date(reg.TimeStamp).toLocaleString(undefined, ftoFecha);
            tmpMonto            = reg.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpMontoDisponible  = reg.Available.toLocaleString("es-MX",{style:"currency", currency:"MXN"});

            arr2Excel.push(
                {
                    "Fecha/Hora":           	            tmpFchHora,
                    "IP":                   	            reg.Ip,
                    "ATM":                  	            reg.AtmName,
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
                    "Id. Autorización":                     reg.AuthId,
                    "Código de Autorización del Switch":	reg.SwitchAuthCode,
                    "Surcharge":          					reg.Surcharge.toLocaleString("es-MX"),
                    "Código de Respuesta del Switch": 		reg.SwitchResponseCode,
                    "Datos":               					reg.Data,
                    "Disponible":          					tmpMontoDisponible,
                    "Switch ATM Id":        				reg.SwitchAtmId,
                    "Referencia 1":         				reg.Reference1,
                    "Referencia 2":         				reg.Reference2,
                    "Referencia 3":         				reg.Reference3,
                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'Journal.csv');
        }

        return(true);
    }

    // Obten monto de Comisiones del día (Retiros, Consultas y Depósitos)
    public obtenComisionesPorAtm(paramsConsulta, infoAtm){

        let ftoFchSys:any           = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let ftoHora:any             = {hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let expFchSys:any           = /(\d+)\/(\d+)\/(\d+)/;
        let expHora:any             = /(\d+):(\d+):(\d+)/;
        let fchSys:any              = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');
        let timeStampStart:string   = fchSys + "-00-00";
        let timeStampEnd:string     = fchSys + "-23-59";
        let comision:number         = 0;

        timeStampStart   = paramsConsulta.timeStampStart;
        timeStampEnd     = paramsConsulta.timeStampEnd;

        let comisonesAtm:any        = {
            "numRetiros": 0,"comisionesRetiros": 0,"montoRetiros": 0,"hraPrimerRetiro": "","hraUtimoRetiro": "",
            "numConsultas": 0,"comisionesConsultas": 0,"hraPrimeraConsulta": "","hraUtimaConsulta": "", 'totalComisiones': 0,
            'numDepositos': 0, 'montoDepositos': 0,"hraPrimerDeposito": "","hraUtimoDeposito": "",
            "errConsultas": 0, "errComisionConsultas": 0, "errPrimeraConsulta": "", "errUltimaConsulta": "",
            "errRetiros": 0, "errMontoRetiros": 0, "errComisionRetiros": 0, "errPrimerRetiro": "", "errUltimoRetiro": "", "errTotal": 0
        };
        let fchMovto:string         = "";

        let paramsCons: any = {
            ip: [infoAtm.Ip], timeStampStart: timeStampStart, timeStampEnd: timeStampEnd,
            events: ["Withdrawal", "BalanceCheck", "CashManagement", "Exception"], minAmount: -1, maxAmount: -1,
            authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);

                gDatosJournal.forEach( (reg) => {

                    if ( reg.SwitchResponseCode >= 1000) {}
                    if (reg.SwitchResponseCode >= 1000) {
                        if (reg.Event.substring(0,15) != "CASH MANAGEMENT") {}
                    }
                    comisonesAtm.Description    = infoAtm.Description;
                    comisonesAtm.idAtm          = reg.AtmName;
                    comision                    = (reg.Surcharge / ((iva / 100) + 1));
                    fchMovto = new Date(reg.TimeStamp).toLocaleString('es-sp', ftoHora); //.replace(expHora, '');


                    switch (reg.OperationType) {
                        case 'BalanceCheck': {
                            if (reg.SwitchResponseCode == 0) {
                                comisonesAtm.numConsultas++;
                                comisonesAtm.comisionesConsultas   += comision;
                                comisonesAtm.totalComisiones       += comision;
                                comisonesAtm.hraPrimeraConsulta     = (comisonesAtm.hraPrimeraConsulta == '') ? fchMovto : comisonesAtm.hraPrimeraConsulta;
                                comisonesAtm.hraUtimaConsulta       = fchMovto;
                            }
                            break;
                        }
                        case 'Withdrawal': {
                            if (reg.SwitchResponseCode == 0) {
                                comisonesAtm.numRetiros++;
                                comisonesAtm.comisionesRetiros     += comision;
                                comisonesAtm.totalComisiones       += comision;
                                comisonesAtm.montoRetiros          += reg.Amount;
                                comisonesAtm.hraPrimerRetiro        = (comisonesAtm.hraPrimerRetiro == '') ? fchMovto : comisonesAtm.hraPrimerRetiro;
                                comisonesAtm.hraUtimoRetiro         = fchMovto;
                            }
                            break;
                        }
                        case 'CashManagement': {
                            if (reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito") {
                                comisonesAtm.numDepositos++;
                                comisonesAtm.montoDepositos        += reg.Amount;
                                comisonesAtm.hraPrimerDeposito      = (comisonesAtm.hraPrimerDeposito == '') ? fchMovto : comisonesAtm.hraPrimerDeposito;
                                comisonesAtm.hraUtimoDeposito       = fchMovto;
                            }
                            break;
                        }

                        case 'Exception': {
							let regexErrCom = /Problemas de comunicación|Error de conexión|Tiempo expirado/g
                            if (reg.Event == "Withdrawal"){
								if (regexErrCom.test(reg.HWErrorCode)){
                                    comisonesAtm.errRetiros++;
                                    comisonesAtm.errMontoRetiros       += reg.Amount;
                                    comisonesAtm.errComisionRetiros    += comision;
                                    comisonesAtm.errPrimerRetiro        = (comisonesAtm.errPrimerRetiro == '') ? fchMovto : comisonesAtm.errPrimerRetiro;
                                    comisonesAtm.errUltimoRetiro        = fchMovto;
                                    comisonesAtm.errTotal++;
                                }
                            }else if (reg.Event == "BalanceCheck"){
								if (regexErrCom.test(reg.HWErrorCode)){ 
                                    comisonesAtm.errConsultas++;
                                    comisonesAtm.errComisionConsultas  += comision;
                                    comisonesAtm.errPrimeraConsulta     = (comisonesAtm.errPrimeraConsulta == '') ? fchMovto : comisonesAtm.errPrimeraConsulta;
                                    comisonesAtm.errUltimaConsulta      = fchMovto;
                                    comisonesAtm.errTotal++;
                                }
                            }
                        }
                    }
                });
            }
        }
        return(comisonesAtm);
    }


    public exportaComisiones2Excel(opersFinancieras){

        let arr2Excel:any[] = [];
        let tmpComisionesRetiroso:any;
        let tmpComisionesConsultas:any;
        let tmpTotalComisiones:any;
        let tmpMontoDepositos:any;
        let tmpMontoRetiroso:any;

        let ftoFecha:any    = {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};

        opersFinancieras.forEach((reg)=> {
            tmpComisionesRetiroso   = reg.comisionesRetiros.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpMontoRetiroso        = reg.montoRetiros.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpComisionesConsultas  = reg.comisionesConsultas.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpTotalComisiones      = reg.totalComisiones.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
            tmpMontoDepositos       = reg.montoDepositos.toLocaleString("es-MX",{style:"currency", currency:"MXN"});

            arr2Excel.push(
                {
                    "Ubicación":           	                reg.Description,
                    "Retiros":                   	        reg.numRetiros,
                    "Comisiones Retiro":                  	tmpComisionesRetiroso,
                    "Monto Retiros":             	        tmpMontoRetiroso,
                    "Primer Retiro":       	                reg.hraPrimerRetiro,
                    "Último Retiro":    	                reg.hraUtimoRetiro,
                    "Consultas":                   	        reg.numConsultas,
                    "Comisiones Consulta":                  tmpComisionesConsultas,
                    "Primera Consulta":       	            reg.hraPrimeraConsulta,
                    "Última Consulta":    	                reg.hraUtimaConsulta,
                    "Total Comisiones":                  	tmpTotalComisiones,
                    "Errores Comunicación":                 reg.errTotal,
                    "Depósitos":                   	        reg.numDepositos,
                    "Monto Depósitos":                  	tmpMontoDepositos,
                    "Primer Depósito":       	            reg.hraPrimerDeposito,
                    "Último Depósito":    	                reg.hraUtimoDeposito,
                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'Operaciones.csv');
        }
    }


    public exportaReporteMensual2Excel(datosReporteMensual){
        let arr2Excel:any[] = [];

        datosReporteMensual.forEach((reg)=> {

            arr2Excel.push(
                {
                    "Concepto"  :    reg.concepto,
                    "$20"       :    reg.b20,
                    "$50"       :    reg.b50,
                    "$100"      :    reg.b100,
                    "$200"      :    reg.b200,
                    "$500"      :    reg.b500,
                    "$1000"     :    reg.b1000,
                    "Opers"     :    reg.opers,
                    "Monto"     :    reg.monto
                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'ReporteEfectivo.csv');
        }
    }

}
