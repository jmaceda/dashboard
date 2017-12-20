// app/reportes/journal.component.ts
import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';
import { SoapService }                          from '../../services/soap.service';
import { sprintf }                              from "sprintf-js";
import { DataTable }                            from 'angular-4-data-table-fix';
import { DataTableTranslations }                from 'angular-4-data-table-fix';
import { DataTableResource }                    from 'angular-4-data-table-fix';
import { ExportToCSV }                          from '../../services/export-to-csv.service';


var ipAnterior:string = null;
var gFchInicioAnterior = null;
var gFchInicioFinAnterior = null;
var intervalId = null;
var tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.
var arrDatosJournal:any[] = [];

export var arrDatosServidor:any[]     = [];
export var arrDatosServidorInc:any[]  = [];
export var arrDatosServidorBack:any[] = [];
export var datosATMs  = [];
export var ipATMs  = [];
export var gNumRegsProcesados          = 0;
export var gNumPaginas                 = 0;
export var gNumRegistros               = 0;
export var aDatosJournal               = [];
export var gNumPaginasCompletas = 0;
export var numPagsCompletas:number    = 0;
export var numPaginaObtenida:number   = 0;

export const nomComponente:string = "JournalComponent";

@Component({
    selector   : 'app-journal',
    templateUrl: './journal.component.html',
    styleUrls  : ['./journal.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class JournalComponent implements OnInit  {

    public url: string = '/dataservices.asmx'; //  QA
    public itemResource = new DataTableResource(arrDatosJournal);
    public items = [];
    public itemCount = 0;

    public ipATM: string;
    public dFchIniProceso: string = '2017-09-10';
    public dFchFinProceso: string = '2017-09-10';
    public dHraIniProceso: string = '00-00';
    public dHraFinProceso: string = '23-59';
    public fechaHoraOperacion: string;
    public ipATMs:any[] = [];
    public regsLimite: number = 15;
    public nomArchExcel = "Journal_";

    columns = [
        { key: 'TimeStamp',         title: 'Fecha/Hora'},
        /*{ key: 'AtmName',        	title: 'ATM' },*/
        { key: 'CardNumber',        title: 'Núm. Tarjeta' },
        { key: 'Event',             title: 'Evento' },
        { key: 'OperationType',     title: 'Tipo de Oper' },
        { key: 'Amount',            title: 'Monto' },
        { key: 'Available',         title: 'Saldo' },
        { key: 'Surcharge',        	title: 'Surcharge' },
        { key: 'Aquirer',           title: 'Emisor' },
        { key: 'Data',              title: 'Datos' },
        { key: 'SwitchResponseCode',title: 'Respuesta Switch' },
        { key: 'HWErrorCode',       title: 'Descripción Error' },
        { key: 'TransactionCount',  title: 'Contador Transacción' },
        { key: 'Denomination',      title: 'Denominación' },
        { key: 'AccountId',        	title: 'Cuenta'},
        { key: 'AccountType',       title: 'Tipo Cuenta'},
        { key: 'AtmId',        		title: 'Id Atm', },
        { key: 'FlagCode',        	title: 'Flag Code' },
        { key: 'Arqc',        		title: 'Arqc' },
        { key: 'Arpc',        		title: 'Arpc' },
        { key: 'TerminalCaps',      title: 'Cap. Terminal' },
        { key: 'PosMode',        	title: 'Tipo POS' },
        { key: 'SwitchAtmId',       title: 'Id Switch Atm' },
        { key: 'Reference1',        title: 'Referencia 1' },
        { key: 'Reference2',        title: 'Referencia 2' },
        { key: 'Reference3',        title: 'Referencia 3' },
        { key: 'SerializedId',      title: 'Id Serial' },
        { key: 'Ip',        		title: 'Ip' },
        { key: 'Id',        		title: 'Id' },
        { key: 'Location',        	title: 'Ubicación'}
    ];

    paramsServicioNumPaginas:any = {ip: [], timeStampStart: '', timeStampEnd: '', events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1"};
    paramsServicioDatosLog:any = {ip: [], timeStampStart: '', timeStampEnd: '', events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1", page: 0};

    constructor(public _soapService: SoapService){
    }

    ngOnInit() {
    }

    nomServicioPaginas: string   = 'GetEjaLogDataLength';
    nomServicioDatosLog: string  = 'GetEjaLogPage';

    public pActualizaInfo(): void {

        // Se obtiene el nombre de la clase actual:  this.constructor.name
        console.log("this.paramsServicioNumPaginas.ip["+this.paramsServicioNumPaginas.ip[0]+"]");

        if (ipAnterior != this.paramsServicioNumPaginas.ip[0] ||
            (gFchInicioAnterior != this.paramsServicioNumPaginas.timeStampStart ||
            gFchInicioFinAnterior != this.paramsServicioNumPaginas.timeStampEnd) ||
            gFchInicioAnterior != this.dFchFinProceso || gFchInicioFinAnterior != this.dHraFinProceso){

            ipAnterior              = this.paramsServicioNumPaginas.ip[0];
            gFchInicioAnterior      = this.paramsServicioNumPaginas.timeStampStart;
            gFchInicioFinAnterior   = this.paramsServicioNumPaginas.timeStampEnd;
            this.numPaginas         = 0;
            arrDatosServidorBack    = [];
            gNumPaginas             = 0;
            gNumRegsProcesados      = 0;
            numPagsCompletas        = 0;
            gNumPaginasCompletas    = 0;
        }

        this.pDatosDelJournal('');

    }

    dUltimaActualizacion: string;

    public obtenNumeroDePaginasLog(result:object, status){
        console.log("obtenNumeroDePaginasLog:: Inicio");
        gNumPaginas   = JSON.parse(JSON.stringify(result)).TotalPages;
        gNumRegistros = JSON.parse(JSON.stringify(result)).TotalItems;
        console.log("obtenNumeroDePaginasLog:: gNumPaginas["+gNumPaginas+"]  gNumRegistros["+gNumRegistros+"]");
    }

    public numPaginas = 0;

    public obtenDatosJournal(result:any[], status){
        console.log("obtenDatosJournal:: Inicio");
        arrDatosServidorInc = null;  // Bloque de paginas con menor a 200 registros.
        numPaginaObtenida++;         // Numero de paginas obtenidas.

        console.log("obtenDatosJournal:: Pagina: ["+numPaginaObtenida+"]   Renglones: ["+result.length+"]");
        //if (result.length >= 200){
        console.log("obtenDatosJournal:: numPagsCompletas["+numPagsCompletas+"]   (gNumPaginas -1)["+(gNumPaginas -1)+"]");
        //arrDatosServidor += result;
        arrDatosServidor = arrDatosServidor.concat(result);

        /*
        if (numPagsCompletas < (gNumPaginas -1)){
            console.log("obtenDatosJournal:: (1)");
            numPagsCompletas++;      // Numero de paginas completas.
            if (arrDatosServidor == undefined){
                arrDatosServidor = result;
            }else{
                arrDatosServidor = arrDatosServidor.concat(result);
            }
        }else {
            console.log("obtenDatosJournal:: (2)");
            arrDatosServidorInc = result;
        }
        */

    }



    public pDatosDelJournal(params){

        this.paramsServicioNumPaginas.timeStampStart    = params.fchIni; //this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd      = params.fchFin; //this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.paramsServicioDatosLog.timeStampStart      = params.fchIni; //this.paramsServicioNumPaginas.timeStampStart;
        this.paramsServicioDatosLog.timeStampEnd        = params.fchFin; //this.paramsServicioNumPaginas.timeStampEnd;

        this.paramsServicioNumPaginas.ip[0]             = params.ip;
        this.paramsServicioDatosLog.ip[0]               = params.ip;

        //console.log(nomComponente+".pDatosDelJournal:: Consulta Journal ["+new Date()+"]");
        //console.log(nomComponente+".pDatosDelJournal:: paramsServicioNumPaginas<"+JSON.stringify(this.paramsServicioNumPaginas)+">");

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post(this.url, this.nomServicioPaginas, this.paramsServicioNumPaginas, this.obtenNumeroDePaginasLog);

        arrDatosServidor = [];
        /*
        numPaginaObtenida = 0;
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
            ipAnterior = this.paramsServicioNumPaginas.ip[0];
            this.numPaginas = 0;
        }
        */

        // *** Llama al servicio remoto para obtener la información solicitada del Journal.
        // ** this.numPaginas = Esta variable contiene el número de paginas completas de la última consulta.
        // ** gNumPaginas = El número máximo de información.
        if (gNumPaginas > 0) {
            for (let idx = 0; idx < gNumPaginas; idx++) {
                this.paramsServicioDatosLog.page = idx;
                console.log(nomComponente+".pDatosDelJournal::  this.paramsServicioDatosLog[" + JSON.stringify(this.paramsServicioDatosLog) + "]");
                this._soapService.post(this.url, this.nomServicioDatosLog, this.paramsServicioDatosLog, this.obtenDatosJournal);
            }


            // Respalda el arreglo con las paginas completas (200 registros).
            //console.log("gNumRegistros [" + gNumRegistros + "]   gNumPaginasCompletas[" + gNumPaginasCompletas + "]");
            //if (gNumRegistros > 200 && (gNumPaginas - 1) > gNumPaginasCompletas) { // && arrDatosServidorBack.length == 0){
            //    arrDatosServidorBack = arrDatosServidor;
                /* la primera consulta */
            //}

            //arrDatosServidor = arrDatosServidorBack;
            //gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
            this.obtenDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

            //if (arrDatosServidorInc.length > 0) {
            //    this.numPaginas = gNumPaginas - 1;
            //}

            //gNumPaginasCompletas = (gNumPaginas - 1);
        }else{
            this.obtenDatosLog([{}], gNumPaginas);
        }

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);

    }

    public TimeStamp;
    public CardNumber;
    public Id;
    public datosLog:any[] = [];

    public obtenDatosLog(result:object, numPag:number): void {
        this.datosLog           = JSON.parse(JSON.stringify(result));
        this.numDatosLog        = this.datosLog.length;
        this.datosLog.pop();

        this.itemResource       = new DataTableResource(this.datosLog);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});

        this.exportaJournal2Excel();
    }

    public numDatosLog:number = 0;

    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
        console.log(nomComponente+".reloadItems:: "+this.datosLog.length)
    }

    // special properties:

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    exportaJournal2Excel(nomArchExcel:string = this.nomArchExcel){  //exportaJournal2Excel(event){

        let arr2Excel:any[] = [];
        this.datosLog.forEach((reg)=> {

            // Datos para exportar al excel
            let date = new Date(reg.TimeStamp);
            let tmpFechaOper = sprintf("%04d-%02d-%02d %02d:%02d:%02d",
                                                date.getFullYear(), date.getMonth() + 1, date.getDate(),
                                                date.getHours(), date.getMinutes(), date.getSeconds());

            arr2Excel.push(
                {
                    "Fecha/Hora":                           tmpFechaOper,
                    "IP":                                   reg.Ip,
                    "ATM":                                  reg.AtmName,
                    "Tarjeta número":                       reg.CardNumber,
                    "Tipo de Operación":                    reg.OperationType,
                    "Contador de Transacción":              reg.TransactionCount,
                    "Monto":                                reg.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"}),
                    "Código de error de HW":                reg.HWErrorCode,
                    "Denominación":                         reg.Denomination,
                    "Emisor":                               reg.Aquirer,
                    "Evento":                               reg.Event,
                    "Cuenta Número":                        reg.AccountId,
                    "Tipo de Cuenta":                       reg.AccountType,
                    "Ubicación":                            reg.Location,
                    "ARQC":                                 reg.Arqc,
                    "ARPC":                                 reg.Arpc,
                    "Flag Code":                            reg.FlagCode,
                    "Terminal Capabilities":                reg.TerminalCaps,
                    "POS Code":                             reg.PosMode,
                    "Id. Autorización":                     reg.AuthId,
                    "Código de Autorización del Switch":    reg.SwitchAuthCode,
                    "Surcharge":                            reg.Surcharge,
                    "Codigo de Respuesta del Switch":       reg.SwitchResponseCode,
                    "Datos":                                reg.Data,
                    "Disponible":                           reg.Available.toLocaleString("es-MX",{style:"currency", currency:"MXN"}),
                    "Switch ATM Id":                        reg.SwitchAtmId,
                    "Referencia 1":                         reg.Reference1,
                    "Referencia 2":                         reg.Reference2,
                    "Referencia 3":                         reg.Reference3
                    /*AtmId:              reg.AtmId,
                    SerializedId:       reg.SerializedId,
                    Id:                 reg.Id,*/
                }
            )
        });

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSV();
            exporter.exportAllToCSV(arr2Excel, nomArchExcel);
        }
    }

    parametrosConsulta(infoRecibida){
        console.log(nomComponente+".parametrosConsulta:: Se va mostrar la información enviada desde el componente Params");
        console.log(nomComponente+".parametrosConsulta:: Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
        console.log(nomComponente+".parametrosConsulta:: Se mostro la información enviada desde el componente Params");
        let parametrosConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let ipParam   = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchIniParam+"]");

        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(nomComponente+".parametrosConsulta:: ["+fchFinParam+"]");

        let datosParam:any = {fchIni: fchIniParam, fchFin: fchFinParam, ip: ipParam};

        this.nomArchExcel = "Journal_" + ipParam + "_" + (new Date().toLocaleDateString("es-MX")).replace(/\//g,"-") + ".csv";
        console.log("nomArchExcel:: "+this.nomArchExcel);

        this.pDatosDelJournal(datosParam);
    }
}

function comparar ( a, b ){ return a - b;}


