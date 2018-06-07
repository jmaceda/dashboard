// app/reportes/journal.component.ts
import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { SoapService }                          from '../../services/soap.service';
import { sprintf }                              from "sprintf-js";
import { DataTableResource }                    from 'angular-4-data-table-fix';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
import { DatosJournalService }                  from '../../services/datos-journal.service';

import { NotificationsComponent }               from '../../notifications/notifications.component';
import { SweetAlertService }                    from 'ngx-sweetalert2';

var arrDatosJournal:any[] = [];

export var datosATMs  = [];
export var gPaginasJournal:any;
export var gDatosJournal:any;

export const nomComponente:string = "JournalComponent";

@Component({
    selector   : 'app-journal',
    templateUrl: './journalV1.component.html',
    styleUrls  : ['./journalV1.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DatosJournalService, SweetAlertService]
})
export class JournalV1Component implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    public regsLimite:number            = 15;
    public itemResource                 = new DataTableResource(arrDatosJournal);
    public items                        = [];
    public itemCount                    = 0;
    public nomArchExcel                 = "Journal_";
    public columnas:any;
    public dataJournalRedBlu            = [];
    private isDatosJournal:boolean      = false;
    public notificationsComponent: NotificationsComponent;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public datosJournalService: DatosJournalService,
                private _swal2: SweetAlertService){

        this.notificationsComponent = new NotificationsComponent();
    }

    ngOnInit() {
        this.columnas = this.datosJournalService.obtenColumnasVista();
    }

    public parametrosConsulta(filtrosConsulta){

        let parametrosConsulta:any  = {};
        let fIniParam               = filtrosConsulta.fchInicio;
        let fFinParam               = filtrosConsulta.fchFin;
        let fchIniParam:string      = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string      = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let filtrosCons:any         = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: filtrosConsulta.atm};

        this.pDatosDelJournal(filtrosCons);
    }

    public pDatosDelJournal(filtrosCons){

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: -1, minAmount: -1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this.dataJournalRedBlu = [];

        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);
                datosJournal = datosJournal.concat(gDatosJournal);
            }
            this.dataJournalRedBlu = datosJournal;
        }

        this.itemResource = new DataTableResource(this.dataJournalRedBlu);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        if (this.dataJournalRedBlu.length > 0) {
            $('#btnExpExel').css('cursor', 'pointer');
            this.isDatosJournal = true;
        }else{
            this.notificationsComponent.showNotification('top','center', 'warning', 'No existe información en el Journal con los parámetros indicados');
            $('#btnExpExel').css('cursor', 'not-allowed');
            this.isDatosJournal = false;
        }
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosJournal:any, status){
        gDatosJournal = datosJournal;
    }

    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {}

    rowDoubleClick(rowEvent) {}

    rowTooltip(item) { return item.jobTitle; }

    public exportaJournal2Excel(){
        $('#btnExpExel').css('cursor', 'not-allowed');
        this.isDatosJournal = false;

        this.notificationsComponent.showNotification('bottom','right', 'info', 'Exportado información del Journal a formato CVS');
        this.datosJournalService.exportaJournal2Excel(this.dataJournalRedBlu);

        $('#btnExpExel').css('cursor', 'pointer');
        this.isDatosJournal = true;
    }

}
