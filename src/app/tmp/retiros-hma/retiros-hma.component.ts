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
import { DatosJournalService }                          from '../../services/datos-journal.service';
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
    providers: [SoapService, DepositosPorTiendaService, UtilsService, DatosJournalService, LogHmaService]
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
    public arrDatosCortesEtv:any;

    public parametrosConsulta(filtrosConsulta){
        let fIniParam = filtrosConsulta.fchInicio;
        let fFinParam = filtrosConsulta.fchFin;
        //let ipAtm     = infoRecibida.atm;
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let filtrosCons:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: filtrosConsulta.atm};

        //this.obtenDatosDeCortesEtv(filtrosCons);
        this.obtenDatosLogHMA(filtrosCons);
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService,
                public datosJournalService: DatosJournalService,
                public logHmaService: LogHmaService
                ){
    }

    public devicesAtm:any[] = [];

    public ngOnInit() {

        /*
        let url = "assets/data/devicesAtm.json";
        $.getJSON(url,  function(data)
        {
            //recorre cada elemento
            $.each(data, function(idx,descripcion){
                //console.log(JSON.stringify("("+idx+") "+descripcion));
                gDevicesAtm[idx] = descripcion;
            });
        });
        */

        gDevicesAtm         = this.logHmaService.GetHmaDevices();
        gCatalogoEventos    = this.logHmaService.obtenEventos();
        //console.log(nomComponente+".ngOnInit:: ["+window.variable_de_app_component+"]");
    }

    reloadItems(params) {
         this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }


    /*   -------------------------------   */

    GetHmaEvent(catEventos:any, status){
        gCatEventos = catEventos;
    }


    /*
    obtenEventos(){

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent);

        //gCatalogoEventos:any;

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
        //console.log(Object.keys(gCatalogoEventos).length);
    }
    */


    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }

    public arrDatosRetirosHMA:any;

    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    obtenDatosLogHMA(filtrosCons){

        //this.obtenEventos();

        //let paramsCons:any = {ip: ["11.40.2.8"], timeStampStart: "2018-01-01-11-00", timeStampEnd: "2018-01-01-23-03", device: ["ICM", "AFD"],
        //    events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]};

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["ICM", "AFD"],
            events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]
        };

        //console.log(new Date());
        //console.log("Params HSM :" +JSON.stringify(paramsCons));
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        //console.log("Paginas HSM :" +JSON.stringify(gPaginasHMA));

        this.datosRetirosHMA = [];

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage);
                this.datosRetirosHMA = this.datosRetirosHMA.concat(gdatosHMA);
            }
            let cveCat;
            this.datosRetirosHMA.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];
            });
            //console.log(JSON.stringify(datosRetirosHMA));
        }
        //console.log(new Date());

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.itemResource = new DataTableResource(this.datosRetirosHMA);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});

        //this.obtenDetalleRetiros(filtrosCons)

    }

    GetEjaLogDataLength(paginasJoural:any, status){
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural:any, status){
        gDatosJoural = datosJoural;
    }

    obtenDetalleRetiros(filtrosCons){

        // Obten fecha del último corte
        /*
        depositosPorTiendaServicef
        */
        let datosCortesJournal = this.datosJournalService.obtenDatosUltimoCorteJournal(filtrosCons);

        // "04/01/2018 9:11:56"    ---   "2018-01-04-23-59"

        //let fecha = datosCortesJournal.TimeStamp.replace( /(\d{2})[-/](\d{2})[-/](\d+) (\d):(\d{2})/, "$3-$2-$1-$04-$5").split(":")[0];
        //let fecha = datosCortesJournal.TimeStamp.replace( /(\d{2})[-/](\d{2})[-/](\d+)/, "$3-$2-$1");

        //console.log("----> JMC: TimeStamp["+datosCortesJournal.TimeStamp+"]  fecha["+fecha+"]  ["+new Date(fecha)+"]");


        //let fecha="2018-01-04-09-11";
        //fecha = datosCortesJournal.TimeStamp.replace(/[\/:]/g," ").split(" ");
        //fecha = sprintf("%04d-%02d-%02d-%02d-%02d",fecha[2],fecha[1], fecha[0], fecha[3], fecha[4]);
        //console.log(nomComponente+".obtenDetalleRetiros:: datosCortesJournal >"+JSON.stringify(datosCortesJournal)+"<");

        console.log(nomComponente+".obtenDetalleRetiros:: datosCortesJournal >"+JSON.stringify(datosCortesJournal.TimeStamp)+"<");
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        //console.log(new Date());
        console.log("Params HSM ----:" +JSON.stringify(paramsCons));
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        console.log("Paginas HSM : Retiros: " +JSON.stringify(gPaginasHMA));

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }
            let cveCat;
            let arrBilletesRetiro:any[] = [];

            datosRetirosHMA.forEach( (reg) => {
                arrBilletesRetiro.push(reg.Data);
            });
            console.log("Retiros: "+JSON.stringify(arrBilletesRetiro));
        }

        paramsCons = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], CashManagement: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };
        //console.log("Params HSM :" +JSON.stringify(paramsCons));

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);

        console.log("Paginas Joural : Depositos: " +JSON.stringify(gPaginasJoural));

        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
                datosJournal = datosJournal.concat(gDatosJoural);

            }
            let cveCat;
            let arrBilletesJournal:any[] = [];

            datosJournal.forEach( (reg) => {
                let i = reg.Data.indexOf("[");
                arrBilletesJournal.push(reg.Data.substring(i));
            });
            console.log("Depósitos: "+JSON.stringify(arrBilletesJournal));
        }
    }
    public datosRetirosHMA:any;

}
