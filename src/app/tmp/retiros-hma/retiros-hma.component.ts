// app/tmp/retiros-hma/retiros-hma.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { EventEmitter}                                  from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';

import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../services/acumulado-por-deposito.service';
import { UtilsService }                                 from '../../services/utils.service';
import { LogHmaService }                                from '../../services/log-hma.service';

export var gPaginasJournal:any;
export var gDatosCortesEtv:any;
export var gPaginasHMA:any;
export var gdatosHMA:any;

export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

export var gPaginasJoural:any[] = [];
export var gDatosJoural:any[] = [];

var nomComponente = "RetirosHmaComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './retiros-hma.component.html',
    styleUrls  : ['./retiros-hma.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService, LogHmaService]
})
export class RetirosHmaComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    // Parametros para el llenado del grid de datos
    public itemResource = new DataTableResource([]);
    public items        = [];
    public itemCount    = 0;
    public regsLimite:number        = 15;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService,
                public logHmaService: LogHmaService){
    }

    public ngOnInit() {
        gDevicesAtm         = this.logHmaService.GetHmaDevices();
        gCatalogoEventos    = this.logHmaService.obtenEventos();
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

    public obtenDatosLogHMA(filtrosCons){

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["ICM", "AFD"],
            events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        this.datosRetirosHMA = [];

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            //this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage);
                this.datosRetirosHMA = this.datosRetirosHMA.concat(gdatosHMA);
            }
            let cveCat;
            this.datosRetirosHMA.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];
            });
        }

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.itemResource = new DataTableResource(this.datosRetirosHMA);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});
    }

    public GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    public GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }

    public reloadItems(params) {
         this.itemResource.query(params).then(items => this.items = items);
    }

    public rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    public rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    public rowTooltip(item) { return item.jobTitle; }
}
