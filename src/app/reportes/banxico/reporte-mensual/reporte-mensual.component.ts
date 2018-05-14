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
    public dTipoListaParams: string = "A";  // Valores permitidos:  G = Grupo / A = ATM
    public dSolicitaFechasIni = true;       // true = Solicitara fecha inicial de parametros.
    public dSolicitaFechasFin = true;       // true = Solicitara fecha final de parametros.
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

    private datosRespLogHma: any[]      = [];
    public datosReporte: any[]          = [];
    public diaProceso: number           = 0;
    public totalRetirosReporte: any     = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public totalDepositosReporte:any    = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public totalSaldo:any               = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public detalleDepositos:any         = [];
    public detalleDotaciones:any        = [];
    public detalleRetiros:any           = {};
    private diasProcesar:number         = 16


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

        console.log(nomComponente + ".obtenDatos:: datosParam<"+JSON.stringify(datosParam)+">");
        //this.obtenDatos(datosParam);
    }


    public obtenDatos(params?) {

        console.log(nomComponente + ".obtenDatos:: Inicio");

        params.ipAtm            = '11.50.2.8';

        this.obtenDepositos(params);
        this.obtenRetiros(params);

        this.totalSaldo = {
            b20:    this.totalDepositosReporte.b20      - this.totalRetirosReporte.b20,
            b50:    this.totalDepositosReporte.b50      - this.totalRetirosReporte.b50,
            b100:   this.totalDepositosReporte.b100     - this.totalRetirosReporte.b100,
            b200:   this.totalDepositosReporte.b200     - this.totalRetirosReporte.b200,
            b500:   this.totalDepositosReporte.b500     - this.totalRetirosReporte.b500,
            b1000:  this.totalDepositosReporte.b1000    - this.totalRetirosReporte.b1000,
            opers:  this.totalDepositosReporte.opers    + this.totalRetirosReporte.opers,
            monto:  this.totalDepositosReporte.monto    - this.totalRetirosReporte.monto
        }
    }

    public obtenDepositos(params){
        this.obtenDatosDotaciones(params);
        this.obtenDatosDepositos(params);
    }

    public obtenRetiros(params){
        this.obtenRetirosOper(params);
        this.obtenRetirosEtv(params);
    }

    public acumulaTotalDepositos(datosDepositos){

        datosDepositos.forEach( reg => {
            this.totalDepositosReporte.b20      += reg.b20;
            this.totalDepositosReporte.b50      += reg.b50;
            this.totalDepositosReporte.b100     += reg.b100;
            this.totalDepositosReporte.b200     += reg.b200;
            this.totalDepositosReporte.b500     += reg.b500;
            this.totalDepositosReporte.b1000    += reg.b1000;
            this.totalDepositosReporte.opers    += reg.opers;
            this.totalDepositosReporte.monto    += reg.monto;
        });
    }

    public acumulaTotalRetiros(datosReporte){

        datosReporte.forEach( reg => {
            this.totalRetirosReporte.b20    += reg.b20;
            this.totalRetirosReporte.b50    += reg.b50;
            this.totalRetirosReporte.b100   += reg.b100;
            this.totalRetirosReporte.b200   += reg.b200;
            this.totalRetirosReporte.b500   += reg.b500;
            this.totalRetirosReporte.b1000  += reg.b1000;
            this.totalRetirosReporte.opers  += reg.opers;
            this.totalRetirosReporte.monto  += reg.monto;
        });
    }

    public GetHmaLogDataLength(respNumPaginasLogHma: object, status) {
        gNumPagsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
        //console.log(nomComponente+".obtenNumeroDePaginasLog:: gNumPagsLogHma["+gNumPagsLogHma+"]  gNumRegsLogHma["+gNumRegsLogHma+"]");
    }

    public GetHmaLogPage(respDatosLogHma: any[], status) {
        gRespDatosLogHma = respDatosLogHma;
    }

    public GetEjaLogDataLength(paginasJournal:any, status){
        gPaginasJournal = paginasJournal;
    }

    public GetEjaLogPage(datosJournal:any, status){
        gDatosJournal = datosJournal;
    }

    public obtenDatosDotaciones(params){

        console.log(nomComponente + ".obtenDatosDotaciones:: Inicio");

        params.events               = ['Replenishment'];

        //let datosReporte:any        = [];
        let strIdBilletes           = "DOTAR CONTADORES FINAL";
        let respuestaDatos:any      = "";
        //this.datosReporte           = [];
        this.diaProceso             = 0;

        this.detalleDotaciones.push ({b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0});

        for(let dia=1; dia < this.diasProcesar; dia++){
            this.diaProceso++;
            console.log(nomComponente + ".obtenDatosDotaciones:: Procesando el día ["+this.diaProceso+"]");
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-05-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-05-' + xdia + '-23-59';
            respuestaDatos          = this.obtenDetalleDepositos(params, strIdBilletes);

            if (respuestaDatos != null) {
                this.detalleDotaciones.push ( respuestaDatos );
            }
        }
        console.log("obtenDatosDotaciones:: detalleDotaciones<"+JSON.stringify(this.detalleDotaciones)+">");

        this.acumulaTotalDepositos(this.detalleDotaciones);
    }


    public obtenDatosDepositos(params){

        console.log(nomComponente + ".obtenDatosDepositos:: Inicio");

        params.events           = ['CashManagement'];
        //params.ipAtm            = '11.50.2.8';

        //let datosReporte:any        = [];
        let respuestaDatos:any      = "";
        let strIdBilletes           = "PROCESADEPOSITO ConfirmaDeposito";

        //this.datosReporte           = [];
        this.diaProceso             = 0;
        this.detalleDepositos.push ({b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0});

        for(let dia=1; dia < this.diasProcesar; dia++){
            this.diaProceso++;
            console.log(nomComponente + ".obtenDatosDepositos:: Procesando el día ["+this.diaProceso+"]");
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-05-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-05-' + xdia + '-23-59';
            respuestaDatos          = this.obtenDetalleDepositos(params, strIdBilletes);

            if (respuestaDatos != null) {
                this.detalleDepositos.push ( respuestaDatos );
            }
        }
        console.log("obtenDatosDepositos:: detalleDepositos<"+JSON.stringify(this.detalleDepositos)+">");
        this.acumulaTotalDepositos(this.detalleDepositos);
    }


    public obtenDetalleDepositos(params, strIdBilletes){

        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events, minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        console.log(nomComponente+".obtenDetalleDepositos::  paramsCons <"+ JSON.stringify(paramsCons) + ">");

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

                        if (reg.Data.substring(0, strIdBilletes.length) == strIdBilletes) {

                            datosBilletes = reg.Data.replace(/.*\[(.*)\]/, "$1");

                            if ( datosBilletes.indexOf("total") > 0){
                                datosBilletes = datosBilletes.substring(0,datosBilletes.indexOf("|total"))
                            }

                            arrBillDepJournal.push(datosBilletes);
                        }
                    })
                }
            }

            let posicionBilleteDenomina = (paramsCons.events == "CashManagement") ? "BD" : "DB";

            arrBillDepJournal2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillDepJournal, "|", posicionBilleteDenomina);

            console.log(JSON.stringify(arrBillDepJournal2));
            return(arrBillDepJournal2);

        }
    }

    public obtenRetirosEtv(params?) {

        console.log(nomComponente + ".obtenDatosRetiros:: Inicio");

        let datosReporte:any        = [];
        let respuestaDatos:any      = "";
        this.diaProceso             = 0;
        //let retirosEtv:any          = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};

        //this.datosReporte           = [];

        params.events = ['Administrative', 'Replenishment'];

        for(let dia=1; dia < this.diasProcesar; dia++){
            this.diaProceso++;
            let xdia = (dia < 10) ? "0"+dia: dia;
            params.timeStampStart   = '2018-05-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-05-' + xdia + '-23-59';
            respuestaDatos = this.obtenDatosRetirosEtv(params, '');
            if (respuestaDatos != null) {
                datosReporte.push(respuestaDatos);
            }
        }
        this.acumulaTotalRetiros(datosReporte);
        return (datosReporte);
    }

    public obtenDatosRetirosEtv(params, strIdBilletes){

        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events, minAmount: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

        console.log(nomComponente+".obtenDatosRetirosEtv::  paramsCons <"+ JSON.stringify(paramsCons) + ">");

        let arrBillRetirosEtv:any[] = [];
        let arrBillRetirosEtv2      = {};
        let datosBilletes           = "";
        let strAntesDeCero          = "DOTAR CAPTURA CONTADORES - ANTES DE CERO";
        let strContadoresFinal      = "DOTAR CONTADORES FINAL";
        let strRegresandoATM        = "REGRESANDO A MODO ATM";
        let strEntrandoOos          = "Entrando a Oos";
        let billetesCaseteros       = "";
        let billetesRechazos        = "";

        if (gPaginasJournal.TotalPages > 0) {
            let datosJournal: any = [];
            for (let idx = 0; idx < gPaginasJournal.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post("", "GetEjaLogPage", paramsCons, this.GetEjaLogPage, false);
                if ( gDatosJournal.length > 0){
                    gDatosJournal.forEach( reg => {
// DOTAR CAPTURA CONTADORES - ANTES DE CERO[50x57|100x0|200x119|500x1178|][20x19|50x4|100x2|200x3|500x7|1000x16|][total=636530]
// DOTAR CONTADORES FINAL [50x0|100x0|200x0|500x0|total=0]
                        //console.log("obtenDatosRetirosEtv:: reg<"+JSON.stringify(reg)+">");
                        if (reg.Data.substring(0, strAntesDeCero.length) == strAntesDeCero) {
                            billetesCaseteros   = reg.Data.replace(/.*\[(.*)\].*\[(.*)\].*\[(.*)\]/, "$1");
                            arrBillRetirosEtv.push(billetesCaseteros);

                            billetesRechazos    = reg.Data.replace(/.*\[(.*)\].*\[(.*)\].*\[(.*)\]/, "$2");
                            arrBillRetirosEtv.push(billetesRechazos);
                            //console.log("obtenDatosRetirosEtv:: arrBillRetirosEtv<"+JSON.stringify(arrBillRetirosEtv)+">");
                        }

                        /*
                        if (reg.Data.substring(0, strIdBilletes.length) == strIdBilletes) {

                            datosBilletes = reg.Data.replace(/.*\[(.*)\]/, "$1");

                            if ( datosBilletes.indexOf("total") > 0){
                                datosBilletes = datosBilletes.substring(0,datosBilletes.indexOf("|total"))
                            }

                            arrBillDepJournal.push(datosBilletes);
                        }
                        */
                    })
                }
            }

            if (arrBillRetirosEtv != null) {
                console.log("obtenDatosRetirosEtv:: arrBillRetirosEtv<" + JSON.stringify(arrBillRetirosEtv) + ">");
                arrBillRetirosEtv2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetirosEtv, "|", "DB");
                console.log(JSON.stringify(arrBillRetirosEtv2));
            }
            return(arrBillRetirosEtv2);
        }
    }

    public obtenRetirosOper(params?) {

        console.log(nomComponente + ".obtenDatosRetiros:: Inicio");

        let datosReporte: any   = [];
        let respuestaDatos:any  = "";
        this.diaProceso         = 0;
        //this.datosReporte       = [];

        for (let dia = 1; dia < this.diasProcesar; dia++) {
            this.diaProceso++;
            let xdia                = (dia < 10) ? "0" + dia : dia;
            params.timeStampStart   = '2018-05-' + xdia + '-00-00';
            params.timeStampEnd     = '2018-05-' + xdia + '-23-59';
            respuestaDatos          = this.obtenDatosRetirosOper(params, '');
            if (respuestaDatos != null) {
                datosReporte.push(respuestaDatos);
            }
        }
        this.acumulaTotalRetiros(datosReporte);
        return (datosReporte);
    }

    public obtenDatosRetirosOper(params, strIdBilletes){

        params.ipAtm            = '11.50.2.8';
        let device:string[]     = ['AFD'];
        let events:string[]     = ['DispenseOk', 'DenominateInfo'];

        console.log(nomComponente+".obtenDatosRetirosOper:: params<"+JSON.stringify(params)+">");
        let paramsCons: any = {
            ip: [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: events, device: device
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

            let arrBillRetLogHardware:any[] = [];
            let billetesRetiro              = "";

            this.datosRespLogHma.forEach( (reg) => {

                if (reg.HmaEventId == 2083) { //'DenominateInfo'){
                    billetesRetiro = reg.Data;
                }else if(reg.HmaEventId == 2058){
                    arrBillRetLogHardware.push(billetesRetiro);
                    billetesRetiro = "";
                }
            });

            let arrBillRetLogHardware2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetLogHardware, ";", "BD");
            console.log(JSON.stringify(arrBillRetLogHardware2));
            return(arrBillRetLogHardware2);
        }
    }
}
