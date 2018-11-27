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

import { AcumulaBilletesModel }                         from '../../models/acumula-billetes.model';

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
    selector   : 'rechazos-efectivo',
    templateUrl: './rechazos-hma.component.html',
    styleUrls  : ['./rechazos-hma.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, UtilsService, DatosJournalService]
})
export class RechazosHmaComponent implements OnInit  {

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
                public datosJournalService: DatosJournalService
    ){
    }

    public devicesAtm:any[] = [];

    public ngOnInit() {

        let url = "assets/data/devicesAtm.json";
        $.getJSON(url,  function(data)
        {
            //recorre cada elemento
            $.each(data, function(idx,descripcion){
                //console.log(JSON.stringify("("+idx+") "+descripcion));
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

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent, false);

        //gCatalogoEventos:any;

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
        //console.log(Object.keys(gCatalogoEventos).length);
    }


    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }

    public arrDatosRetirosHMA:any;

    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    public obtenDatosLogHMA(filtrosCons){

        this.obtenEventos();

        /* == Obtener fecha y hora del último corte == */
        //let datosCortesJournal = this.datosJournalService.obtenDatosUltimoCorteJournal(filtrosCons);

        let datosCortesJournal:any;
        let opc2               = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        let opc3               = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', seconds: '2-digit'};
        //let ultimoCorte        = datosCortesJournal[datosCortesJournal.length -1];
        let expFtoFchCorte     = /(\d{2})[/-](\d{2})[/-](\d{4}) (\d{2}):(\d{2}):(\d{2})/;
        //let fchUltimoCorte   = (new Date(datosCortesJournal.TimeStamp)).toLocaleString(undefined, opc3);
        //let fchUltimoCorte     = new Date((datosCortesJournal.TimeStamp).replace( expFtoFchCorte, "$2/$1/$3 $4:$5:$6") );
        //let fchUltimoCorte2    = fchUltimoCorte.replace(/[\/ :]/g,"-").split("-");
        //let fchUltimoCorte2    = fchUltimoCorte.toLocaleString(undefined, opc3).replace(/[\/ :]/g,"-").split("-");
        //fchUltimoCorte2        = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte2[2], fchUltimoCorte2[1], fchUltimoCorte2[0], fchUltimoCorte2[3], fchUltimoCorte2[4]);

        let fchUltimoCorte2 = sprintf("2018-01-01-12-47");
        filtrosCons.timeStampEnd = "2018-01-25-17-31";

        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: fchUltimoCorte2,
            timeStampEnd: filtrosCons.timeStampEnd, device: ["DEP", "AFD"],
            events: ["CashInEndOk", "CashInStartOk", "NotesValidated", "FullStatus", "DenominateInfo", "DispenseOk"]
        };

        //console.log(new Date());
        console.log("Params HSM :" +JSON.stringify(paramsCons));

        /* == Obten número de paginas del Log de Hardware == */
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        console.log("Paginas HSM :" +JSON.stringify(gPaginasHMA));

        this.datosRetirosHMA = [];


        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                this.datosRetirosHMA = this.datosRetirosHMA.concat(gdatosHMA);
            }
            let cveCat;
            let tmpBilletesDep:string = "";
            let tmpBilletesRet:string = "";
            let tmpFullStatus:string = "";
            let numRetiros:number = 0;
            let numDepositos:number = 0;
            let numRechazos:number = 0;
            let arrBilletesDep: any[] = [];
            let arrBilletesRet: any[] = [];
            let arrBilletesRec: any[] = [];

            this.datosRetirosHMA.forEach( (reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];

                if (reg.Events == "NotesValidated"){
                    tmpBilletesDep = reg.Data;
                }

                if (reg.Events == "CashInEndOk" && (tmpBilletesDep != null && tmpBilletesDep.length > 0)){
                    arrBilletesDep.push(tmpBilletesDep + ";");
                }

                if (reg.Events == "DenominateInfo"){
                    tmpBilletesRet = reg.Data;
                    numDepositos++;
                }

                if (reg.Events == "DispenseOk" && (tmpBilletesRet != null && tmpBilletesRet.length > 0)){
                    arrBilletesRet.push(tmpBilletesRet + ";");
                    numRetiros++;
                }


                if (reg.Events == "FullStatus"){
                    tmpFullStatus = reg.Data;
                    numRechazos = 1;
                }

            });


            this.numBilletesDep = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesDep, ";", "BD");
            //this.numBilletesDep.opers = numDepositos;
            console.log("Depósitos:: numBilletesDep["+JSON.stringify(this.numBilletesDep)+"]");


            this.numBilletesRet = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRet, ";", "BD");
            //this.numBilletesRet.opers = numRetiros;
            console.log("Depósitos:: numBilletesRet["+JSON.stringify(this.numBilletesRet)+"]");

            console.log("tmpFullStatus["+tmpFullStatus+"]");

            let arrFullStatus = tmpFullStatus.split("%");
            for(let idx=0; idx < arrFullStatus.length; idx++){
                let x = arrFullStatus[idx].split("-");
                arrFullStatus[idx] = "50x"+x[3]+";";
            }

            arrBilletesRec.push(arrFullStatus[0]+arrFullStatus[1]+arrFullStatus[2]+arrFullStatus[3]);
            this.numBilletesRec = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRec, ";", "BD");
            //this.numBilletesRec.opers = numRechazos;
            console.log("arrFullStatus-->"+arrBilletesRec+"<--");

            //console.log(JSON.stringify(datosRetirosHMA));
        }
        //console.log(new Date());

        /*
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.itemResource = new DataTableResource(this.datosRetirosHMA);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});
*/
        //this.obtenDetalleRetiros(filtrosCons)

    }

    public numBilletesDep:AcumulaBilletesModel;
    public numBilletesRet:AcumulaBilletesModel;
    public numBilletesRec:AcumulaBilletesModel;

    GetEjaLogDataLength(paginasJoural:any, status){
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural:any, status){
        gDatosJoural = datosJoural;
    }

    public obtenDetalleRetiros(filtrosCons){

        // Obten fecha del último corte
        /*
         depositosPorTiendaServicef
         */
        let datosCortesJournal = this.datosJournalService.obtenDatosUltimoCorteJournal(filtrosCons);

        console.log(nomComponente+".obtenDetalleRetiros:: datosCortesJournal >"+JSON.stringify(datosCortesJournal.TimeStamp)+"<");
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        //console.log(new Date());
        console.log("Params HSM ----:" +JSON.stringify(paramsCons));
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        console.log("Paginas HSM : Retiros: " +JSON.stringify(gPaginasHMA));

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
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

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        console.log("Paginas Joural : Depositos: " +JSON.stringify(gPaginasJoural));

        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                //console.log("Params HSM :" +JSON.stringify(paramsCons));
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
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
