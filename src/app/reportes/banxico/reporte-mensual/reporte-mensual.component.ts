// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { EventEmitter}                                  from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';

import { SoapService }                                  from '../../../services/soap.service';
import { FiltrosUtilsService }                          from '../../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../../services/acumulado-por-deposito.service';
import { DatosJournalService }                          from '../../../services/datos-journal.service';
import { UtilsService }                                 from '../../../services/utils.service';
import { LogHmaService }                                from '../../../services/log-hma.service';

import { AcumulaBilletesModel }                         from '../../../models/acumula-billetes.model';

export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosResumenDeEfectivo:any;

export var gPaginasHMA:any;
export var gdatosHMA:any;
export var gPaginasJournal:any = {TotalPages: 0, TotalItems: 0};
export var gDatosJournal:any[] = [];


var arrDatosJournal:any[]               = [];

export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];
export var arrDatosServidor:any[]       = [];
export var gNumPagsLogHma               = 0;
export var gNumRegsLogHma               = 0;
export var gRespDatosLogHma:any;

var nomComponente = "RetirosHmaComponent";

export class GetAtmDetail{
    Id: string;
    Description: string;
    Ip: string;
    Name: string;
    groupId: number;

    constructor(Id: string, Description: string, Ip: string, Name: string, groupId: number){
        this.Id = Id;
        this.Description = Description;
        this.Ip = Ip;
        this.Name = Name;
        this.groupId = groupId;
    }
}

export class GetGroupsAtmsIps{
    IdAtms: string;

    constructor(IdAtms: string){
        this.IdAtms = IdAtms;
    }
}

export class GetGroupsWithAtms{
    Id: string;
    Description: string;
    Description2: string;

    constructor(Id: string, Description: string, Description2: string){
        this.Id = Id;
        this.Description = Description;
        this.Description2 = Description2;
    }
}

