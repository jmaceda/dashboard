// app/reportes/retiro-etv/retiro-etv.component.ts
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

export var gPaginasJournal:any;
export var gDatosCortesEtv:any;

var nomComponente = "RetirosEtvComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './retiros-etv.component.html',
    styleUrls  : ['./retiros-etv.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService]
})
export class RetirosEtvComponent implements OnInit  {

    public itemResource = new DataTableResource([]);
    public items        = [];
    public itemCount    = 0;

    public dListaAtmGpos:any        = [];
    public dTipoListaParams:string  = "A";
    public dUltimaActualizacion:string;
    public regsLimite:number        = 15;
    public arrDatosCortesEtv:any;

    public parametrosConsulta(infoRecibida){
        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        //let ipAtm     = infoRecibida.atm;
        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam:any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: infoRecibida.atm};

        this.obtenDatosDeCortesEtv(datosParam);
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        // TotalItems / TotalPages
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosCortesEtv:any, status){
        gDatosCortesEtv = datosCortesEtv;
    }

    public obtenDatosDeCortesEtv(datosParam) {

        let parametros: any = {
            ip: [datosParam.ipAtm], timeStampStart: datosParam.timeStampStart, timeStampEnd: datosParam.timeStampEnd,
            events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', parametros, this.GetEjaLogDataLength);

        let datosCortesEtv:any = [];

        this.arrDatosCortesEtv = [];

        for(let idx=0; idx < gPaginasJournal.TotalPages; idx++) {
            parametros.page = idx;
            this._soapService.post('', 'GetEjaLogPage', parametros, this.GetEjaLogPage);
            datosCortesEtv = datosCortesEtv.concat(gDatosCortesEtv);
        }

        datosCortesEtv.forEach( (reg) => {
            let data = (reg.Data).substring(41).replace(/\]\[/g, ' ').replace(/[\[\]]/g,' ');

            let billOK      = data.split(" ")[0];
            let billRech    = data.split(" ")[1];
            let totalRetiro = data.split(" ")[2];
            let billTot:any = {};

            billOK      = this.utilsService.convBillToJson(billOK, "DC");  // "DC" indica formato billetes: <Denominación>x<Contador>
            billRech    = this.utilsService.convBillToJson(billRech, "DC");
            billTot     = {b20: (billOK.b20 + billRech.b20), b50: (billOK.b50 + billRech.b50), b100: (billOK.b100 + billRech.b100), b200: (billOK.b200 + billRech.b200), b500: (billOK.b500 + billRech.b500), b1000: (billOK.b1000 + billRech.b1000), monto: (billOK.monto + billRech.monto)};

            this.arrDatosCortesEtv.push({TimeStamp: reg.TimeStamp, Ip: reg.Ip, AtmName: reg.AtmName, Amount: reg.Amount, billOK: billOK, billRech: billRech, billTot: billTot})
        });

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.itemResource = new DataTableResource(this.arrDatosCortesEtv);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService){
    }

    public ngOnInit() {
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
}
