import { Component, OnInit }                             from '@angular/core';
import { Input, Output} from '@angular/core';
import { LocationStrategy, PlatformLocation, Location }  from '@angular/common';
import { LegendItem, ChartType }                         from '../../lbd/lbd-chart/lbd-chart.component';
import * as Chartist                                     from 'chartist';
import { SoapService }                                   from '../../services/soap.service';
import { sprintf }                                       from "sprintf-js";
import {FormGroup, FormBuilder, Validators}              from '@angular/forms';
import { DepositosModel }                                from './models/depositos';
import 'rxjs/add/operator/pairwise';
import { Router }                               from '@angular/router';
import { ActivatedRoute }                       from '@angular/router';

// Importamos la clase del servicio
import { DesglosaBilletes }                     from './services/DesglosaBilletes.service';
import { GuardaDepositosBD }                    from './services/GuardaDepositosBD.service';
import { ErroresPorBanco }                      from '../../models/errores-por-banco.model';
import { FiltrosUtilsService }                  from '../../services/filtros-utils.service';
//import { ResOpersService }                    from '../../services/res-opers.service';
//import { ResOpersModel, IResOpersModel }      from '../../models/res-opers.models';
//import { DataBaseService }                    from '../../services/data-base.service';

import { ParamsAtmsComponent }                           from '../params-atms/params-atms.component';
import { ResumenOperacionesModel }              from '../../models/resumen-operaciones.model';
import { ResumenOperacionesService }            from '../../services/resumen-operaciones.service';
import * as moment from 'moment';

class ResumenOpers {
    desc: string;
    numOpers: number;
    monto: number;
    fchPrimerMto: string;
    fchUltimoMto: string;

    constructor(desc: string, numOpers: number, monto: number, fchPrimerMto: string, fchUltimoMto: string) {
        this.desc = desc;
        this.numOpers = numOpers;
        this.monto = monto;
        this.fchPrimerMto = fchPrimerMto;
        this.fchUltimoMto = fchUltimoMto;
    }
}

export var gNumPaginas                 = 0;
export var gNumRegistros               = 0;
export var gNumRegsProcesados          = 0;
export var aDatosJournal               = [];
export var gNumPaginasCompletas = 0;
//export var tIdx:number = 0;

var fechaSys = new Date();
var fechaHoy = sprintf("%4d-%02d-%02d",fechaSys.getFullYear(), (fechaSys.getMonth() + 1), fechaSys.getDate());
var ipAnterior:string = null;
var gFchInicioAnterior = null;
var gFchInicioFinAnterior = null;


// Formatea numeros
var l10nUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
var request;
var objStore;
var tiempoRefreshDatos:number = (1000 * 30 * 1); // Actualiza la información cada minuto.

//var Dexie;                    //require('dexie');
var dbDexie;
var db3;
var openRequest;
var storeRequest;
var bdRedBlu = 'RedBluDB';
var intervalId = null;
var arrDepositos = [];
var nomComponente:string = "ResumenOperacionesComponent";

export var gDatosJournal:any;

declare interface TblResumenPorBanco {
    dataRows: any[];
    totalRows: any[];
}

declare interface TblResDep {
    dataRows: any[];
}

export var arrDatosServidor:any[]     = [];
export var arrDatosServidorInc:any[]  = [];
export var arrDatosServidorBack:any[] = [];
export var numPagsCompletas:number    = 0;
export var numPaginaObtenida:number   = 0;


declare interface InterRetirosPorHora {
    headerRow: any[];
    datos: any[];
}

declare interface TblConsRetPorMes {
    datos: any[];
}


export class TblDomResOperacion{
    headerRow: any[];
    dataRows: any[];
}

export class TblResOperacion{
    dataRows: any[];
}

export class ErroresPorBancoX {
    private _name: string;
    public banco: number[] = [];

    constructor (name: string) {
        this._name = name;
    }

    acumulaError(name: string){

    }
}

export class DatosRetirosXhora{
    public dNumConsPorHora:number;
    public dNumRetirosPorHora:number;
    public dAcumMontoRetirosPorHora:number;

    constructor() {
        this.dNumConsPorHora = 0
        this.dNumRetirosPorHora = 0
        this.dAcumMontoRetirosPorHora = 0
    }
}


//export var datosATMs  = [];
export var ipATMs  = [];
var idxErrBanco:number = 0;

