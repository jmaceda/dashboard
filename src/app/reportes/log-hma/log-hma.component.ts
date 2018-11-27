// app/reportes/log-hma.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { LogHmaService }                                from '../../services/log-hma.service';
import { NotificationsComponent }                       from '../../notifications/notifications.component';
import { SweetAlertService }                            from 'ngx-sweetalert2';


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
    templateUrl: './log-hma.component.html',
    styleUrls  : ['./log-hma.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, LogHmaService]
})
export class LogHmaComponent implements OnInit, OnDestroy  {

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
    public regsLimite: number       = 200;
    private datosRespLogHma:any[]   = [];
    private isDatosHMA:boolean      = false;
    public notificationsComponent: NotificationsComponent;

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
                public logHmaService: LogHmaService,
                private _swal2: SweetAlertService){

        this.notificationsComponent = new NotificationsComponent();
    }

    ngOnInit() {
        gDevicesAtm      = this.logHmaService.GetHmaDevices();
        gCatalogoEventos = this.logHmaService.obtenEventos();
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

    public obtenDatosLogHMA(params){

        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd, events: -1, device: -1
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        this.datosRespLogHma = [];

        if (gNumPagsLogHma > 0) {
            for (let idx = 0; idx < gNumPagsLogHma; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
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

        if (this.datosRespLogHma.length > 0) {
            $('#btnExpExel').css('cursor', 'pointer');
            this.isDatosHMA = true;
        }else{
            this.notificationsComponent.showNotification('top','center', 'warning', 'No existe información en el Log de Hardware con los parámetros indicados');
            $('#btnExpExel').css('cursor', 'not-allowed');
            this.isDatosHMA = false;
        }
    }

    public GetHmaLogDataLength(respNumPaginasLogHma:object, status){
        gNumPagsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
    }

    public GetHmaLogPage(respDatosLogHma:any[], status){
         gRespDatosLogHma = respDatosLogHma;
    }

    public reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {}

    rowDoubleClick(rowEvent) {}

    rowTooltip(item) { return item.jobTitle; }

    private MsgConsola(msg:any){}


    public exportaHMA2Excel(){
        $('#btnExpExel').css('cursor', 'not-allowed');
        this.isDatosHMA = false;

        this.notificationsComponent.showNotification('bottom','right', 'info', 'Exportado información del log de HMA a formato CVS');
        this.logHmaService.exportaHMA2Excel(this.datosRespLogHma);

        $('#btnExpExel').css('cursor', 'pointer');
        this.isDatosHMA = true;
    }
}