var nomComponente = "ReporteMensualComponent";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './reporte-mensual.component.html',
    styleUrls  : ['./reporte-mensual.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService]
})
export class ReporteMensualComponent implements OnInit {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos: any = [];
    public dTipoListaParams: string = "A";
    public dSolicitaFechasIni = false;
    public dSolicitaFechasFin = false;
    public dUltimaActualizacion: string;
    public fchUltimaActualizacion: any = null;
    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;
    public arrDatosRetirosHMA: any;
    public datosUltimoCorte: any;
    public billetesDepositados: AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public billetesRetirados: AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public arrBilletesDisponibles: AcumulaBilletesModel[] = [];


    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService,
                public logHmaService: LogHmaService) {
    }

    ngOnInit() {
        this.arrBilletesDisponibles.push(new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0));
        gDevicesAtm = this.logHmaService.GetHmaDevices();
        gCatalogoEventos = this.logHmaService.obtenEventos();
    }


    public parametrosConsulta(infoRecibida) {

        this.fchUltimaActualizacion = null;

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let ipAtm = infoRecibida.atm;
        let fchIniParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam: any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};

        this.obtenDatos(datosParam);
    }


    public GetHmaLogDataLength(respNumPaginasLogHma: object, status) {
        gNumPagsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
        //console.log(nomComponente+".obtenNumeroDePaginasLog:: gNumPagsLogHma["+gNumPagsLogHma+"]  gNumRegsLogHma["+gNumRegsLogHma+"]");
    }

    public GetHmaLogPage(respDatosLogHma: any[], status) {
        gRespDatosLogHma = respDatosLogHma;
    }


    private datosRespLogHma: any[] = [];
    public datosReporte: any[] = [];
    public diaProceso: number = 0;
    public totalRetirosReporte: any = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};

    public obtenDatos(params?) {

        console.log(nomComponente + ".obtenDatos:: Inicio");

        //this.obtenDatosRetiros(params);
        this.obtenDatosDepositos(params);
        this.obtenDatosDotaciones(params);
    }

    public obtenDatosDotaciones(params){

        console.log(nomComponente + ".obtenDatosDepositos:: Inicio");

        params.events           = ['Replenishment'];
        params.ipAtm            = '11.50.2.5';

        let datosReporte:any        = [];
        let strIdBilletes           = "DOTAR CONTADORES FINAL";
        this.datosReporte           = [];

        this.diaProceso = 0;

        //for(let dia=1; dia < 12; dia++)
        {
            let dia = 4;
            this.diaProceso++;
            console.log(nomComponente + ".obtenDatosDotaciones:: Procesando el día ["+this.diaProceso+"]");
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-05-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-05-' + xdia + '-23-59';

            datosReporte.push ( this.obtenDepositos(params, strIdBilletes) );
        }

        /*
         datosReporte.forEach( reg => {
         this.totalRetirosReporte.b20 += reg.b20;
         this.totalRetirosReporte.b50 += reg.b50;
         this.totalRetirosReporte.b100 += reg.b100;
         this.totalRetirosReporte.b200 += reg.b200;
         this.totalRetirosReporte.b500 += reg.b500;
         this.totalRetirosReporte.b1000 += reg.b1000;
         this.totalRetirosReporte.opers += reg.opers;
         this.totalRetirosReporte.monto += reg.monto;
         });

         this.datosReporte = datosReporte;
         */
    }


    public obtenDatosDepositos(params){

        console.log(nomComponente + ".obtenDatosDepositos:: Inicio");

        params.events           = ['CashManagement'];
        params.ipAtm            = '11.50.2.8';

        let datosReporte:any        = [];
        let strIdBilletes           = "PROCESADEPOSITO ConfirmaDeposito";

        this.datosReporte           = [];
        this.diaProceso = 0;


        //for(let dia=1; dia < 12; dia++)
        {
            let dia = 4;
            this.diaProceso++;
            console.log(nomComponente + ".obtenDatosDepositos:: Procesando el día ["+this.diaProceso+"]");
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-04-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-04-' + xdia + '-23-59';

            datosReporte.push ( this.obtenDepositos(params, strIdBilletes) );
        }

        /*
        datosReporte.forEach( reg => {
            this.totalRetirosReporte.b20 += reg.b20;
            this.totalRetirosReporte.b50 += reg.b50;
            this.totalRetirosReporte.b100 += reg.b100;
            this.totalRetirosReporte.b200 += reg.b200;
            this.totalRetirosReporte.b500 += reg.b500;
            this.totalRetirosReporte.b1000 += reg.b1000;
            this.totalRetirosReporte.opers += reg.opers;
            this.totalRetirosReporte.monto += reg.monto;
        });

        this.datosReporte = datosReporte;
        */
    }



    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
        //console.log(nomComponente+".GetEjaLogDataLength:: ["+JSON.stringify(gPaginasJournal)+"]");
    }

    public GetEjaLogPage(datosJournal:any, status){
        gDatosJournal = datosJournal;
    }

    public obtenDepositos(params, strIdBilletes){


        //let events:string[]     = ['CashManagement'];

        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events, minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        console.log(nomComponente+".obtenDepositos::  paramsCons <"+ JSON.stringify(paramsCons) + ">");

        let arrBillDepJournal:any[] = [];
        let arrBillDepJournal2      = {};
        let datosBilletes           = "";

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);
                if ( gDatosJournal.length > 0){
                    gDatosJournal.forEach( reg => {

                        //console.log("(1) -->" + JSON.stringify(reg.Data));

                        if (reg.Data.substring(0, strIdBilletes.length) == strIdBilletes) {

                            datosBilletes = reg.Data.replace(/.*\[(.*)\]/, "$1");
                            //console.log("(2) -->" + JSON.stringify(datosBilletes));

                            if ( datosBilletes.indexOf("total") > 0){
                                datosBilletes = datosBilletes.substring(0,datosBilletes.indexOf("|total"))
                            }
                            //console.log("(3) -->" + JSON.stringify(datosBilletes));
                            //datosBilletes = (datosBilletes.indexOf("|total=")) ? datosBilletes.replace(/total=/g,"") : datosBilletes;
                            //console.log(JSON.stringify(datosBilletes.replace(/.*\[(.*)\]/, "$1")));
                            //arrBillDepJournal.push(datosBilletes.replace(/.*\[(.*)\]/, "$1"));
                            arrBillDepJournal.push(datosBilletes);
                        }
                    })
                }
            }

            let posicionBilleteDenomina = (paramsCons.events == "CashManagement") ? "BD" : "DB";

            arrBillDepJournal2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillDepJournal, "|", posicionBilleteDenomina);

            console.log(JSON.stringify(arrBillDepJournal2));
            return(arrBillDepJournal2);
            //console.log("datosJournaldatosJournal <"+ JSON.stringify(datosJournal) + ">");

