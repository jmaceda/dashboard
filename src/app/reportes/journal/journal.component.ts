// app/reportes/journal.component.ts
import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';
import { SoapService }                          from '../../services/soap.service';
import { sprintf }                              from "sprintf-js";
import { DataTable }                            from 'angular-4-data-table-fix';
import { DataTableTranslations }                from 'angular-4-data-table-fix';
import { DataTableResource }                    from 'angular-4-data-table-fix';
import { Angular2Csv }                          from 'angular2-csv/Angular2-csv';
//import * as XLSX from 'xlsx';

//import { ExcelService } from './excel.service';

var ipAnterior:string                   = null;
var gFchInicioAnterior                  = null;
var gFchInicioFinAnterior               = null;
var intervalId                          = null;
var tiempoRefreshDatos:number           = (1000 * 30 * 1); // Actualiza la información cada minuto.
var arrDatosJournal:any[]               = [];

export var arrDatosServidor:any[]       = [];
export var arrDatosServidorInc:any[]    = [];
export var arrDatosServidorBack:any[]   = [];
export var datosATMs                    = [];
export var ipATMs                       = [];
export var gNumRegsProcesados           = 0;
export var gNumPaginas                  = 0;
export var gNumRegistros                = 0;
export var aDatosJournal                = [];
export var gNumPaginasCompletas         = 0;
export var numPagsCompletas:number      = 0;
export var numPaginaObtenida:number     = 0;

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

    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string = '/dataservices.asmx'; //  QA
    //public url: string = '/services/dataservices.asmx'; // Prod

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

    public paramsServicioNumPaginas: {
        ip            : any[],
        timeStampStart: string,
        timeStampEnd  : string,
        events        : string,
        minAmount     : string,
        maxAmount     : string,
        authId        : string,
        cardNumber    : string,
        accountId     : string
    } = {
        ip            : ['11.40.2.2'],
        timeStampStart: this.dFchIniProceso + "-" + this.dHraIniProceso,
        timeStampEnd  : this.dFchFinProceso + "-" + this.dHraFinProceso,
        events        : "-1",
        minAmount     : "-1",
        maxAmount     : "-1",
        authId        : "-1",
        cardNumber    : "-1",
        accountId     : "-1"
    };


    paramsServicioDatosLog: {
        ip            : any[],
        timeStampStart: string,
        timeStampEnd  : string,
        events        : string,
        minAmount     : string,
        maxAmount     : string,
        authId        : string,
        cardNumber    : string,
        accountId     : string,
        page          : number
    } = {
        ip            : this.paramsServicioNumPaginas.ip,
        timeStampStart: this.dFchIniProceso + "-" + this.dHraIniProceso,
        timeStampEnd  : this.dFchFinProceso + "-" + this.dHraFinProceso,
        events        : "-1",
        minAmount     : "-1",
        maxAmount     : "-1",
        authId        : "-1",
        cardNumber    : "-1",
        accountId     : "-1",
        page          : 0
    };


    constructor(public _soapService: SoapService){//}, private excelService: ExcelService){
        //this.excelService = excelService;

    }

    ngOnInit() {

        this.obtieneIpATMs();

        this.fechaHoraOperacion         = this.dFchIniProceso + " " + this.dHraIniProceso.replace("-", ":") + "  /  " +  this.dFchFinProceso + " " + this.dHraFinProceso.replace("-", ":");

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dFchIniProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);
        this.dFchFinProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);

        this.paramsServicioNumPaginas.timeStampStart = this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.ipATM = '11.40.2.2';
        ipAnterior = this.paramsServicioNumPaginas.ip[0];
        gFchInicioAnterior = this.paramsServicioNumPaginas.timeStampStart;
        gFchInicioFinAnterior = this.paramsServicioNumPaginas.timeStampEnd;

        //this.pDatosDelJournal();
    }

    public obtieneIpATMs(){
        //console.log('obtenIpATMs:: Inicio');
        ipATMs  = [];
        this._soapService.post(this.url, 'GetEjaFilters', '', this.GetEjaFilters);
        this.ipATMs = ipATMs;
        this.ipATMs = ipATMs.sort(comparar);
        //console.log('obtenIpATMs:: Se ejecuto la consulta');
    }

    public GetEjaFilters(result:any, status){

        var ipATM = '';

        for(let idx = 0; idx < result.length; idx++){
            for(let idx2 = 0; idx2 < result[idx].length; idx2++){
                if(idx === 0){
                    ipATM = result[idx][idx2];
                    ipATMs[ipATMs.length] = result[idx][idx2];
                }else{
                    datosATMs.push(result[idx][idx2] + "    ("+ result[0][idx2] + ")");
                }
            }
        }
    }
    public nomServicioPaginas: string   = 'GetEjaLogDataLength';
    public nomServicioDatosLog: string  = 'GetEjaLogPage';

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


    public dUltimaActualizacion: string;
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

    }



    public pDatosDelJournal(params){

        this.paramsServicioNumPaginas.timeStampStart = params.fchIni; //this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = params.fchFin; //this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.paramsServicioDatosLog.timeStampStart = params.fchIni; //this.paramsServicioNumPaginas.timeStampStart;
        this.paramsServicioDatosLog.timeStampEnd   = params.fchFin; //this.paramsServicioNumPaginas.timeStampEnd;

        this.paramsServicioNumPaginas.ip[0] = params.ip;
        this.paramsServicioDatosLog.ip[0] = params.ip;

        console.log("Consulta Journal ["+new Date()+"]");
        console.log("pDatosDelJournal:: paramsServicioNumPaginas<"+JSON.stringify(this.paramsServicioNumPaginas)+">");
        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post(this.url, this.nomServicioPaginas, this.paramsServicioNumPaginas, this.obtenNumeroDePaginasLog);

        numPaginaObtenida = 0;
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
            ipAnterior = this.paramsServicioNumPaginas.ip[0];
            this.numPaginas = 0;
        }

        // *** Llama al servicio remoto para obtener la información solicitada del Journal.
        // ** this.numPaginas = Esta variable contiene el número de paginas completas de la última consulta.
        // ** gNumPaginas = El número máximo de información.
        if (gNumPaginas > 0) {
            for (let idx = gNumPaginasCompletas; idx < gNumPaginas; idx++) {
                this.paramsServicioDatosLog.page = idx;
                console.log("pDatosDelJournal::  this.paramsServicioDatosLog[" + JSON.stringify(this.paramsServicioDatosLog) + "]");
                this._soapService.post(this.url, this.nomServicioDatosLog, this.paramsServicioDatosLog, this.obtenDatosJournal)
            }


            // Respalda el arreglo con las paginas completas (200 registros).
            console.log("gNumRegistros [" + gNumRegistros + "]   gNumPaginasCompletas[" + gNumPaginasCompletas + "]");
            if (gNumRegistros > 200 && (gNumPaginas - 1) > gNumPaginasCompletas) { // && arrDatosServidorBack.length == 0){
                arrDatosServidorBack = arrDatosServidor;
                /* la primera consulta */
            }

            arrDatosServidor = arrDatosServidorBack;
            gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
            this.obtenDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

            if (arrDatosServidorInc.length > 0) {
                this.numPaginas = gNumPaginas - 1;
            }

            gNumPaginasCompletas = (gNumPaginas - 1);
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

        //this.inicializaVariables();


        this.datosLog        = JSON.parse(JSON.stringify(result));
        var idxReg = 0;
        var idxRegLog = 0;
        arrDatosJournal = [];
        this.numDatosLog = this.datosLog.length;

        if(this.numDatosLog > 0) {
            for (let idx = 0; idx < this.numDatosLog; idx++) {
                let date = new Date(this.datosLog[idx].TimeStamp);
                let tmpHoraOperacion = sprintf("%02d:%02d:%02d", date.getHours(), date.getMinutes(), date.getSeconds());
                let tmpFechaOper = sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth() + 1, date.getDate());

                this.datosLog[idx].TimeStamp = sprintf("%10.10s %8.8s", tmpFechaOper, tmpHoraOperacion);
                //datosLog[idx].Amount = sprintf("$%10.10s", datosLog[idx].Amount);
            }
        }else{
            this.datosLog = [{}];
        }

        this.itemResource = new DataTableResource(this.datosLog);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
    }

    public numDatosLog:number = 0;

    reloadItems(params) {
        console.log("reloadItems::  parms: "+JSON.stringify(params));
        this.itemResource.query(params).then(items => this.items = items);
        if ( $('#btnExpExel').length == 0) {
            //$('.data-table-header').append('<input id="btnExpExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaJournal2Excel()">');
            //$('.data-table-header').append('<button id="btnExpExel" (click)="exportaJournal2Excel($event)">Export</button>');

            //<button (click)="saveFile()">Export</button>
        } else {
            //this.exportToExcel();
        }

        console.log(this.datosLog.length)
    }

    // special properties:

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    exportToExcel(event) {
/*
        let ftoJsonJournal = {
            TimeStamp:          string,
            AtmName:            string,
            AtmId:              number,
            CardNumber:         string,
            Event:              string,
            OperationType:      string,
            SwitchResponseCode: string,
            Amount:             number,
            Denomination:       string,
            Available:          number,
            Data:               string,
            Aquirer:            string,
            HWErrorCode:        string,
            TransactionCount:   number,
            FlagCode:           number,
            Surcharge:          number,
            AccountId:          number,
            AccountType:        string,
            Arqc:               string,
            Arpc:               string,
            TerminalCaps:       string,
            PosMode:            string,
            SwitchAtmId:        number,
            Reference1:         string,
            Reference2:         string,
            Reference3:         string,
            SerializedId:       number,
            Ip:                 string,
            Id:                 reg.Id,
            Location:           string
        }
        this.excelService.exportAsExcelFile(ftoJsonJournal, 'this.datosLog');
        */
    }

    exportaJournal2Excel(event){

        let arrX:any[] = [];
        this.datosLog.forEach((reg)=> {

            // Datos para exportar al excel
            arrX.push(
                {
                    TimeStamp:          reg.TimeStamp,
                    /*AtmName:            reg.AtmName,*/
                    AtmId:              reg.AtmId,
                    CardNumber:         reg.CardNumber,
                    Event:              reg.Event,
                    OperationType:      reg.OperationType,
                    SwitchResponseCode: reg.SwitchResponseCode,
                    Amount:             reg.Amount,
                    Denomination:       reg.Denomination,
                    Available:          reg.Available,
                    Data:               reg.Data,
                    Aquirer:            reg.Aquirer,
                    HWErrorCode:        reg.HWErrorCode,
                    TransactionCount:   reg.TransactionCount,
                    FlagCode:           reg.FlagCode,
                    Surcharge:          reg.Surcharge,
                    AccountId:          reg.AccountId,
                    AccountType:        reg.AccountType,
                    Arqc:               reg.Arqc,
                    Arpc:               reg.Arpc,
                    TerminalCaps:       reg.TerminalCaps,
                    PosMode:            reg.PosMode,
                    SwitchAtmId:        reg.SwitchAtmId,
                    Reference1:         reg.Reference1,
                    Reference2:         reg.Reference2,
                    Reference3:         reg.Reference3,
                    SerializedId:       reg.SerializedId,
                    Ip:                 reg.Ip,
                    Id:                 reg.Id,
                    Location:           reg.Location
                }
            )
        });

        new Angular2Csv(arrX, 'Journal', {decimalseparator: '.', showLabels: true, useBom: true});

        /* generate worksheet */
        //const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(arrX);

        /* generate workbook and add the worksheet */
        //const wb: XLSX.WorkBook = XLSX.utils.book_new();
        //XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */
        //const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        //saveAs(new Blob([s2ab(wbout)]), 'SheetJS.xlsx');
    }

}

function comparar ( a, b ){ return a - b; }