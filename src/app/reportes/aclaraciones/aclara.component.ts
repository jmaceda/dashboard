// app/reportes/aclara.component.ts
import { Component }                            from '@angular/core';
import { OnInit }                               from '@angular/core';
import { OnDestroy }                            from '@angular/core';

import { sprintf }                              from "sprintf-js";
//import { DataTableResource }                    from 'angular-4-data-table-fix';

import { ConfigService }                        from './configuration.service';
import { SoapService }                          from '../../services/soap.service';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
import { ExportToCSVService }                   from '../../services/export-to-csv.service';

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
    providers: [SoapService, ConfigService]
})
export class AclaracionesComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    public dataJournalRedBlu = [];
    public configuration:any;

    public columnas = [
        { key: 'TimeStamp',         title: 'Fecha'},
        /*{ key: 'TimeStamp',         title: 'Hora'},*/
        /*{ key: 'AtmName',        	title: 'ATM' },*/
        { key: 'CardNumber',        title: 'Núm. Tarjeta' },
        { key: 'Event',             title: 'Evento', filtering: {filterString: '', placeholder: 'Evento'}},
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

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService){
    }

    public ngOnInit() {
        this.configuration = ConfigService.config;
        if ( $('#btnExpExel').length == 0) {
            $('.data-table-header').append('<input id="btnExpExel" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaJournal2Excel()">');
            //$('.data-table-header').append('<button id="btnExpExel" (click)="exportaJournal2Excel($event)">Export</button>');
            //<button (click)="saveFile()">Export</button>
        } else {
            //this.exportToExcel();
        }

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

        console.log(nomComponente+".pDatosDelJournal:: paramsCons["+JSON.stringify(paramsCons)+"]");

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength);

        //console.log(nomComponente+".pDatosDelJournal:: gPaginasJournal["+JSON.stringify(gPaginasJournal)+"]");

        if (gPaginasJournal.TotalPages > 0) {
            let datosAclara: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log(nomComponente+".pDatosDelJournal:: paramsCons["+JSON.stringify(paramsCons)+"]");
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage);
                datosAclara = datosAclara.concat(gDatosAclaracion);
            }
            this.dataJournalRedBlu = datosAclara;
        }
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        // TotalItems / TotalPages
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosAclaracion:any, status){
        gDatosAclaracion = datosAclaracion;
    }

    public exportaJournal2Excel(event){

        let arr2Excel:any[] = [];
        this.dataJournalRedBlu.forEach((reg)=> {
            arr2Excel.push(
                {
                    TimeStamp:          (new Date(reg.TimeStamp)).toLocaleString(undefined, {day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'}),
                    AtmName:            reg.AtmName,
                    AtmId:              reg.AtmId,
                    CardNumber:         reg.CardNumber,
                    Event:              reg.Event,
                    OperationType:      reg.OperationType,
                    SwitchResponseCode: reg.SwitchResponseCode,
                    Amount:             reg.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"}),
                    Denomination:       reg.Denomination,
                    Available:          reg.Available.toLocaleString("es-MX",{style:"currency", currency:"MXN"}),
                    Data:               reg.Data,
                    Aquirer:            reg.Aquirer,
                    HWErrorCode:        reg.HWErrorCode,
                    TransactionCount:   reg.TransactionCount,
                    FlagCode:           reg.FlagCode,
                    Surcharge:          reg.Surcharge.toLocaleString("es-MX"),
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

        if (arr2Excel.length > 0) {
            let exporter = new ExportToCSVService();
            exporter.exportAllToCSV(arr2Excel, 'Journal.csv');
        }
    }
}