/*
            let cveCat;
            let arrRetirosLogHardware:any[] = [];
            let arrBillRetLogHardware:any[] = [];
            let billetesRetiro = "";

            this.datosRespLogHma.forEach( (reg) => {

                if (reg.HmaEventId == 2083) { //'DenominateInfo'){
                    billetesRetiro = "";
                    billetesRetiro = reg.Data;
                }else if(reg.HmaEventId == 2058){
                    arrRetirosLogHardware.push({'billetes': billetesRetiro, 'monto': reg.Data});
                    arrBillRetLogHardware.push(billetesRetiro);
                    billetesRetiro = "";
                }
            });

            arrBillRetLogHardware2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetLogHardware, ";", "BD");
            console.log(JSON.stringify(arrBillRetLogHardware2));
            return(arrBillRetLogHardware2);
*/
        }



    }


    public obtenDatosRetiros(params?) {

        console.log(nomComponente + ".obtenDatosRetiros:: Inicio");

        let datosReporte:any        = [];
        this.datosReporte           = [];

        for(let dia=1; dia < 31; dia++){
            this.diaProceso++;
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-04-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-04-' + xdia + '-23-59';
            datosReporte.push ( this.obtenRetiros(params) );
        }

        datosReporte.forEach( reg => {
            this.totalRetirosReporte.b20 += reg.b20;
            this.totalRetirosReporte.b50 += reg.b50;
            this.totalRetirosReporte.b100 += reg.b100;
            this.totalRetirosReporte.b200 += reg.b200;
            this.totalRetirosReporte.b500 += reg.b500;
            this.totalRetirosReporte.b1000 += reg.b1000;
            this.totalRetirosReporte.opers += reg.opers;
            this.totalRetirosReporte.monto += reg.monto;
        });

        this.datosReporte = datosReporte;

    }

    public obtenRetiros(params){
        params.ipAtm            = '11.50.2.8';
        let device:string[]     = ['AFD'];
        let events:string[]     = ['DispenseOk', 'DenominateInfo'];
        let arrBillRetLogHardware2 = {};

        console.log(nomComponente+".obtenDatosLogHMA (1):: params<"+JSON.stringify(params)+">");
        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd, events: events, device: device
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        this.datosRespLogHma = [];

        if (gNumPagsLogHma > 0) {
            for (let idx = 0; idx < gNumPagsLogHma; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                this.datosRespLogHma = this.datosRespLogHma.concat(gRespDatosLogHma);
            }

            let cveCat;
            let arrRetirosLogHardware:any[] = [];
            let arrBillRetLogHardware:any[] = [];
            let billetesRetiro = "";

            this.datosRespLogHma.forEach( (reg) => {

                if (reg.HmaEventId == 2083) { //'DenominateInfo'){
                    billetesRetiro = "";
                    billetesRetiro = reg.Data;
                }else if(reg.HmaEventId == 2058){
                    arrRetirosLogHardware.push({'billetes': billetesRetiro, 'monto': reg.Data});
                    arrBillRetLogHardware.push(billetesRetiro);
                    billetesRetiro = "";
                }
            });

            arrBillRetLogHardware2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetLogHardware, ";", "BD");
            console.log(JSON.stringify(arrBillRetLogHardware2));
            return(arrBillRetLogHardware2);
        }



    }


    public RetirosLogHMA(){

    }

    public DepositosDotacion(){

    }

}