export var nomCompoente = "ResumenOperacionesComponent";
@Component({
  selector   : 'app-home',
  templateUrl: './resumen-operaciones.component.html',
  styleUrls  : ['./resumen-operaciones.component.css'],
  styles     : [`
  .even { color: red; }
  .odd { color: green; }
  `],
  providers: [
      SoapService,
      DesglosaBilletes,
      GuardaDepositosBD,
      ResumenOperacionesService
  ],
})
export class ResumenOperacionesComponent implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;

    chartOptions = {
        responsive: true
    };

    chartData = [
        { data: [330, 600, 260, 700], label: 'Account A' },
        { data: [120, 455, 100, 340], label: 'Account B' },
        { data: [45, 67, 800, 500], label: 'Account C' }
    ];
    public resumenOpers: ResumenOpers[];
    public tblResumenPorBanco: TblResumenPorBanco;
    public tblResDep: TblResDep;

    public emailChartType       : ChartType;
    public emailChartData       : any;
    public emailChartLegendItems: LegendItem[];

    public hoursChartType       : ChartType;
    public hoursChartData       : any;
    public hoursChartOptions    : any;
    public hoursChartResponsive : any[];
    public hoursChartLegendItems: LegendItem[];

    public TotalItems:number            = 0;
    public TotalPages:number            = 0;
 
    public dFchFinProceso: string = '2017-09-10';
    public dHraFinProceso: string = '23-59';

    public dNumDepositos: number      = 0;
    public dMontoDepositos: number    = 0;
    public dPrimerDeposito: string    = "";
    public dUltimoDeposito: string    = "";
    public dHraPrimerDeposito: string = "";
    public dHraUltimoDeposito: string = "";
    public dHraIniciaSesion: string = "";

    public dNumRetiros: number      = 0;
    public dMontoRetiros: number    = 0;
    public dMontoConsultas: number    = 0;
    public dMontoConsultasNoExito: number    = 0;
    public dHraPrimerRetiro: string = "";
    public dHraUltimoRetiro: string = "";

    // Retiros no exitosos
    public dNumRetirosNoExito: number      = 0;
    public dMontoRetirosNoExito: number    = 0;
    public dHraPrimerRetiroNoExito: string = "";
    public dHraUltimoRetiroNoExito: string = "";

    public dNumConsultas: number       = 0;
    public dHraPrimeraConsulta: string = "";
    public dHraUltimaConsulta: string  = "";

    public dNumConsultasNoExito: number       = 0;
    public dHraPrimeraConsultaNoExito: string = "";
    public dHraUltimaConsultaNoExito: string  = "";

    public dNumReversos: number      = 0;
    public dMontoReversos: number    = 0;
    public dHraPrimerReverso: string = "";
    public dHraUltimoReverso: string = "";

    public dNumCambioNIP: number       = 0;
    public dHraPrimerCambioNIP: string = "";
    public dHraUltimoCambioNIP: string = "";

    public dNumCambioNIPNoExito: number       = 0;
    public dHraPrimerCambioNIPNoExito: string = "";
    public dHraUltimoCambioNIPNoExito: string = "";

    public dNumRetirosPorHora      : Array<number>;
    public dNumConsultasPorHora    : Array<number>;
    public dAcumNumRetirosPorHora  : Array<number>;
    public dAcumNumConsultasPorHora: Array<number>;
    public dMontoRetirosPorHora    : Array<number>;
    public dAcumMontoRetirosPorHora: Array<number>;
    public dNumConsPorHora         : Array<number>;
    public opersBanco : object   = new Object();
    public listaBancos: any[] = [];
    public tBillDep:any[] = [{ tMonto: 0, tB20: 0, tB50: 0, tB100: 0, tB200: 0, tB500: 0, tB1000: 0}];
    public infoDepositos: DepositosModel[] = [];
    public datosRetirosXhora: Array<DatosRetirosXhora> = new Array(24);

    public encabRetPorHora  = {hHora:'Hora', hCons:'Consultas', hAcumCons:'Acumulado', hRet:'Retiros', hMonto: 'Monto', hAcumRet:'Acumulado'};
    public encabResumenOper = {hDesc:'Descripción', hOper:'Opers', hMonto:'Monto', hPrimera:'Primera', hUltima:'Última'};
    public encabResPorBanco = {hBanco:'Banco', hNumRetOk:'Retiros Exitosos', hNumRetNoOk:'Retiros Fallidos', hNumCons:'Consultas', hNumConsNoOk:'Consultas Fallidas', hNumReversos: 'Reversos'};
    public encabDepositos   = {hId:'ID', dCta: 'Cuenta', hHraIni:'Inicio', hHraFin: 'Finalizo', hMonto:'Monto', hBill20:'$20', hBill50:'$50', hBill100:'$100', hBill200:'$200', hBill500:'$500', hBill1000:'$1000'};

    public ipATM: string;

    public tblConsRetPorMes: TblConsRetPorMes;
    public iPs:any[] = ['11.40.2.2', '11.40.2.8'];

    public iniArrCeros(numElems, valIni):Array<number>{
        return([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    }

    public ipATMs:any[] = [];
    public paramsServicioNumPaginas:any = { ip: [], timeStampStart: "", timeStampEnd: "", events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1"};
    public tblResOperacion: TblResOperacion;
    public retiros: InterRetirosPorHora;
    public retiroNoOk    : object = {};
    public resumenPorBanco: Array<number> = [0, 0, 0, 0, 0, 0, 0];  //Dep, Ret, RetNo, Rech, Cons,ConsNo, Rev
    public listaErroresOper: any[] = [];
    public dotacion:any = {monto:0, estado: '', iniciaDota:'', terminaDota: ''};
    public minutosSinOperacion:number = 1;
    public tiempoSinOperaciones:number = 0;
    public msgError:string = "";
    public deposito:any = {terminaDota: '', iniciaDeposito: '', tiempoDowntime: '', montoDowntime: 0};
    public arrTarjetas:any[] = [];
    public listaErrsPorBanco: any[][] = [];
    public cErroresPorBanco: ErroresPorBanco[];
    public lErroresPorBanco: ErroresPorBanco[];

    public numPaginas = 0;
    public urlPath = "";

    public resDep:ResumenOperacionesModel;
    public resRet:ResumenOperacionesModel;
    public resRetNoExist:ResumenOperacionesModel;
    public resCons:ResumenOperacionesModel;
    public resConsNoExist:ResumenOperacionesModel;
    public resRev:ResumenOperacionesModel;
    public resCambiaNip:ResumenOperacionesModel;
    public resCambiaNipErr:ResumenOperacionesModel;

    constructor(private formBuilder: FormBuilder,
                public _soapService: SoapService,
                private _desglosaBilletes: DesglosaBilletes,
                public _guardaDepositosBD: GuardaDepositosBD,
                public activatedRoute: ActivatedRoute,
                public filtrosUtilsService: FiltrosUtilsService,
                public resumenOperacionesService: ResumenOperacionesService){

        console.log("ResumenOperacionesComponent:: Inicia");

        this.inicializaVariables();
    }

    public inicializaVariables(): void {

        this.TotalItems    = 0;
        this.TotalPages    = 0;
        this.dNumDepositos      = 0;
        this.dMontoDepositos    = 0;
        this.dPrimerDeposito    = "";
        this.dUltimoDeposito    = "";
        this.dHraPrimerDeposito = "";
        this.dHraUltimoDeposito = "";
        this.dHraIniciaSesion = "";

        this.dNumRetiros      = 0;
        this.dMontoRetiros    = 0;
        this.dMontoConsultas    = 0;
        this.dMontoConsultasNoExito = 0;
        this.dHraPrimerRetiro = "";
        this.dHraUltimoRetiro = "";

        // Retiros no exitosos
        this.dNumRetirosNoExito      = 0;
        this.dNumRetirosNoExito      = 0;
        this.dMontoRetirosNoExito    = 0;
        this.dHraPrimerRetiroNoExito = "";
        this.dHraUltimoRetiroNoExito = "";
    
        this.dNumConsultas       = 0;
        this.dHraPrimeraConsulta = "";
        this.dHraUltimaConsulta  = "";
    
        this.dNumConsultasNoExito       = 0;
        this.dHraPrimeraConsultaNoExito = "";
        this.dHraUltimaConsultaNoExito  = "";
    
        this.dNumReversos      = 0;
        this.dMontoReversos    = 0;
        this.dHraPrimerReverso = "";
        this.dHraUltimoReverso = "";
    
        this.dNumCambioNIP       = 0;
        this.dHraPrimerCambioNIP = "";
        this.dHraUltimoCambioNIP = "";
    
        this.dNumCambioNIPNoExito       = 0;
        this.dHraPrimerCambioNIPNoExito = "";
        this.dHraUltimoCambioNIPNoExito = "";
        
        this.dNumRetirosPorHora       = this.iniArrCeros(24, 0);
        this.dNumConsultasPorHora     = this.iniArrCeros(24, 0);
        this.dAcumNumRetirosPorHora   = this.iniArrCeros(24, 0);
        this.dAcumNumConsultasPorHora = this.iniArrCeros(24, 0);
        this.dMontoRetirosPorHora     = this.iniArrCeros(24, 0);
        this.dAcumMontoRetirosPorHora = this.iniArrCeros(24, 0);
        this.dNumConsPorHora          = this.iniArrCeros(24, 0);
        this.tBillDep                 = [{ tMonto: 0, tB20: 0, tB50: 0, tB100: 0, tB200: 0, tB500: 0, tB1000: 0}];

        this.infoDepositos = [];


        this.opersBanco  = {'nomBanco': "", 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
        this.listaBancos = [];
        this.listaErrsPorBanco = [];

        arrDatosServidor = [];
        for(let idx=0; idx<24; idx++){
            this.datosRetirosXhora[idx] = new DatosRetirosXhora();
        }

        arrDepositos = [];
        this.listaErroresOper = [];
        this.lErroresPorBanco = [];
        idxErrBanco=0;

        this.resumenOpers = [
            new ResumenOpers("Depósitos Exitosos", 0, 0, '', '')
        ];

        this.resDep                 = new ResumenOperacionesModel();
        this.resRet                 = new ResumenOperacionesModel();
        this.resRetNoExist          = new ResumenOperacionesModel();
        this.resCons                = new ResumenOperacionesModel();
        this.resConsNoExist         = new ResumenOperacionesModel();
        this.resRev                 = new ResumenOperacionesModel();
        this.resCambiaNip           = new ResumenOperacionesModel();
        this.resCambiaNipErr    = new ResumenOperacionesModel();
    };


    ngOnInit() {
        // Pinta las areas de la pantalla.
        this.resumenInicialOperaciones();
    }


    public resumenInicialOperaciones(){
        this.mResumenOperaciones();   // Arma la pantalla de los datos de la tabla del Resumen de Operaciones
        this.mRretirosPorHora();
        this.mResumenPorBanco();
        this.pResDep();
    }

    /* * Obtiene lso filtros para la consulta * */
    public parametrosConsulta(filtrosConsulta){

        console.log(nomComponente+".parametrosConsulta:: Params recibidos: ["+JSON.stringify(filtrosConsulta)+"]");

        let fIniParam           = filtrosConsulta.fchInicio;
        let fFinParam           = filtrosConsulta.fchFin;
        let ipAtm               = filtrosConsulta.atm;
        let fchIniParam:string  = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let fchFinParam:string  = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let paramsConsulta:any  = {timeStampStart: fchIniParam, timeStampEnd: fchFinParam, ipAtm: ipAtm};

        this.pDatosDelJournal(paramsConsulta);
    }


    /* ** Obtiene los datos del Journal * */
    public pDatosDelJournalOrig(filtrosCons){

        console.log(nomComponente+".pDatosDelJournal filtrosCons-->"+JSON.stringify(filtrosCons)+"<--");

        // *** Actualiza parametros para la consulta de los servicios.
        let paramsCons:any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1"
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        console.log(nomComponente + ".pDatosDelJournal::  paramsCons["+JSON.stringify(paramsCons)+"]");
        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);


        // Verifica si la consulta del servicio anterior indica que se tienen más de ceros paginas continua con el proceso.
        if (gNumPaginas > 0) {

            numPaginaObtenida = 0;
            if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
                ipAnterior = this.paramsServicioNumPaginas.ip[0];
                this.numPaginas = 0;
            }

            // *** Llama al servicio remoto para obtener la información solicitada del Journal.
            // ** this.numPaginas = Esta variable contiene el número de paginas completas de la última consulta.
            // ** gNumPaginas = El número máximo de información.
            for (let idx = gNumPaginasCompletas; idx < gNumPaginas; idx++) {
                paramsCons.page = idx;
                console.log(nomComponente+".pDatosDelJournal::  paramsCons["+JSON.stringify(paramsCons)+"]");
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
            }

            // Respalda el arreglo con las paginas completas (200 registros).
            console.log(nomComponente+".gNumRegistros [" + gNumRegistros + "]   gNumPaginasCompletas[" + gNumPaginasCompletas + "]");
            if (gNumRegistros > 200 && (gNumPaginas - 1) > gNumPaginasCompletas) { // && arrDatosServidorBack.length == 0){
                arrDatosServidorBack = arrDatosServidor;
                /* la primera consulta */
            }

            arrDatosServidor = arrDatosServidorBack;

            gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
            this.procesaDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

            if (arrDatosServidorInc.length > 0) {
                this.numPaginas = gNumPaginas - 1;
            }
            gNumPaginasCompletas = (gNumPaginas - 1);
        }else{
            this.procesaDatosLog([{}], gNumPaginas);
            this.cErroresPorBanco = [];
        }

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    public pDatosDelJournal(filtrosCons){

        console.log(nomComponente+".pDatosDelJournal filtrosCons-->"+JSON.stringify(filtrosCons)+"<--");

        // *** Actualiza parametros para la consulta de los servicios.
        let paramsCons:any = {
            ip: [filtrosCons.ipAtm], timeStampStart: filtrosCons.timeStampStart, timeStampEnd: filtrosCons.timeStampEnd,
            events: "-1", minAmount: "-1", maxAmount: "-1", authId: "-1", cardNumber: "-1", accountId: "-1"
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        console.log(nomComponente + ".pDatosDelJournal::  paramsCons["+JSON.stringify(paramsCons)+"]");
        this._soapService.post('', 'GetEjaLogDataLength', paramsCons, this.GetEjaLogDataLength);


        // Verifica si la consulta del servicio anterior indica que se tienen más de ceros paginas continua con el proceso.
        if (gNumPaginas > 0) {

            // *** Llama al servicio remoto para obtener la información solicitada del Journal.
            for (let idx = 0; idx < gNumPaginas; idx++) {
                paramsCons.page = idx;
                console.log(nomComponente+".pDatosDelJournal::  paramsCons["+JSON.stringify(paramsCons)+"]");
                this._soapService.post('', 'GetEjaLogPage', paramsCons, this.GetEjaLogPage);
                arrDatosServidor = arrDatosServidor.concat(gDatosJournal);
            }

            this.procesaDatosLog(arrDatosServidor, gNumPaginas);

        }else{
            this.procesaDatosLog([{}], gNumPaginas);
            this.cErroresPorBanco = [];
        }

        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    // Actualiza informciòn de la pantalla.
    public pActualizaInfo(): void {

        //console.log("pActualizaInfo:: url["+this.rutaActual+"]");

        // Se obtiene el nombre de la clase actual:  this.constructor.name
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0] ||
            (gFchInicioAnterior != this.paramsServicioNumPaginas.timeStampStart ||
             gFchInicioFinAnterior != this.paramsServicioNumPaginas.timeStampEnd) ||
             gFchInicioAnterior != this.dFchFinProceso || gFchInicioFinAnterior != this.dHraFinProceso){

            ipAnterior              = this.paramsServicioNumPaginas.ip[0];
            gFchInicioAnterior      = this.paramsServicioNumPaginas.timeStampStart;
            gFchInicioFinAnterior   = this.paramsServicioNumPaginas.timeStampEnd;
            this.numPaginas         = 0;
            gNumRegsProcesados      = 0;
            arrDatosServidorBack    = [];
            gNumPaginas             = 0;
            gNumRegsProcesados      = 0;
            numPagsCompletas        = 0;
            gNumPaginasCompletas    = 0;
        }

        if (intervalId != null){
            clearInterval(intervalId);
        }

        this.pDatosDelJournal('');
    }


    public incrementaBanco(tipoOper:string, nomBanco:string): void{

        if (nomBanco == undefined || nomBanco == null || nomBanco == ""){
            nomBanco = "********";
        }
        
        if ( this.listaBancos[nomBanco] == undefined ){
            this.opersBanco            = {'nomBanco': nomBanco, 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
            this.listaBancos[nomBanco] = {'opersBanco': {} };
        }else{
            this.opersBanco = this.listaBancos[nomBanco];
        }

        switch(tipoOper){
            case 'RE' : this.opersBanco['numRetOk']++; break;
            case 'REN': this.opersBanco['numRetNoOk']++; break;
            case 'CON': this.opersBanco['numCons']++; break;
            case 'COE': this.opersBanco['numConsNoOk']++; break;
            case 'REV': this.opersBanco['numReversos']++; break;
        }
        this.listaBancos[nomBanco] = this.opersBanco;
    }

    public detalleMovtosPorHora = {
        hora: 0,
        numCons: 0,
        acumNumCons: 0,
        montoCons: 0,
        numRetiro: 0,
        acumNumRetiro: 0,
        montoRetiro: 0,
        montoTotal: 0
    };

    public inforMovtosPorHora:any = new Array();

    public procesaDatosLog(result:object, numPag:number): void {

        this.inicializaVariables();

        let datosLog                = JSON.parse(JSON.stringify(result));
        let fchSys                  = new Date();
        let _horaSys                = fchSys.getHours();
        let tmpFechaSys             = sprintf("%04d-%02d-%02d",fchSys.getFullYear(), fchSys.getMonth() +1, fchSys.getDate());
        let listaBancos             = {};
        let tipoUltimaOperacion     = "";
        let iniciaDeposito          = "";
        let terminaDeposito         = "";
        let montoDeposito           = 0;
        let id                      = 0;
        let numIntentos             = 0;
        let nivelUltimoDeposito     = 0;
        let datosDeposito           = "";
        let iniciaSesDeposito       = "";
        let dataAnterior            = "";
        let idSesion                = 1;
        let montoSesion             = 0;
        let numDepositos            = 0;
        let rollbackDeposito        = 0;                      // 0=Indica que no se provoco Rollback en el depósito / 1=Rollback en el deposito.
        let tmpArqc                 = "";
        let tmpAquirer              = "";
        let tmpCardNumber           = "";
        let tmpAuthId               = "";
        let expRegCodErrRetiro      = /54|12|1003|62|5538|51/;
        this.resumenPorBanco        = [0, 0, 0, 0, 0, 0, 0];

        let idxReg = 0;
        //var idxRegLog = 0;
        let iniciaDota = 0;
        this.veficaHoraUlimaOperacion(datosLog);
        this.dotacion.estado = "Pendiente";
        this.deposito.tiempoDowntime = "Pendiente";
        let fchTerminaDota:any;
        let fchIniciaDepDota:any;
        let opcionesFchHra:any = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'};
        let detalleMovtosPorHora:any;
        let cveReg:any;

        for(let idx=0;idx < 24; idx++){
            detalleMovtosPorHora = {hora: 0, numCons: 0, acumNumCons: 0, montoCons: 0, numRetiro: 0, acumNumRetiro: 0, montoRetiro: 0, montoTotal: 0, comisCons: 0, comisRet: 0, comisTotal: 0, comisAcum: 0};
            cveReg = "R"+idx;

            this.inforMovtosPorHora[cveReg] = detalleMovtosPorHora;
            this.inforMovtosPorHora[cveReg].hora = idx;
        }

        datosLog.forEach((reg) => {

            let date                = new Date(reg.TimeStamp);
            let fch                 = sprintf("%04d-%02d-%02d %02d:%02d:%02d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            reg.TimeStamp           = fch;
            let _hora               = date.getHours();
            let tmpHoraOperacion    = sprintf("%02d:%02d:%02d", date.getHours(), date.getMinutes(), date.getSeconds());
            let tmpFechaOper        = sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth() + 1, date.getDate());

            fchSys                  = new Date();
            _horaSys                = (tmpFechaOper != tmpFechaSys) ? 23 : fchSys.getHours();

            if (iniciaDeposito != "" && (tipoUltimaOperacion != "D" || (reg.Data == "VALIDAUSUARIO IsValid TRUE" && reg.Id != id))){ 
                iniciaDeposito      = "";
                nivelUltimoDeposito = 0;
                montoSesion         = 0;
                numDepositos        = 0;
                rollbackDeposito    = 0;
                idSesion++;
                terminaDeposito     = "";
                numIntentos         = 0;
                datosDeposito       = "";
                iniciaSesDeposito   = reg.TimeStamp;
            }

            switch(reg.Event) {

                // Retiros
                case "Withdrawal": { 
                    switch(reg.Data){
                        
                        case "Withdrawal DispenseOk": {

                            this.resRet.incrementaOper();
                            this.resRet.incrementaMonto(reg.Amount);
                            this.resRet.hraPrimOper = (this.resRet.hraPrimOper == "") ? tmpHoraOperacion : this.resRet.hraPrimOper;
                            this.resRet.hraUltOper = tmpHoraOperacion;
                            this.inforMovtosPorHora = this.resumenOperacionesService.registraMovtosPorHora(this.inforMovtosPorHora, _hora, "ROK", reg.Amount);

                            if (_hora < 7){
                                this.dNumRetirosPorHora[6]++;
                                this.dAcumNumRetirosPorHora[6]++;
                                this.dMontoRetirosPorHora     [6] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[6]  += reg.Amount;
                            }else if(_hora <= _horaSys){
                                this.dNumRetirosPorHora[_hora]++;
                                this.dAcumNumRetirosPorHora[_hora]++;
                                this.dMontoRetirosPorHora     [_hora] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[_hora]  += reg.Amount;
                            }
                            this.datosRetirosXhora[_hora].dNumRetirosPorHora++;
                            this.datosRetirosXhora[_hora].dAcumMontoRetirosPorHora += reg.Amount;
                            tipoUltimaOperacion = "R";

                            if (tmpArqc == reg.Arqc && tmpCardNumber == reg.CardNumber && tmpAuthId == reg.AuthId){
                                this.incrementaBanco('RE', tmpAquirer);
                                tmpArqc       = "";
                                tmpAquirer    = "";
                                tmpCardNumber = "";
                                tmpAuthId     = "";
                            }
                            this.arrTarjetas["i"+idxReg] = reg.CardNumber;
                            break;
                        }

                        case "Withdrawal Service Error": {
                            this.incrementaBanco('REN', tmpAquirer);
                            break;
                        }

                        case "Approved transaction": {
                            if (reg.SwitchResponseCode == 0 && reg.HWErrorCode == "Aprobado"){
                                tmpArqc       = reg.Arqc;
                                tmpAquirer    = reg.Aquirer;
                                tmpCardNumber = reg.CardNumber;
                                tmpAuthId     = reg.AuthId;
                            }
                            break;
                        }

                        case "Respuesta Servicio": {
                            if (reg.SwitchResponseCode == 0){
                                tmpAquirer = reg.Aquirer;
                            }else{
                                reg.Aquirer = "";
                            }
                            tmpArqc = reg.Arqc;
                            break;
                        }

                        case "Withdrawal DispenseFail": {
                            this.resRetNoExist.incrementaMonto(reg.Amount);
                            this.resRetNoExist.hraPrimOper = (this.resRetNoExist.hraPrimOper == "") ? tmpHoraOperacion : this.resRetNoExist.hraPrimOper;
                            this.resRetNoExist.hraPrimOper = tmpHoraOperacion;
                            break;
                        }

                        case "Declined transaction": {
                            this.resRetNoExist.incrementaMonto(reg.Amount);
                            if(this.resRetNoExist.hraPrimOper == ""){
                                this.resRetNoExist.hraPrimOper = tmpHoraOperacion;
                            }
                            this.resRetNoExist.hraUltOper = tmpHoraOperacion;
                            break;
                        }

                        case "Withdrawal Reverse": {
                            this.resRev.incrementaOper();
                            this.resRev.incrementaMonto(reg.Amount);

                            if(this.resRev.hraPrimOper == ""){
                                this.resRev.hraPrimOper = tmpHoraOperacion;
                            }
                            this.resRev.hraUltOper = tmpHoraOperacion;
                            this.incrementaBanco('REV', reg.Aquirer);
                            break;
                        }
                    }  // Terminan Retiros.

                    if (reg.SwitchResponseCode != 0){
                        this.incrementaBanco('REN', reg.Aquirer);
                        if ((reg.HWErrorCode in this.retiroNoOk) == true){
                            this.retiroNoOk[reg.HWErrorCode]++; // = this.retiroNoOk[reg.HWErrorCode] + 1;
                        } else {
                            this.retiroNoOk[reg.HWErrorCode] = 1;
                        }
                        if ( expRegCodErrRetiro.test(reg.SwitchResponseCode) == true){
                            tmpAquirer = reg.Aquirer;
                        }
                        this.incrementaErrorBanco(tmpAquirer, reg.HWErrorCode, reg.SwitchResponseCode, 'R');
                        this.resRetNoExist.incrementaOper();
                    }
                    if(reg.SwitchResponseCode < 1000) {
                        this.arrTarjetas["i"+idxReg] = reg.CardNumber;
                    }
                    break;
                }

                // Consultas
                case "BalanceCheck": {

                    if (reg.SwitchResponseCode == 0) {

                        this.resCons.incrementaOper();
                        this.resCons.incrementaMonto(reg.Amount);
                        this.resCons.hraPrimOper = (this.resCons.hraPrimOper == "") ? tmpHoraOperacion : tmpHoraOperacion;
                        this.resCons.hraUltOper = tmpHoraOperacion;
                        this.inforMovtosPorHora = this.resumenOperacionesService.registraMovtosPorHora(this.inforMovtosPorHora, _hora, "COK", reg.Amount);

                        if (_hora < 7) {
                            this.dNumConsPorHora[6]++;
                        } else {
                            this.dNumConsPorHora[_hora]++;
                        }

                        this.datosRetirosXhora[_hora].dNumConsPorHora++;
                        this.incrementaBanco('CON', reg.Aquirer);
                        tmpAquirer = reg.Aquirer;
                    } else {
                        this.resConsNoExist.incrementaOper();
                        this.resConsNoExist.incrementaMonto(reg.Amount);

                        if (this.resConsNoExist.hraUltOper == "") {
                            this.resConsNoExist.hraUltOper = tmpHoraOperacion;
                        }
                        this.resConsNoExist.hraPrimOper = tmpHoraOperacion;

                        this.incrementaBanco('COE', reg.Aquirer);
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode, 'C');
                    }
                    if (reg.SwitchResponseCode < 1000) {
                        this.arrTarjetas["i" + idxReg] = reg.CardNumber;
                    }
                    tipoUltimaOperacion = "C";

                    break;
                }
                    
                case "CASH MANAGEMENT": {

                    if (reg.Data == "VALIDAUSUARIO IsValid TRUE") {
                        iniciaDeposito = tmpHoraOperacion; //reg.TimeStamp;
                        if (this.resDep.hraPrimOper == "") {
                            this.resDep.hraPrimOper = tmpHoraOperacion;
                        }
                        this.dHraIniciaSesion = tmpHoraOperacion;
                    }

                    if (reg.Data.substring(0, 32) == "PROCESADEPOSITO ConfirmaDeposito") {
                        this.resDep.incrementaOper();
                        this.resDep.incrementaMonto(reg.Amount);
                        this.resDep.hraUltOper = tmpHoraOperacion;

                        let denominaBilletes = this.pDenominacionesBilletes(reg.Data);

                        arrDepositos.push(
                            {
                                dId: this.dNumDepositos,
                                dCta: reg.AccountId,
                                dHraIni: this.dHraIniciaSesion,
                                dHraFin: tmpHoraOperacion,
                                dMonto: reg.Amount,
                                dBill20: denominaBilletes.b20,
                                dBill50: denominaBilletes.b50,
                                dBill100: denominaBilletes.b100,
                                dBill200: denominaBilletes.b200,
                                dBill500: denominaBilletes.b500,
                                dBill1000: denominaBilletes.b1000,
                            }
                        );
                    }

                    if (reg.OperationType == "ControlMessage") {
                        if (reg.Data.substring(0, 21) == "VALIDAUSUARIO IsValid") {
                            iniciaSesDeposito = reg.TimeStamp;
                            iniciaDeposito = reg.TimeStamp;
                            nivelUltimoDeposito = 1;

                        } else if (reg.Data == "INPUTREFUSED ItemsTaken") {
                            numIntentos++;
                            nivelUltimoDeposito = 2;
                        } else if (reg.Data == "CASHINFAILED OnLoad") {

                        } else if (reg.Data == "CASHINFAILED RollbackOk") {
                            rollbackDeposito++;
                        }
                    }

                    if ((reg.OperationType == "CashManagement" && reg.Data.substring(0, 32) == "PROCESADEPOSITO ConfirmaDeposito") ||
                        (reg.OperationType == "ControlMessage" && reg.Data == "CASHINFAILED ItemsTaken")) {
                        dbDexie = this._guardaDepositosBD.calculaTiempoDeposito(dbDexie, idSesion, 2, iniciaDeposito, reg.TimeStamp, numIntentos, reg.Amount, reg.Data, rollbackDeposito);
                        montoSesion += reg.Amount;
                        numIntentos = 0;
                        numDepositos++;

                        if (iniciaDota == 3) {
                            this.deposito.iniciaDeposito = this.dHraPrimerDeposito;
                            this.deposito.terminaDota = this.dotacion.terminaDota;
                            this.deposito.montoDowntime = reg.Amount;
                            fchIniciaDepDota = reg.TimeStamp;
                            this.deposito.iniciaDeposito = reg.TimeStamp.split(" ")[1];
                            this.deposito.tiempoDowntime = this.calculaDownTime(fchTerminaDota, fchIniciaDepDota, this.deposito.iniciaDeposito, this.deposito.terminaDota);
                            iniciaDota = 0;
                        }
                    }

                    dataAnterior = reg.Data;
                    tipoUltimaOperacion = "D";
                    terminaDeposito = reg.TimeStamp;
                    montoDeposito = reg.Amount;

                    break;
                }

                case "PinChange": {
                    if (reg.SwitchResponseCode == 0) {
                        this.dNumCambioNIP++;
                        this.resCambiaNip.incrementaOper();
                        if (this.resCambiaNip.hraPrimOper == "") {
                            this.resCambiaNip.hraPrimOper = tmpHoraOperacion;
                        }
                        this.resCambiaNip.hraUltOper = tmpHoraOperacion;
                    } else {
                        this.dNumCambioNIPNoExito++;
                        this.resCambiaNipErr.incrementaOper();
                        this.resCambiaNipErr.incrementaOper();
                        if (this.resCambiaNipErr.hraPrimOper == "") {
                            this.resCambiaNipErr.hraPrimOper = tmpHoraOperacion;
                        }
                        this.resCambiaNipErr.hraUltOper = tmpHoraOperacion;
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode, "P");
                    }
                    tipoUltimaOperacion = "P";
                    break;
                }

                case "ADMIN": {

                    if(reg.AuthId == "LOGIN") {
                        iniciaDota = 1;
                        this.dotacion.iniciaDota = tmpHoraOperacion;
                        this.dotacion.estado = "En proceso";
                    }

                    if(reg.Data == "INICIO DOTACIÓN") {
                        iniciaDota = 2;
                    }
                    if (iniciaDota == 2){
                        if ( reg.Data != null ){
                            if(reg.Data.substring(0, 40) == "DOTAR CAPTURA CONTADORES - ANTES DE CERO") {
                                this.dotacion.monto = reg.Amount;
                            }
                        }
                        //console.log("reg.Data["+reg.Data+"]");
                        if (reg.Data != null && reg.Data == "REGRESANDO A MODO ATM [AFD EXCHANGE ACTIVE TRUE] [CDM EXCHANGE ACTIVE FALSE]"){
                            this.dotacion.terminaDota   = tmpHoraOperacion;
                            this.dotacion.estado        = "Concluida";
                            iniciaDota                  = 3;
                            fchTerminaDota              = reg.TimeStamp;
                        }
                    }
                }
            }

            if (reg.Event == "CASH MANAGEMENT" && reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                id = reg.Id
            }
            idxReg++;
        });

        console.log("resDep ["+JSON.stringify(this.resDep)+"]");
        console.log("resRet ["+JSON.stringify(this.resRet)+"]");
        console.log("resRetNoExist ["+JSON.stringify(this.resRetNoExist)+"]");
        console.log("resCons ["+JSON.stringify(this.resCons)+"]");
        console.log("resConsNoExist ["+JSON.stringify(this.resConsNoExist)+"]");
        console.log("resRev ["+JSON.stringify(this.resRev)+"]");
        console.log("resCambiaNIP ["+JSON.stringify(this.resCambiaNip)+"]");
        console.log("resCambiaNipErr ["+JSON.stringify(this.resCambiaNipErr)+"]");

        this.inforMovtosPorHora = this.resumenOperacionesService.acumulaMovtosPorHora(this.inforMovtosPorHora);

        /*
         hora: 0,
         numCons: 0,
         acumNumCons: 0,
         montoCons: 0,
         numRetiro: 0,
         acumNumRetiro: 0,
         montoRetiro: 0,
         acumMontoRetiro: 0,
         montoTotal: 0
         */

        let horaSys = (new Date()).getHours();
        for (let i in this.inforMovtosPorHora) {
            let info = this.inforMovtosPorHora[i];

            if (info.hora <= horaSys)
                console.log(sprintf("%02d  %4d  %4d  %4d  %4d  %6d  %6d - %6d %6d %6d %6d", info.hora, info.numCons, info.acumNumCons, info.numRetiro, info.acumNumRetiro, info.montoRetiro, info.acumMontoRetiro, info.comisCons, info.comisRet, info.comisTotal, info.comisAcum));
        }

        this.mResumenOperaciones();
        this.mRretirosPorHora();
        this.mResumenPorBanco();
        this.pResDep();

        let idxx=0;

         for (var key in this.arrTarjetas) {
            let value = this.arrTarjetas[key];
            if( this.arrTarjetas[key] == '547146XXXXXX8650'){
                idxx = Number( key.substr(1));
                break;
            }
        }

        let idx = 0;
        let arrErrsBanco:any[] = [];
        Object.keys(this.listaErrsPorBanco).sort().forEach(function (banco) {
            let errsBanco = this[banco]

            for (let cve in errsBanco) {
                let codError = (cve.substring(cve.lastIndexOf("_"))).replace(/[\(\)_]/g,"");
                let cveError = cve.substring(0,cve.lastIndexOf("_(")).replace(/_/g," ");
                arrErrsBanco.push(new ErroresPorBanco(banco, cveError, Number(codError), errsBanco[cve], 'X'));
            }
        }, this.listaErrsPorBanco)

        this.cErroresPorBanco = arrErrsBanco;
    }


    public calculaDownTime(fchInicial, fchFinal, horaInicial, horaFinal){

        let hora1 = (horaInicial).split(":");
        let hora2 = (horaFinal).split(":");

        let date1 = new Date();
        let date2 = new Date();
        let tiempoTranscurrido:string = "";

        date1.setHours(Number(hora1[0]), Number(hora1[1]), Number(hora1[2]));
        date2.setHours(Number(hora2[0]), Number(hora2[1]), Number(hora2[2]));

        date1.setHours(date1.getHours() - date2.getHours(),
            date1.getMinutes() - date2.getMinutes(),
            date1.getSeconds() - date2.getSeconds()
        );

        if (date1.getHours() > 1){
            tiempoTranscurrido +=sprintf("%sh. ",date1.getHours());
        }
        if (date1.getMinutes() > 1){
            tiempoTranscurrido +=sprintf("%sm. ",date1.getMinutes());
        }
        if (date1.getSeconds() > 1){
            tiempoTranscurrido +=sprintf("%ss. ",date1.getSeconds());
        }

        return(tiempoTranscurrido);
    }

    public veficaHoraUlimaOperacion(datosLog){

        let tiempoSinOperacion  = (60 * 1000) * this.minutosSinOperacion;
        let reg:any             = datosLog[datosLog.length-1];
        let dateSys:any         = new Date().getTime();
        let dateOper            = new Date(reg.TimeStamp);
        let dateSist            = new Date();
        let tmpFechaOper        = sprintf("%04d-%02d-%02d", dateOper.getFullYear(), dateOper.getMonth() + 1, dateOper.getDate());
        let tmpFechaSist        = sprintf("%04d-%02d-%02d", dateSist.getFullYear(), dateSist.getMonth() + 1, dateSist.getDate());

        if (tmpFechaOper == tmpFechaSist) {
            this.tiempoSinOperaciones = Math.round(((dateSys - reg.TimeStamp) / 1000) / 60);

            console.log("Log: [" + reg.TimeStamp + "]   [" + new Date(reg.TimeStamp) + "]");
            console.log("Actual: [" + dateSys + "]   [" + new Date(dateSys) + "]");
            this.msgError = "";
            if ((dateSys - reg.TimeStamp) > tiempoSinOperacion) {
                console.log("**** No ha habido operaciones aproximadamente en " + this.tiempoSinOperaciones + " minutos ****");
                this.msgError = "**** No ha habido operaciones aproximadamente en " + this.tiempoSinOperaciones + " minutos ****";
            }
        }
    }


    public incrementaErrorBanco(nomBanco, descError, codError, tipoOper){

        if (descError.length > 0) {
            if (nomBanco == undefined || nomBanco == null || nomBanco.length == 0){
                nomBanco = "********";
            }
            this.lErroresPorBanco[idxErrBanco++] = new ErroresPorBanco(nomBanco, descError, codError, 1, tipoOper);

            let desc = descError.replace(/ /g, "_")+"_("+codError+")";

            if (this.listaErrsPorBanco[nomBanco] == undefined) {
                this.listaErrsPorBanco[nomBanco] = []
                if (this.listaErrsPorBanco[nomBanco][desc] == undefined) {
                    this.listaErrsPorBanco[nomBanco][desc] = 1;
                } else {
                    this.listaErrsPorBanco[nomBanco][desc]++;
                }
            } else {
                if (this.listaErrsPorBanco[nomBanco][desc] == undefined) {
                    this.listaErrsPorBanco[nomBanco][desc] = 1;
                } else {
                    this.listaErrsPorBanco[nomBanco][desc]++;
                }
            }
        }
    }

    // Arma la pantalla de los datos de la tabla del Resumen de Operaciones
    public mResumenOperaciones():void{

        this.tblResOperacion = {
            dataRows: [
                {etiqueta: "Depósitos Exitosos",     numOpers: this.resDep.numOpers,            monto: this.resDep.montoOpers,          primerMto: this.resDep.hraPrimOper,          ultimoMto: this.resDep.hraUltOper},
                {etiqueta: "Retiros Exitosos",       numOpers: this.resRet.numOpers,            monto: this.resRet.montoOpers,          primerMto: this.resRet.hraPrimOper,          ultimoMto: this.resRet.hraUltOper},
                {etiqueta: "Retiros No Exitosos*",   numOpers: this.resRetNoExist.numOpers,     monto: this.resRetNoExist.montoOpers,   primerMto: this.resRetNoExist.hraPrimOper,   ultimoMto: this.resRetNoExist.hraUltOper},
                {etiqueta: "Consultas Exitosas",     numOpers: this.resCons.numOpers,           monto: this.resCons.montoOpers,         primerMto: this.resCons.hraPrimOper,         ultimoMto: this.resCons.hraUltOper},
                {etiqueta: "Consultas No Exitosas*", numOpers: this.resConsNoExist.numOpers,    monto: this.resConsNoExist.montoOpers,  primerMto: this.resConsNoExist.hraPrimOper,  ultimoMto: this.resConsNoExist.hraUltOper},
                {etiqueta: "Reversos",               numOpers: this.resRev.numOpers,            monto: this.resRev.montoOpers,          primerMto: this.resRev.hraPrimOper,          ultimoMto: this.resRev.hraUltOper},
                {etiqueta: "Cambio NIP Exitoso",     numOpers: this.resCambiaNip.numOpers,      monto: 0,                               primerMto: this.resCambiaNip.hraPrimOper,    ultimoMto: this.resCambiaNip.hraUltOper},
                {etiqueta: "Cambio NIP Erroneo",     numOpers: this.resCambiaNipErr.numOpers,   monto: 0,                               primerMto: this.resCambiaNipErr.hraPrimOper, ultimoMto: this.resCambiaNipErr.hraUltOper}
            ]
        };
    }

    // Arma los datos de la tabla del Depositos
    pResDep():void{

        this.tblResDep = {
            dataRows: arrDepositos
        };

        for(let idx=0; idx < arrDepositos.length; idx++){
            this.tBillDep[0].tMonto += Number(arrDepositos[idx].dMonto);
            this.tBillDep[0].tB20   += Number(arrDepositos[idx].dBill20);
            this.tBillDep[0].tB50   += Number(arrDepositos[idx].dBill50);
            this.tBillDep[0].tB100  += Number(arrDepositos[idx].dBill100);
            this.tBillDep[0].tB200  += Number(arrDepositos[idx].dBill200);
            this.tBillDep[0].tB500  += Number(arrDepositos[idx].dBill500);
            this.tBillDep[0].tB1000 += Number(arrDepositos[idx].dBill1000);
        }
    }

    // Arma la información de la tabla de Resumen de Operaciones por Banco
    public mResumenPorBanco():void{


        let arrDatos = [];
        let arrTotDatos = [{fNumBancos: 0, fNumRetOk: 0, fNumRetNoOK: 0, fNumCons: 0, fNumConsNoOk: 0, fNumReversos: 0, fnumRechazos: 0}];
        let fNumBancos = 0;
        let fNumRetOk = 0;
        let fNumRetNoOK = 0;
        let fNumCons = 0;
        let fNumConsNoOk = 0;
        let fNumReversos = 0;
        let fnumRechazos = 0;

        Object.keys(this.listaBancos).sort().forEach(function(banco) {

            let datosBanco =  this[banco];
            arrDatos.push({ dBanco: banco,                          dNumRetOk: datosBanco['numRetOk'],
                            dNumRetNoOk: datosBanco['numRetNoOk'],  dNumCons: datosBanco['numCons'],
                            dNumConsNoOk: datosBanco['numConsNoOk'],dNumReversos: datosBanco['numReversos'],
                            dNumRechazos: datosBanco['numRechazos']
            });

            fNumBancos++;
            fNumRetOk += datosBanco['numRetOk'];
            fNumRetNoOK += datosBanco['numRetNoOk'];
            fNumCons += datosBanco['numCons'];
            fNumConsNoOk += datosBanco['numConsNoOk'];
            fNumReversos += datosBanco['numReversos'];
        }, this.listaBancos);

        this.tblResumenPorBanco = {
            dataRows: arrDatos,
            totalRows: [
                {   fNumBancos: "Total Bancos: "+fNumBancos, fNumRetOk: fNumRetOk, fNumRetNoOK: fNumRetNoOK,
                    fNumCons: fNumCons, fNumConsNoOk: fNumConsNoOk, fNumReversos: fNumReversos
                }
            ]
        };
    }

    // Despiega en la pagina la información de Consultas y Retiros.
    public mRretirosPorHora():void{

        // Acumula los movimientos que se realizaron antes de la 7 de la mañana.
        let tNumRetiros         = 0;
        let tAcumNumRetiros     = 0;
        let tNumConsultas       = 0;
        let tAcumNumConsultas   = 0;
        let tMontoRetiros       = 0;
        let tAcumMontoRetiros   = 0;
        let tNumConsPorHora     = 0;
        let arrRetiros          = [];


        for(let idx=0; idx < 7; idx++){
            tNumConsultas += this.dNumConsPorHora[idx];
            tNumRetiros   += this.dNumRetirosPorHora[idx];
            if ( idx > 0){
                tAcumNumConsultas += this.dNumConsPorHora[idx] + this.dNumConsPorHora[idx -1];
                tAcumNumRetiros   += this.dNumRetirosPorHora[idx] + this.dNumRetirosPorHora[idx -1];
                tMontoRetiros     += this.dMontoRetirosPorHora[idx];
                tAcumMontoRetiros += this.dAcumMontoRetirosPorHora[idx -1] + this.dMontoRetirosPorHora[idx];
            }else{
                tNumConsultas      = this.dNumConsPorHora[idx];
                tAcumNumRetiros    = this.dNumRetirosPorHora[idx];
                tMontoRetiros      = this.dMontoRetirosPorHora[idx];
                tAcumMontoRetiros  = this.dAcumMontoRetirosPorHora[idx];
            }
        }

        // Agrega al objeto arrRetiros los movimientos que entraron antes de la 7 de la manañana
        let carVacio = "0";
        let tmpHora = "<7";
        arrRetiros.push(
        {
            hora:                    tmpHora,
            numConsultasPorHora:     tNumConsultas,
            acumNumConsultasPorHora: tAcumNumConsultas,
            numRetirosPorHora:       tNumRetiros,
            acumNumRetirosPorHora:   tAcumNumRetiros,
            montoRetirosPorHora:     tMontoRetiros,
            acumMontoRetirosPorHora: tAcumMontoRetiros
        });

        let acumCons:Array<number>  = new Array(24);
        let acumRet:Array<number>   = new Array(24);
        let acumMonto:Array<number> = new Array(24);


        for(let idx=0; idx < 24; idx++){
            acumCons[idx]   = (idx == 0) ? this.dNumConsPorHora[idx]        : this.dNumConsPorHora[idx]         + acumCons[idx -1];
            acumRet[idx]    = (idx == 0) ? this.dNumRetirosPorHora[idx]     : this.dNumRetirosPorHora[idx]      + acumRet[idx -1];
            acumMonto[idx]  = (idx == 0) ? this.dMontoRetirosPorHora[idx]   : this.dMontoRetirosPorHora[idx]    + acumMonto[idx -1];
        }

        // Agrega al objeto arrRetiros los movimientos que entraron despues de la 7 de la manañana
        for(let idx=7; idx < this.dAcumNumRetirosPorHora.length; idx++){
            if ( this.dNumConsPorHora[idx] > 0 || this.dNumRetirosPorHora[idx] > 0) {
                arrRetiros.push(
                {
                    hora:                       sprintf("%02s", idx.toString()),
                    numConsultasPorHora:        (this.dNumConsPorHora[idx] > 0 ? this.dNumConsPorHora[idx] : carVacio),
                    acumNumConsultasPorHora:    acumCons[idx],
                    numRetirosPorHora:          (this.dNumRetirosPorHora[idx] > 0 ? this.dNumRetirosPorHora[idx] : carVacio),
                    acumNumRetirosPorHora:      acumRet[idx],
                    montoRetirosPorHora:        (this.dMontoRetirosPorHora[idx] > 0 ? this.dMontoRetirosPorHora[idx] : carVacio),
                    acumMontoRetirosPorHora:    acumMonto[idx]
                });
            }
        }

        this.tblConsRetPorMes = {
            datos: arrRetiros
        };
    }

    //  Recupera la respueta del servicio xxx con el que se obtiene el número de paginas y registro del Journal
    public GetEjaLogDataLength(result:object, status){
        gNumPaginas   = JSON.parse(JSON.stringify(result)).TotalPages;
        gNumRegistros = JSON.parse(JSON.stringify(result)).TotalItems;
        console.log(nomComponente+".:: paginas["+JSON.stringify(result)+"]");
    }

    //  Recupera la respueta del servicio xxx con el que se obtiene ela información del Journal
    public GetEjaLogPage(result:any[], status){
        gDatosJournal = result;
        console.log(nomComponente+".obtenDatosJournal:: Pagina: ["+numPaginaObtenida+"]   Renglones: ["+result.length+"]");
    }


    pDenominacionesBilletes(infoBilletes:string){

        let montoTotal      = 0;
        let respBilletes    = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, total: 0};
        let posInicial      = infoBilletes.indexOf('[');
        let posFinal        = infoBilletes.indexOf(']', posInicial);
        let billetes1       = infoBilletes.substr(posInicial, (posFinal - posInicial)).replace(/[\[\]]/g,'');
        let arrBilletes     = billetes1.split("|");

        for(let idx=0; idx < arrBilletes.length; idx++){
            let cantidad     = arrBilletes[idx].split("x")[0];
            let denomina     = arrBilletes[idx].split("x")[1];
            respBilletes['b'+denomina] = Number(cantidad);
            respBilletes.total += Number(denomina) * Number(cantidad);
        }
        return(respBilletes);
    }
}

function comparar ( a, b ){ return a - b; }

// 1361 lineas (version 1)