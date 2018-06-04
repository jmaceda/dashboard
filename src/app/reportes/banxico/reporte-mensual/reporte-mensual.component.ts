// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';

import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { SoapService }                                  from '../../../services/soap.service';
import { FiltrosUtilsService }                          from '../../../services/filtros-utils.service';
import { DepositosPorTiendaService }                    from '../../../services/acumulado-por-deposito.service';
import { DatosJournalService }                          from '../../../services/datos-journal.service';
import { UtilsService }                                 from '../../../services/utils.service';
import { LogHmaService }                                from '../../../services/log-hma.service';

import { AcumulaBilletesModel }                         from '../../../models/acumula-billetes.model';
import { NotificationsComponent }                       from '../../../notifications/notifications.component';

export var gGetGroupsAtmsIps      : any;
export var gGetAtmDetail          : any;
export var gDatosGpoActual        : any;
export var gGrupos                : any;
export var gDatosResumenDeEfectivo: any;

export var gPaginasHMA    : any;
export var gdatosHMA      : any;
export var gPaginasJournal: any = {TotalPages: 0, TotalItems: 0};
export var gDatosJournal  : any[] = [];



var arrDatosJournal:any[] = [];

export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[]      = [];
export var arrDatosServidor:any[] = [];
export var gNumPagsLogHma         = 0;
export var gNumRegsLogHma         = 0;
export var gRespDatosLogHma: any;

var nomComponente = "RetirosHmaComponent";

export class GetAtmDetail{
    Id         : string;
    Description: string;
    Ip         : string;
    Name       : string;
    groupId    : number;

    constructor(Id: string, Description: string, Ip: string, Name: string, groupId: number){
        this.Id          = Id;
        this.Description = Description;
        this.Ip          = Ip;
        this.Name        = Name;
        this.groupId     = groupId;
    }
}

export class GetGroupsAtmsIps{
    IdAtms: string;

    constructor(IdAtms: string){
        this.IdAtms = IdAtms;
    }
}

export class GetGroupsWithAtms{
    Id          : string;
    Description : string;
    Description2: string;

    constructor(Id: string, Description: string, Description2: string){
        this.Id           = Id;
        this.Description  = Description;
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
    providers: [SoapService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService, NotificationsComponent]
})
export class ReporteMensualComponent implements OnInit {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos: any       = [];
    public dTipoListaParams: string = "A";   // Valores permitidos:  G = Grupo / A = ATM
    public dSolicitaFechasIni       = true;  // true = Solicitara fecha inicial de parametros.
    public dSolicitaFechasFin       = true;  // true = Solicitara fecha final de parametros.
    public dUltimaActualizacion  : string;
    public fchUltimaActualizacion: any = null;
    public itemResource = new DataTableResource([]);
    public items        = [];
    public itemCount    = 0;
    public arrDatosRetirosHMA    : any;
    public datosUltimoCorte      : any;
    public billetesDepositados   : AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public billetesRetirados     : AcumulaBilletesModel = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public arrBilletesDisponibles: AcumulaBilletesModel[] = [];

