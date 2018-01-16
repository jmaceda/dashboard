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

import { AcumulaBilletesModel }                         from '../../models/acumula-billetes.model';




//export var gGetGroupsWithAtms:any;
export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosResumenDeEfectivo:any;

export var gPaginasHMA:any;
export var gdatosHMA:any;
export var gPaginasJoural:any[] = [];
export var gDatosJoural:any[] = [];

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
    providers: [SoapService, DepositosPorTiendaService, DatosJournalService, UtilsService]
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
                public utilsService: UtilsService) {
    }

    ngOnInit() {
        this.arrBilletesDisponibles.push(new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0));
    }


    parametrosConsulta(infoRecibida) {

        this.fchUltimaActualizacion = null;
        //let parametrossConsulta: any = {};

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

    public obtenDetalleRetiros(filtrosCons:any) {

        let filtrosConsMovtos:any           = JSON.stringify(filtrosCons);
        let opc2                            = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        let datosCortesJournal:any          = this.datosJournalService.obtenCortesJournal(filtrosCons);
        let ultimoCorte                     = datosCortesJournal[datosCortesJournal.length -1];
        let fchUltimoCorte                  = (new Date(ultimoCorte.TimeStamp)).toLocaleString(undefined, opc2);
        let montoUltimoCorte                = ultimoCorte.Amount.toLocaleString("es-MX",{style:"currency", currency:"MXN"});
        let fchUltimoCorte2                 = fchUltimoCorte.replace(/[\/ :]/g,"-").split("-");
        fchUltimoCorte2                     = sprintf("%4d-%02d-%02d-%02d-%02d", fchUltimoCorte2[2], fchUltimoCorte2[1], fchUltimoCorte2[0], fchUltimoCorte2[3], fchUltimoCorte2[4]);

        let billetesDisponibles: AcumulaBilletesModel    = new AcumulaBilletesModel(0, 0, 0, 0, 0, 0, 0, 0);



        filtrosCons                 = JSON.parse(filtrosConsMovtos);
        filtrosCons.timeStampStart  = fchUltimoCorte2;

        this.billetesRetirados      = (this.infoRetirosEnHMA(filtrosCons));
        this.billetesDepositados    = (this.infoDepositosEnJournal(filtrosCons));

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


    GetHmaLogPage(datosHMA:any, status){
        gdatosHMA = datosHMA;
    }



    GetHmaLogDataLength(paginasHMA:any, status){
        gPaginasHMA = paginasHMA;
    }

    public infoRetirosEnHMA(filtrosCons) {

        let numBilletes:AcumulaBilletesModel;
        let paramsCons: any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            device: ["AFD"],
            events: ["DenominateInfo"]
        };

        console.log(nomComponente + ".infoRetirosEnHMA:: -->"+JSON.stringify(paramsCons)+"<--");
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength);

        if (gPaginasHMA.TotalPages > 0) {
            let datosRetirosHMA: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage);
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

        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);

        if (gPaginasHMA.TotalPages > 0) {
            let datosJournal: any = [];
            this.arrDatosRetirosHMA = [];

            for (let idx = 0; idx < gPaginasHMA.TotalPages; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
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
