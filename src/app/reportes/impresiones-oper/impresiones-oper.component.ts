// app/tmp/retiros-hma/retiros-hma.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../services/acumulado-por-deposito.service';
import { UtilsService }                                 from '../../services/utils.service';
import { DatosJournalService }                          from '../../services/datos-journal.service';

import { NgxDatatableModule, DatatableComponent } from '@swimlane/ngx-datatable';

export var gPaginasJournal:any;
export var gDatosCortesEtv:any;
export var gPaginasHMA:any;
export var gdatosHMA:any;

export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

export var gPaginasJoural:any[] = [];
export var gDatosJoural:any[] = [];

var nomComponente = "ImpresionesOperComponent";

@Component({
    selector   : 'impresiones-oper',
    templateUrl: './impresiones-oper.component.html',
    styleUrls  : ['./impresiones-oper.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService, DatosJournalService]
})
export class ImpresionesOperComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    public tituloImgExcel               = "Exporta archivo de Impresiones a CVS";
    private tituloDatatable:string      = "Impresiones";

    // Parametros para el llenado del grid de datos
    public itemResource = new DataTableResource([]);
    public items        = [];
    public itemCount    = 0;

    selected = [];
    loadingIndicator: boolean = false;
    rawEvent: any;
    contextmenuRow: any;
    contextmenuColumn: any;

    public regsLimite:number        = 15;
    public arrDatosCortesEtv:any;

    public parametrosConsulta(filtrosConsulta){
        let fIniParam = filtrosConsulta.fchInicio;
        let fFinParam = filtrosConsulta.fchFin;
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let filtrosCons:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: filtrosConsulta.atm};

        this.obtenDatosLogHMA(filtrosCons);
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService,
                public datosJournalService: DatosJournalService
                ){
    }

    public devicesAtm:any[] = [];
    //public dataImpresionesRedBlu:any;
    public dataImpresionesRedBlu  = [];
    public ngOnInit() {

        let url = "assets/data/devicesAtm.json";
        $.getJSON(url,  function(data)
        {
            $.each(data, function(idx,descripcion){
                gDevicesAtm[idx] = descripcion;
            });
        });
    }

    reloadItems(params) {
         this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {}

    rowDoubleClick(rowEvent) {}

    rowTooltip(item) { return item.jobTitle; }


    GetHmaEvent(catEventos:any, status){
        gCatEventos = catEventos;
    }


    obtenEventos(){

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent, false);

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
    }


    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }

    public arrDatosRetirosHMA:any;

    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    obtenDatosLogHMA(filtrosCons){

        this.obtenEventos();

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["EPP", "ICM", "PTR", "DEVICEBUS"],
            events: ["MediaInserted", "CabinetOpen", "MediaTaken", "PrintOk", "SessionStarted", "ARQCGenerationFailed", "ARQCGenerationOk"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        this.dataImpresionesRedBlu = [];

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                this.dataImpresionesRedBlu = this.dataImpresionesRedBlu.concat(gdatosHMA);
            }
            let cveCat;
			let xReg:any;
            this.dataImpresionesRedBlu.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];
                this.selected = [reg[2]];
				
				switch(reg.Events){
					case 'SessionStarted': xReg = "Inicio:";
					case 'ARQCGenerationOk': xReg += reg.Data + ":";
					case 'PrintOk': xReg += reg.Data + ":PrintOk";					
				}
            });
			
			console.log(xReg);
        }

        /*
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.itemResource = new DataTableResource(this.dataImpresionesRedBlu);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});
        */
    }

    GetEjaLogDataLength(paginasJoural:any, status){
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural:any, status){
        gDatosJoural = datosJoural;
    }

    obtenDetalleRetiros(filtrosCons){

        let datosCortesJournal = this.datosJournalService.obtenDatosUltimoCorteJournal(filtrosCons);

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }
            let cveCat;
            let arrBilletesRetiro:any[] = [];

            datosRetirosHMA.forEach( (reg) => {
                arrBilletesRetiro.push(reg.Data);
            });
        }

        paramsCons = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], CashManagement: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosJournal = datosJournal.concat(gDatosJoural);
            }
            let cveCat;
            let arrBilletesJournal:any[] = [];

            datosJournal.forEach( (reg) => {
                let i = reg.Data.indexOf("[");
                arrBilletesJournal.push(reg.Data.substring(i));
            });
        }
    }


    rowColors(items) {
        if (items.Events == "ARQCGenerationOk") return 'rgb(205, 241, 250)';
    }
}
