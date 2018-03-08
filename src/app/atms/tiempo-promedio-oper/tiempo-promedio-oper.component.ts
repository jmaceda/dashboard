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


var arrDatosJournal:any[]               = [];
var nomComponente:string                = "LogHmaComponent";

export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];
export var arrDatosServidor:any[]       = [];
export var gNumPagsLogHma               = 0;
export var gNumRegsLogHma               = 0;
export var gRespDatosLogHma:any;

@Component({
    selector   : 'log-hma',
    templateUrl: './tiempo-promedio-oper.component.html',
    styleUrls  : ['./tiempo-promedio-oper.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, LogHmaService]
})
export class TiempoPromOperComponent implements OnInit, OnDestroy  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    public itemResource             = new DataTableResource(arrDatosJournal);
    public items                    = [];
    public itemCount                = 0;
    public tituloLogHMA:string      = "Log HMA";
    public ipATM: string;
    public regsLimite: number       = 200;
    private datosRespLogHma:any[]   = [];

    public columns = [
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

    public ngOnDestroy() {
       if (gNumPagsLogHma > 0){
           gNumPagsLogHma = 0;
        }
    }

    public parametrosConsulta(filtrosConsulta){

        let fIniParam = filtrosConsulta.fchInicio;
        let fFinParam = filtrosConsulta.fchFin;
        let ipAtm     = filtrosConsulta.atm;
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let filtrosCons:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};

        this.obtenDatosLogHMA(filtrosCons);
    }

    public tiempoPromOpers:any = [];
    public numOpers:any = 0;
    public tiempoPromedio:any = 0;

    public obtenDatosLogHMA(filtrosConsulta){

        this.tiempoPromOpers = this.logHmaService.obtenTiempoPromedioOper(filtrosConsulta);
        this.numOpers       = this.tiempoPromOpers.length;
        let segsDuracion    = this.tiempoPromOpers[this.numOpers -1].acumSegs;
        let minsTotDura     = Math.floor(segsDuracion / this.numOpers);
        let segsTotDura     = (minsTotDura == 0) ? segsDuracion : segsDuracion - (minsTotDura * 60);

        this.tiempoPromedio = Math.round(this.tiempoPromOpers[this.numOpers -1].acumSegs / this.numOpers);
        this.tiempoPromedio = sprintf("%02d:%02d", minsTotDura, segsTotDura);
    }

    public GetHmaLogDataLength(respNumPaginasLogHma:object, status){
        gNumPagsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
        console.log(nomComponente+".obtenNumeroDePaginasLog:: gNumPagsLogHma["+gNumPagsLogHma+"]  gNumRegsLogHma["+gNumRegsLogHma+"]");
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
