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


export var gPaginasJournal:any;
export var gDatosCortesEtv:any;
export var gPaginasHMA:any;
export var gdatosHMA:any;

export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

export var gPaginasJoural:any[] = [];
export var gDatosJoural:any[] = [];

var nomComponente = "RetirosEtvComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './retiros-hma.component.html',
    styleUrls  : ['./retiros-hma.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService]
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

    /*
    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        // TotalItems / TotalPages
        console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosCortesEtv:any, status){
        gDatosCortesEtv = datosCortesEtv;
    }

    public obtenDatosDeCortesEtv(filtrosCons) {

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["Administrative"], minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);

        if (gPaginasJournal.TotalPages > 0) {
            let datosCortesEtv: any = [];
            this.arrDatosCortesEtv = [];

            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
                datosCortesEtv = datosCortesEtv.concat(gDatosCortesEtv);
            }

            datosCortesEtv.forEach((reg) => {
                let data = (reg.Data).substring(41).replace(/\]\[/g, ' ').replace(/[\[\]]/g, ' ');

                let billOK = data.split(" ")[0];
                let billRech = data.split(" ")[1];
                let totalRetiro = data.split(" ")[2];
                let billTot: any = {};

                billOK = this.utilsService.convBillToJson(billOK, "DC");  // "DC" indica formato billetes: <Denominación>x<Contador>
                billRech = this.utilsService.convBillToJson(billRech, "DC");
                billTot = {
                    b20: (billOK.b20 + billRech.b20),
                    b50: (billOK.b50 + billRech.b50),
                    b100: (billOK.b100 + billRech.b100),
                    b200: (billOK.b200 + billRech.b200),
                    b500: (billOK.b500 + billRech.b500),
                    b1000: (billOK.b1000 + billRech.b1000),
                    monto: (billOK.monto + billRech.monto)
                };

                this.arrDatosCortesEtv.push({
                    TimeStamp: reg.TimeStamp,
                    Ip: reg.Ip,
                    AtmName: reg.AtmName,
                    Amount: reg.Amount,
                    billOK: billOK,
                    billRech: billRech,
                    billTot: billTot
                })
            });

            this.filtrosUtilsService.fchaHraUltimaActualizacion();
            this.itemResource = new DataTableResource(this.arrDatosCortesEtv);
            this.itemResource.count().then(count => this.itemCount = count);
            this.reloadItems({limit: this.regsLimite, offset: 0});
        }
    }
*/
    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public utilsService: UtilsService,
                ){
    }

    public devicesAtm:any[] = [];

    public ngOnInit() {

        let url = "assets/data/devicesAtm.json";
        $.getJSON(url,  function(data)
        {
            //recorre cada elemento
            $.each(data, function(idx,descripcion){
                console.log(JSON.stringify("("+idx+") "+descripcion));
                gDevicesAtm[idx] = descripcion;
            });
        });
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


    obtenEventos(){

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent);

        //gCatalogoEventos:any;

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
        console.log(Object.keys(gCatalogoEventos).length);
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

        //let paramsCons:any = {ip: ["11.40.2.8"], timeStampStart: "2018-01-01-11-00", timeStampEnd: "2018-01-01-23-03", device: ["ICM", "AFD"],
        //    events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]};

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["ICM", "AFD"],
            events: ["DenominateInfo", "DenominateFailed", "DispenseFailed", "RetractOk", "DispenseOk", "ARQCGenerationOk", "MediaRemoved", "MediaTaken"]
        };

        console.log(new Date());
        console.log("Params HSM :" +JSON.stringify(paramsCons));
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        console.log("Paginas HSM :" +JSON.stringify(gPaginasHMA));

        this.datosRetirosHMA = [];

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                console.log("Params HSM :" +JSON.stringify(paramsCons));
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

        this.obtenDetalleRetiros(filtrosCons)

    }

    GetEjaLogDataLength(paginasJoural:any, status){
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural:any, status){
        gDatosJoural = datosJoural;
    }

    obtenDetalleRetiros(filtrosCons){

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        console.log(new Date());
        console.log("Params HSM :" +JSON.stringify(paramsCons));
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        console.log("Paginas HSM :" +JSON.stringify(gPaginasHMA));

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                console.log("Params HSM :" +JSON.stringify(paramsCons));
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
        console.log("Params HSM :" +JSON.stringify(paramsCons));

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);


        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                console.log("Params HSM :" +JSON.stringify(paramsCons));
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
