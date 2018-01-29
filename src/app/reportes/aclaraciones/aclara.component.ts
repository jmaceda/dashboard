import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';

import { sprintf }                              from "sprintf-js";
//import { DataTableResource }                    from 'angular-4-data-table-fix';

import { ConfigService }                        from './configuration.service';
import { SoapService }                          from '../../services/soap.service';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';

import { DatosJournalService }                  from '../../services/datos-journal.service';

var nomComponente = "AclaracionesComponent";

export var gPaginasJournal:any;
export var gDatosAclaracion:any;

@Component({
    selector: 'app-aclara',
    templateUrl: './aclara.component.html',
    styleUrls: [ './aclara.component.css' ],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, ConfigService, DatosJournalService]
})
export class AclaracionesComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string  = "";
    public dataJournalRedBlu            = [];
    public configuration:any;
    private isDatosJournal:boolean      = false;
    public columnas:any;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public datosJournalService: DatosJournalService){
    }

    public ngOnInit() {
        this.configuration = ConfigService.config;

        if ( $('#btnExpExel').length == 0) {
            $('.data-table-header').append('<input id="btnExpExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaJournal2Excel()">');
        }

        $('#btnExpExel').css('cursor', 'not-allowed');
        this.isDatosJournal = true;
        this.columnas = this.datosJournalService.obtenColumnasVista();
    }

    // disable component
    private datosJournalInput(): void {
        this.isDatosJournal = false;
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

        console.log(nomComponente+".pDatosDelJournal:: paramsCons["+JSON.stringify(paramsCons)+"]");

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength);

        console.log(nomComponente+".pDatosDelJournal:: gPaginasJournal["+JSON.stringify(gPaginasJournal)+"]");

        if (gPaginasJournal.TotalPages > 0) {
            let datosAclara: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage);
                datosAclara = datosAclara.concat(gDatosAclaracion);
            }
            this.dataJournalRedBlu = datosAclara;
        }

        if (this.dataJournalRedBlu.length > 0) {
            $('#btnExpExel').css('cursor', 'pointer');
            this.isDatosJournal = false;
        }else{
            $('#btnExpExel').css('cursor', 'not-allowed');
            this.isDatosJournal = true;
        }
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosAclaracion:any, status){
        gDatosAclaracion = datosAclaracion;
    }

    public exportaJournal2Excel(event){
        console.log(nomComponente+".exportaJournal2Excel:: Inicio");
        this.datosJournalService.exportaJournal2Excel(this.dataJournalRedBlu);
    }
}
