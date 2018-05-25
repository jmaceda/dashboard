// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
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
import { DatosJournalService }                          from '../../services/datos-journal.service';
import { UtilsService }                                 from '../../services/utils.service';
import { LogHmaService }                                from '../../services/log-hma.service';

import { AcumulaBilletesModel }                         from '../../models/acumula-billetes.model';

export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosResumenDeEfectivo:any;

export var gPaginasHMA:any;
export var gdatosHMA:any;
export var gPaginasJoural:any[] = [];
export var gDatosJoural:any[] = [];
export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];

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

var nomCompoente = "ResumenDeEfectivo";

@Component({
    selector   : 'resumen-efectivo',
    templateUrl: './efectivo-disponible.component.html',
    styleUrls  : ['./efectivo-disponible.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService]
})
export class EfectDispCoponent implements OnInit {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos: any = [];
    public dTipoListaParams: string = "A";
    public dSolicitaFechasIni = false;
    public dSolicitaFechasFin = false;
    public dUltimaActualizacion: string;
    public fchUltimaActualizacion:any = null;
    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;
    public arrDatosRetirosHMA:any;
    public datosUltimoCorte:any;
    public billetesDepositados : AcumulaBilletesModel    = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public billetesRetirados : AcumulaBilletesModel      = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
    public arrBilletesDisponibles : AcumulaBilletesModel[] = [];


    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public depositosPorTiendaService: DepositosPorTiendaService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService,
                public logHmaService: LogHmaService){
    }

    ngOnInit() {
        this.arrBilletesDisponibles.push(new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0));
        gDevicesAtm         = this.logHmaService.GetHmaDevices();
        gCatalogoEventos    = this.logHmaService.obtenEventos();
    }


    public parametrosConsulta(infoRecibida) {

        this.fchUltimaActualizacion = null;

        let fIniParam   = infoRecibida.fchInicio;
        let fFinParam   = infoRecibida.fchFin;
        let ipAtm       = infoRecibida.atm;
        let fchIniParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam: string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let datosParam: any = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};

        this.obtenDetalleRetiros(datosParam);
    }


    public obtenDetalleRetiros(filtrosCons:any) {

        let filtrosConsMovtos:any           = JSON.stringify(filtrosCons);
        let opc2                            = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        let datosCortesJournal:any          = [];
        let billetesDisponibles: any        = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        let ultimoCorte:any                 = [];
        let fchUltimoCorte:any              = Date();
        let montoUltimoCorte:any            = "";
        let fchUltimoCorte2:any             = "";

        ultimoCorte                         = datosCortesJournal[datosCortesJournal.length -1];
        if (ultimoCorte == undefined || ultimoCorte == null){
            return(0);
        }
        billetesDisponibles                 = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        datosCortesJournal                  = this.datosJournalService.obtenCortesJournal(filtrosCons);
        fchUltimoCorte                      = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc2);
        montoUltimoCorte                    = ultimoCorte.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        fchUltimoCorte2                     = fchUltimoCorte.replace(/[\/ :]/g,"-").split("-");
        fchUltimoCorte2                     = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte2[2], fchUltimoCorte2[1], fchUltimoCorte2[0], fchUltimoCorte2[3], fchUltimoCorte2[4]);

        filtrosCons                 = JSON.parse(filtrosConsMovtos);
        filtrosCons.timeStampStart  = fchUltimoCorte2;

        //this.billetesRetirados      = (this.infoLogHMA(filtrosCons));
        //this.billetesDepositados    = (this.infoDepositosEnJournal(filtrosCons));
        /*
         AcumulaBilletesModel {b20: 0, b50: 292, b100: 176, b200: 37, b500: 0, …}b20: 0b50: 292b100: 176b200: 37b500: 0b1000: 0monto: 39600opers: 35__proto__: Object
         this.billetesDepositados
         AcumulaBilletesModel {b20: 0, b50: 354, b100: 200, b200: 50, b500: 10, …}b20: 0b50: 354b100: 200b200: 50b500: 10b1000: 0monto: 52700opers: 8__proto__: Object
         */

        this.infoLogHMA(filtrosCons);

        billetesDisponibles.opers   = this.billetesDepositados.opers + this.billetesRetirados.opers;
        billetesDisponibles.b20     = this.billetesDepositados.b20   - this.billetesRetirados.b20;
        billetesDisponibles.b50     = this.billetesDepositados.b50   - this.billetesRetirados.b50;
        billetesDisponibles.b100    = this.billetesDepositados.b100  - this.billetesRetirados.b100;
        billetesDisponibles.b200    = this.billetesDepositados.b200  - this.billetesRetirados.b200;
        billetesDisponibles.b500    = this.billetesDepositados.b500  - this.billetesRetirados.b500;
        billetesDisponibles.b1000   = this.billetesDepositados.b1000 - this.billetesRetirados.b1000;
        billetesDisponibles.monto   = this.billetesDepositados.monto - this.billetesRetirados.monto;

        this.arrBilletesDisponibles[0] = billetesDisponibles;

        this.datosCortesETV(datosCortesJournal);

        this.datosUltimoCorte = sprintf("Ultimo Corte: %s [%s]", fchUltimoCorte, montoUltimoCorte);
        this.datosUltimoCorte = fchUltimoCorte;

        this.fchUltimaActualizacion = (new Date()).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }


    public infoLogHMA(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD", "DEP"],
            events: ["DenominateInfo", "DispenseOk", "NotesValidated", "CashInEndOk"]
        };

        console.log(nomComponente + ".infoLogHMA:: paramsCons -->"+JSON.stringify(paramsCons)+"<--");
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }

            let arrBilletesRetiro: any[] = [];
            let arrBilletesDeposito: any[] = [];
            let cveCat;
            let billetesRetiro:string = "";
            let billetesDeposito:string = "";

            datosRetirosHMA.forEach((reg) => {
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];

                switch (reg.Events){
                    case "DenominateInfo":
                        billetesRetiro = reg.Data;
                        break;
                    case "DispenseOk":
                        arrBilletesRetiro.push(billetesRetiro + ";");
                        billetesRetiro = "";
                        break;
                    case "NotesValidated":
                        billetesDeposito = reg.Data;
                        break;
                    case "CashInEndOk":
                        arrBilletesDeposito.push(billetesDeposito + ";");
                        billetesDeposito = "";
                        break;
                }
            });

            //console.log(nomComponente+".infoLogHMA:: billetesRetirados");
            this.billetesRetirados   = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");

            //console.log(nomComponente+".infoLogHMA:: billetesDepositados");
            this.billetesDepositados = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesDeposito, ";", "BD");
            //numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");

            //console.log(nomComponente+".infoLogHMA:: billetesRetirados("+JSON.stringify(this.billetesRetirados)+")");
            //console.log(nomComponente+".infoLogHMA:: billetesDepositados("+JSON.stringify(this.billetesDepositados)+")");
        }
        return(numBilletes);
    }


    public obtenDetalleRetirosX(filtrosCons:any) {

        let filtrosConsMovtos:any           = JSON.stringify(filtrosCons);
        let opc2                            = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        let datosCortesJournal:any          = [];
        let billetesDisponibles: any        = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        let ultimoCorte:any                 = [];
        let fchUltimoCorte:any              = Date();
        let montoUltimoCorte:any            = "";
        let fchUltimoCorte2:any             = "";

        billetesDisponibles                 = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);
        datosCortesJournal                  = this.datosJournalService.obtenCortesJournal(filtrosCons);
        ultimoCorte                         = datosCortesJournal[datosCortesJournal.length -1];
        fchUltimoCorte                      = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc2);
        montoUltimoCorte                    = ultimoCorte.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        fchUltimoCorte2                     = fchUltimoCorte.replace(/[\/ :]/g,"-").split("-");
        fchUltimoCorte2                     = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte2[2], fchUltimoCorte2[1], fchUltimoCorte2[0], fchUltimoCorte2[3], fchUltimoCorte2[4]);

        filtrosCons                 = JSON.parse(filtrosConsMovtos);
        filtrosCons.timeStampStart  = fchUltimoCorte2;

        //this.billetesRetirados      = (this.infoRetirosEnHMA(filtrosCons));
        //this.billetesDepositados    = (this.infoDepositosEnJournal(filtrosCons));

        billetesDisponibles.opers   = this.billetesDepositados.opers + this.billetesRetirados.opers;
        billetesDisponibles.b20     = this.billetesDepositados.b20   - this.billetesRetirados.b20;
        billetesDisponibles.b50     = this.billetesDepositados.b50   - this.billetesRetirados.b50;
        billetesDisponibles.b100    = this.billetesDepositados.b100  - this.billetesRetirados.b100;
        billetesDisponibles.b200    = this.billetesDepositados.b200  - this.billetesRetirados.b200;
        billetesDisponibles.b500    = this.billetesDepositados.b500  - this.billetesRetirados.b500;
        billetesDisponibles.b1000   = this.billetesDepositados.b1000 - this.billetesRetirados.b1000;
        billetesDisponibles.monto   = this.billetesDepositados.monto - this.billetesRetirados.monto;

        this.arrBilletesDisponibles[0] = billetesDisponibles;

        this.datosCortesETV(datosCortesJournal);

        this.datosUltimoCorte = sprintf("Ultimo Corte: %s [%s]", fchUltimoCorte, montoUltimoCorte);
        this.datosUltimoCorte = fchUltimoCorte;

        this.fchUltimaActualizacion = (new Date()).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public infoCortesETV:any[] = [];

    public datosCortesETV(datosCortesJournal){
        this.infoCortesETV = [];

        datosCortesJournal.forEach( (reg) => {
            this.infoCortesETV.push({
                TimeStamp: reg.TimeStamp, AtmName: reg.AtmName, Ip: reg.Ip, Amount: reg.Amount
            })
        })

        // Sort by price high to low
        this.infoCortesETV.sort(this.utilsService.sort_by('TimeStamp', true, parseInt));
    }

    GetEjaLogDataLength(paginasJoural: any, status) {
        gPaginasJoural = paginasJoural;
    }

    GetEjaLogPage(datosJoural: any, status) {
        gDatosJoural = datosJoural;
    }




    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }



    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    public infoRetirosEnHMAX(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        console.log(nomComponente + ".infoRetirosEnHMA:: -->"+JSON.stringify(paramsCons)+"<--");
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRetirosHMA = datosRetirosHMA.concat(gdatosHMA);
            }

            let arrBilletesRetiro: any[] = [];

            datosRetirosHMA.forEach((reg) => {
                arrBilletesRetiro.push(reg.Data + ";");
            });

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesRetiro, ";", "BD");
        }
        return(numBilletes);
    }

    public infoDepositosEnJournal(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons:any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: ["CashManagement"], CashManagement: 1, maxAmount: -1, authId: -1, cardNumber: -1, accountId: -1
        };

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength, false);

        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage, false);
                datosJournal = datosJournal.concat(gDatosJoural);
            }

            let arrBilletesJournal: any[] = [];

            datosJournal.forEach((reg) => {
                let i = reg.Data.indexOf("[");
                arrBilletesJournal.push(reg.Data.substring(i));
            });

            numBilletes = this.utilsService.obtenNumBilletesPorDenominacion(arrBilletesJournal, "|", "BD");
        }
        return(numBilletes);
    }
}