    private datosRespLogHma: any[]    = [];
    public  datosReporte: any[]       = [];
    public  diaProceso: number        = 0;
    public  totalRetirosReporte: any  = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public  totalDepositosReporte:any = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};  //{b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public  totalSaldo:any            = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
    public  totalReporteMensual:any[] = [];
    public  detalleDepositos:any      = [];
    public  detalleDotaciones:any     = [];
    public  detalleRetiros:any        = {};
    private diasProcesar:number       = 16;
    private fchInicialProceso         = "";
    private isDatosJournal:boolean    = false;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService      : FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService,
                public datosJournalService      : DatosJournalService,
                public utilsService             : UtilsService,
                public logHmaService            : LogHmaService,
                public notificationsComponent  : NotificationsComponent) {

        this.notificationsComponent = new NotificationsComponent();
    }

    ngOnInit() {
        this.arrBilletesDisponibles.push(new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0));
        gDevicesAtm      = this.logHmaService.GetHmaDevices();
        gCatalogoEventos = this.logHmaService.obtenEventos();
    }

    public sumaDiasFecha(fchTmp, numDias){
        let fch = new Date(fchTmp.replace(/-/,"/"));
        fch.setDate(fch.getDate() + numDias);
        let fchRes = sprintf("%04d-%02d-%02d", fch.getFullYear(), (fch.getMonth()+1), fch.getDate());
        return(fchRes);
    }

    public validaRangoFechas(datosParam){
        if (datosParam.timeStampStart.substring(0,10) == datosParam.timeStampEnd.substring(0,10)){
            return(true);
        }
        return(false);
    }

    public parametrosConsulta(infoRecibida) {

        this.notificationsComponent.showNotification('top','center', 'info', 'Se va a generar el reporte del cajero indicado');

        this.fchUltimaActualizacion = null;

        let fIniParam           = infoRecibida.fchInicio;
        let fFinParam           = infoRecibida.fchFin;
        let ipAtm               = infoRecibida.atm;
        let fchIniParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam: any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};
        this.obtenDatos(datosParam);
    }


    public obtenDatos(params?) {

        this.totalDepositosReporte = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
        this.totalRetirosReporte   = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
        this.totalSaldo            = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0};
        this.totalReporteMensual   = [];

        let fchInicio:any = new Date();

        this.obtenDepositos(params);
        this.obtenRetiros(params);
        this.calculaTotalSaldos();
        this.fchInicialProceso  = params.timeStampStart;
        let fchFin:any          = new Date();

        this.totalReporteMensual.push({
            concepto: "Depósitos",
            b20     : this.totalDepositosReporte.b20,
            b50     : this.totalDepositosReporte.b50,
            b100    : this.totalDepositosReporte.b100,
            b200    : this.totalDepositosReporte.b200,
            b500    : this.totalDepositosReporte.b500,
            b1000   : this.totalDepositosReporte.b1000,
            opers   : this.totalDepositosReporte.opers,
            monto   : this.totalDepositosReporte.monto
        });

        this.totalReporteMensual.push({
            concepto: "Retiros",
            b20     : this.totalRetirosReporte.b20,
            b50     : this.totalRetirosReporte.b50,
            b100    : this.totalRetirosReporte.b100,
            b200    : this.totalRetirosReporte.b200,
            b500    : this.totalRetirosReporte.b500,
            b1000   : this.totalRetirosReporte.b1000,
            opers   : this.totalRetirosReporte.opers,
            monto   : this.totalRetirosReporte.monto
        });

        this.totalReporteMensual.push({
            concepto: "Saldo",
            b20     : this.totalSaldo.b20,
            b50     : this.totalSaldo.b50,
            b100    : this.totalSaldo.b100,
            b200    : this.totalSaldo.b200,
            b500    : this.totalSaldo.b500,
            b1000   : this.totalSaldo.b1000,
            opers   : this.totalSaldo.opers,
            monto   : this.totalSaldo.monto
        });

        console.log(JSON.stringify(this.totalReporteMensual));

        if (this.totalReporteMensual.length > 0) {
            $('#btnExpExel').css('cursor', 'pointer');
            this.isDatosJournal = true;
        }else{
            this.notificationsComponent.showNotification('top','center', 'warning', 'No existe información para el reporte del cajero indicado');
            $('#btnExpExel').css('cursor', 'not-allowed');
            this.isDatosJournal = false;
        }
    }

    public obtenDepositos(params){
        this.detalleDepositos  = [];
        this.detalleDotaciones = [];

        this.obtenDatosDotaciones(params);
        this.obtenDatosDepositos(params);
    }

    public obtenRetiros(params){
        this.obtenRetirosOper(params);
        this.obtenRetirosEtv(params);
    }

    public calculaTotalSaldos(){

        this.totalSaldo = {
            b20  : this.totalDepositosReporte.b20      - this.totalRetirosReporte.b20,
            b50  : this.totalDepositosReporte.b50      - this.totalRetirosReporte.b50,
            b100 : this.totalDepositosReporte.b100     - this.totalRetirosReporte.b100,
            b200 : this.totalDepositosReporte.b200     - this.totalRetirosReporte.b200,
            b500 : this.totalDepositosReporte.b500     - this.totalRetirosReporte.b500,
            b1000: this.totalDepositosReporte.b1000    - this.totalRetirosReporte.b1000,
            opers: this.totalDepositosReporte.opers    + this.totalRetirosReporte.opers,
            monto: this.totalDepositosReporte.monto    - this.totalRetirosReporte.monto
        }
    }

    public acumulaTotalDepositos(datosDepositos){
        datosDepositos.forEach( reg => {
            this.totalDepositosReporte.b20   += reg.b20;
            this.totalDepositosReporte.b50   += reg.b50;
            this.totalDepositosReporte.b100  += reg.b100;
            this.totalDepositosReporte.b200  += reg.b200;
            this.totalDepositosReporte.b500  += reg.b500;
            this.totalDepositosReporte.b1000 += reg.b1000;
            this.totalDepositosReporte.opers += reg.opers;
            this.totalDepositosReporte.monto += reg.monto;
        });
    }

    public acumulaTotalRetiros(datosReporte){

        datosReporte.forEach( reg => {
            this.totalRetirosReporte.b20   += reg.b20;
            this.totalRetirosReporte.b50   += reg.b50;
            this.totalRetirosReporte.b100  += reg.b100;
            this.totalRetirosReporte.b200  += reg.b200;
            this.totalRetirosReporte.b500  += reg.b500;
            this.totalRetirosReporte.b1000 += reg.b1000;
            this.totalRetirosReporte.opers += reg.opers;
            this.totalRetirosReporte.monto += reg.monto;
        });
    }

    public GetHmaLogDataLength(respNumPaginasLogHma: object, status) {
        gNumPagsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
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
        params.events = ['Replenishment'];

        let strIdBilletes      = "DOTAR CONTADORES FINAL";
        let respuestaDatos:any = "";

        this.diaProceso = 0;

        this.detalleDotaciones.push ({b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0});

        respuestaDatos = this.obtenDetalleDepositos(params, strIdBilletes);

        if (respuestaDatos != null) {
            this.detalleDotaciones.push ( respuestaDatos );
        }

        this.acumulaTotalDepositos(this.detalleDotaciones);
    }


    public obtenDatosDepositos(params){
        params.events = ['CashManagement'];

        let respuestaDatos:any = "";
        let strIdBilletes      = "PROCESADEPOSITO ConfirmaDeposito";

        this.detalleDepositos.push ({b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, opers: 0, monto: 0});

        respuestaDatos = this.obtenDetalleDepositos(params, strIdBilletes);

        if (respuestaDatos != null) {
            this.detalleDepositos.push ( respuestaDatos );
            
        }
        this.acumulaTotalDepositos(this.detalleDepositos);
        
    }


    public obtenDetalleDepositos(params, strIdBilletes){

        let paramsCons: any = {
            ip    : [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events,  minAmount     : 1,                     maxAmount   : -1,                  authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

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

            return(arrBillDepJournal2);

        }
    }

    public obtenRetirosEtv(params?) {

        let datosReporte:any   = [];
        let respuestaDatos:any = "";
        this.diaProceso        = 0;

        params.events = ['Administrative', 'Replenishment'];

        respuestaDatos = this.obtenDatosRetirosEtv(params, '');
        if (respuestaDatos != null) {
            datosReporte.push(respuestaDatos);
        }
        this.acumulaTotalRetiros(datosReporte);
        return (datosReporte);
    }

    public obtenDatosRetirosEtv(params, strIdBilletes){

        let paramsCons: any = {
            ip    : [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events,  minAmount     : 1,                     maxAmount   : -1,                  authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post("", "GetEjaLogDataLength", paramsCons, this.GetEjaLogDataLength, false);

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
                        if (reg.Data.substring(0, strAntesDeCero.length) == strAntesDeCero) {
                            billetesCaseteros = reg.Data.replace(/.*\[(.*)\].*\[(.*)\].*\[(.*)\]/, "$1");
                            arrBillRetirosEtv.push(billetesCaseteros);

                            billetesRechazos = reg.Data.replace(/.*\[(.*)\].*\[(.*)\].*\[(.*)\]/, "$2");
                            arrBillRetirosEtv.push(billetesRechazos);
                        }
                    })
                }
            }

            if (arrBillRetirosEtv != null) {
                arrBillRetirosEtv2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetirosEtv, "|", "DB");
            }
            return(arrBillRetirosEtv2);
        }
    }

    public obtenRetirosOper(params?) {
        let datosReporte: any  = [];
        let respuestaDatos:any = "";

        params.events   = ["DenominateInfo", "MediaTaken"];  // DenominateInfo=2083   /   MediaTaken=2057
        params.device   = ["AFD"];
        this.diaProceso = 0;

        respuestaDatos = this.obtenDatosRetirosOper(params, '');
        if (respuestaDatos != null) {
            datosReporte.push(respuestaDatos);
        }
        this.acumulaTotalRetiros(datosReporte);
        return (datosReporte);
    }

    public obtenDatosRetirosOper(params, strIdBilletes){

        let paramsCons: any = {
            ip    : [params.ipAtm], timeStampStart: params.timeStampStart, timeStampEnd: params.timeStampEnd,
            events: params.events,  device        : params.device
        };

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

                if (reg.HmaEventId == 2083) { // 'DenominateInfo'
                    billetesRetiro = reg.Data;
                }else if(reg.HmaEventId == 2057){  // 'MediaTaken'
                    arrBillRetLogHardware.push(billetesRetiro);
                    billetesRetiro = "";
                }
            });

            let arrBillRetLogHardware2 = this.utilsService.obtenNumBilletesPorDenominacion(arrBillRetLogHardware, ";", "BD");
            return(arrBillRetLogHardware2);
        }
    }

    public exportaReporteMensual2Excel(){
        $('#btnExpExel').css('cursor', 'not-allowed');
        this.isDatosJournal = false;

        this.notificationsComponent.showNotification('bottom','right', 'info', 'Exportado información del Journal a formato CVS');
        this.datosJournalService.exportaReporteMensual2Excel(this.totalReporteMensual);

        $('#btnExpExel').css('cursor', 'pointer');
        this.isDatosJournal = true;
    }
}
