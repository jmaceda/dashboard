// app/reportes/log-hma.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { Angular2Csv }                                  from 'angular2-csv/Angular2-csv';
import { LogHmaService }                                from '../../services/log-hma.service';

import { EventEmitter}      from '@angular/core';


var ipAnterior:string = null;
var gFchInicioAnterior = null;
var gFchInicioFinAnterior = null;
var intervalId = null;
var tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.
var arrDatosJournal:any[] = [];
var nomComponente:string = "LogHmaComponent";

export var gCatEventos:any[] = [];
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

export var arrDatosServidor:any[]     = [];
export var arrDatosServidorInc:any[]  = [];
export var arrDatosServidorBack:any[] = [];
export var datosATMs  = [];
export var ipATMs  = [];
export var gNumRegsProcesados          = 0;
export var gNumPagsLogHma                 = 0;
export var gNumRegsLogHma               = 0;
export var aDatosJournal               = [];
export var gNumPaginasCompletas = 0;
export var numPagsCompletas:number    = 0;
export var numPaginaObtenida:number   = 0;

export var gRespDatosLogHma:any;

@Component({
    selector   : 'log-hma',
    templateUrl: './log-hma.component.html',
    styleUrls  : ['./log-hma.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, LogHmaService]
})
export class LogHmaComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;



    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string = '/dataservices.asmx'; //  QA
    //public url: string = '/services/dataservices.asmx'; // Prod

    public arrParams:any[] = [];

    public itemResource = new DataTableResource(arrDatosJournal);
    public items = [];
    public itemCount = 0;
    public tituloLogHMA:string = "Log HMA";

    public ipATM: string;
    //public dFchIniProceso: string = '2017-09-10';
    //public dFchFinProceso: string = '2017-09-10';
    //public dHraIniProceso: string = '00-00';
   // public dHraFinProceso: string = '23-59';
    //public fechaHoraOperacion: string;
    public ipATMs:any[] = [];
    public regsLimite: number = 200;

    private datosRespLogHma:any[] = [];

    columns = [
        { key: 'Ip',                title: 'IP'},
        { key: 'TimeStamp',         title: 'Fecha/Hora'},
        { key: 'Device',            title: 'Dispositivo' },
        { key: 'Events',            title: 'Evento' },
        { key: 'Data',              title: 'Parámetros' },
        { key: 'AtmId',             title: 'AtmId' },
        { key: 'HmaEventId',        title: 'HmaEventId' }
    ];

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public logHmaService: LogHmaService){
    }

    ngOnInit() {
        gDevicesAtm         = this.logHmaService.GetHmaDevices();
        gCatalogoEventos    = this.logHmaService.obtenEventos();
    }

    public parametrosConsulta(infoRecibida){
        console.log("Se va mostrar la información enviada desde el componente Params");
        console.log("Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
        console.log("Se mostro la información enviada desde el componente Params");
        let parametrossConsulta:any = {};

        let fIniParam   = infoRecibida.fchInicio;
        let fFinParam   = infoRecibida.fchFin;
        let ipAtm       = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        console.log(fchIniParam);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(nomComponente+".parametrosConsulta::  fchIniParam["+fchIniParam+"]    chFinParam["+fchFinParam+"]");

        let datosParam:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};

        this.obtenDatosDelJournal(datosParam);
    }


    public obtenDatosDelJournal(params){

        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd, events: -1, device: -1
        };


        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        this.datosRespLogHma = [];

        if (gNumPagsLogHma > 0) {
            for (let idx = gNumPaginasCompletas; idx < gNumPagsLogHma; idx++) {
                paramsCons.page = idx;
                this._soapService.post(this.url, 'GetHmaLogPage', paramsCons, this.GetHmaLogPage);
                this.datosRespLogHma = this.datosRespLogHma.concat(gRespDatosLogHma);
            }

            let cveCat;
            this.datosRespLogHma.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];
            });
        }

        if(gNumRegsLogHma == 0) {
            this.datosRespLogHma = [{}];
        }

        this.itemResource = new DataTableResource(this.datosRespLogHma);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public GetHmaLogDataLength(respNumPaginasLogHma:object, status){
        gNumPagsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
        console.log("obtenNumeroDePaginasLog:: gNumPagsLogHma["+gNumPagsLogHma+"]  gNumRegsLogHma["+gNumRegsLogHma+"]");
    }

    public GetHmaLogPage(respDatosLogHma:any[], status){
         gRespDatosLogHma = respDatosLogHma;
    }


    public reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }


    // special properties:
    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }

    private MsgConsola(msg:any){
        console.log(nomComponente+".");
    }

}
