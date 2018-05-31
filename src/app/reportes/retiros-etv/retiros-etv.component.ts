// app/reportes/retiro-etv/retiro-etv.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';

import { sprintf }                                      from "sprintf-js";
//import { DataTable }                                    from 'angular-4-data-table-fix';
//import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../services/acumulado-por-deposito.service';
import { UtilsService }                                 from '../../services/utils.service';
import { DatosJournalService }                          from '../../services/datos-journal.service';


export var gPaginasJournal:any;
export var gDatosCortesEtv:any;
export var gPaginasHMA:any;
export var gdatosHMA:any;

export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];

var nomComponente = "RetirosEtvComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './retiros-etv.component.html',
    styleUrls  : ['./retiros-etv.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService, DatosJournalService]
})
export class RetirosEtvComponent implements OnInit  {

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
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let filtrosCons:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: filtrosConsulta.atm};

        this.obtenDatosDeCortesEtv(filtrosCons);
        this.obtenDatosLogHMA();
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosCortesEtv:any, status){
        gDatosCortesEtv = datosCortesEtv;
    }

    public obtenDatosDeCortesEtv(filtrosCons) {

        let datosCortesEtv = this.datosJournalService.obtenCortesJournal(filtrosCons);

        if (datosCortesEtv.length > 0){
            this.arrDatosCortesEtv = [];

            datosCortesEtv.forEach((reg) => {
                if (reg.Data.substring(0,40) == "DOTAR CAPTURA CONTADORES - ANTES DE CERO") {
                    let data = (reg.Data).substring(41).replace(/\]\[/g, ' ').replace(/[\[\]]/g, ' ');

                    let billOK          = data.split(" ")[0];
                    let billRech        = data.split(" ")[1];
                    let totalRetiro     = data.split(" ")[2];
                    let billTot: any    = {};

                    billOK              = this.utilsService.convBillToJson(billOK, "DC");  // "DC" indica formato billetes: <Denominación>x<Contador>
                    billRech            = this.utilsService.convBillToJson(billRech, "DC");

                    billTot = {
                        b20: (billOK.b20 + billRech.b20),
                        b50: (billOK.b50 + billRech.b50),
                        b100: (billOK.b100 + billRech.b100),
                        b200: (billOK.b200 + billRech.b200),
                        b500: (billOK.b500 + billRech.b500),
                        b1000: (billOK.b1000 + billRech.b1000),
                        monto: (billOK.monto + billRech.monto)
                    };

                    billTot.totBill = (billOK.totbill + billRech.totbill);

                    this.arrDatosCortesEtv.push({
                        TimeStamp: reg.TimeStamp,
                        Ip: reg.Ip,
                        AtmName: reg.AtmName,
                        Amount: reg.Amount,
                        billOK: billOK,
                        billRech: billRech,
                        billTot: billTot
                    })
                }
            });

            this.filtrosUtilsService.fchaHraUltimaActualizacion();
            this.itemResource = new DataTableResource(this.arrDatosCortesEtv);
            this.itemResource.count().then(count => this.itemCount = count);
            this.reloadItems({limit: this.regsLimite, offset: 0});
        }
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService,
                public datosJournalService: DatosJournalService){
    }

    public ngOnInit() {
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

    obtenDatosLogHMA(){

        this.obtenEventos();

        let paramsCons:any = {ip: ["11.40.2.8"], timeStampStart: "2018-01-01-00-00", timeStampEnd: "2018-01-01-23-59", device: ["ICM", "AFD"],
            events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]
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
            datosRetirosHMA.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
            });
        }
    }
}
