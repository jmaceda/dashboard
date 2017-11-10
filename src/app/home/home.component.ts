import { Component, OnInit }                             from '@angular/core';
import { Input, Output} from '@angular/core';
import { LocationStrategy, PlatformLocation, Location }  from '@angular/common';
import { LegendItem, ChartType }                         from '../lbd/lbd-chart/lbd-chart.component';
import * as Chartist                                     from 'chartist';
import { SoapService }                                   from '../services/soap.service';
import { sprintf }                                       from "sprintf-js";
import {FormGroup, FormBuilder, Validators}              from '@angular/forms';
import { DepositosModel }                                from './models/depositos';
import { Logger, Level }                                 from "angular2-logger/core";
import { DepositosComponent }                            from "./datosDepositos/depositos.component"
import { AlertComponent }                                from './tmp/alert.component';
// import Dexie                                             from 'dexie';


// Importamos la clase del servicio
import { DesglosaBilletes } from './services/DesglosaBilletes.service';
import { GuardaDepositosBD } from './services/GuardaDepositosBD.service';

// import { DxDataGridModule } from 'devextreme-angular';
// import { Customer, Service } from './app.service';


import { ChartsModule } from 'ng2-charts/ng2-charts';


//import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
//import { listLocales } from 'ngx-bootstrap/bs-moment';
//import { de } from 'ngx-bootstrap/locale';


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
var tiempoRefreshDatos:number = 30000; //(1000 * 60 * 1); // Actualiza la información cada minuto.

//var Dexie;                    //require('dexie');
var dbDexie;
var db3;
var openRequest;
var storeRequest;
var bdRedBlu = 'RedBluDB';
var intervalId = null;
var arrDepositos = [];

declare interface TblResumenPorBanco {
    headerRow: any[];
    dataRows: any[];
    totalRows: any[];
}

declare interface TblResumenDepositos {
    headerRow: any[];
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
    headerRow: any[];
    datos: any[];
}


export class TblDomResOperacion{
    headerRow: any[];
    dataRows: any[];
}

export class TblResOperacion{
    headerRow: any[];
    dataRows: any[];
}

export class ErroresPorBanco {
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

    constructor(){
        this.dNumConsPorHora = 0
        this.dNumRetirosPorHora = 0
        this.dAcumMontoRetirosPorHora = 0
    }
}


export var datosATMs  = [];
export var ipATMs  = [];


@Component({
  selector   : 'app-home',
  templateUrl: './home.component.html',
  styleUrls  : ['./home.component.css'],
  styles     : [`
  .even { color: red; }
  .odd { color: green; }
  `],
  providers: [SoapService, DepositosComponent, DesglosaBilletes, GuardaDepositosBD],   //, Service],
})
export class HomeComponent implements OnInit  {

    chartOptions = {
        responsive: true
    };

    chartData = [
        { data: [330, 600, 260, 700], label: 'Account A' },
        { data: [120, 455, 100, 340], label: 'Account B' },
        { data: [45, 67, 800, 500], label: 'Account C' }
    ];

    //chartLabels = ['January', 'February', 'Mars', 'April'];

    /*
    onChartClick(event) {
        console.log(event);
    }
*/
    /*
    newDataPoint(dataArr = [100, 100, 100], label) {

        this.chartData.forEach((dataset, index) => {
            this.chartData[index] = Object.assign({}, this.chartData[index], {
                data: [...this.chartData[index].data, dataArr[index]]
            });
        });

        this.chartLabels = [...this.chartLabels, label];

    }
    */


    //Level = Level;



    /*
    private myDatePickerOptions: IMyDpOptions = {
        dateFormat: 'dd.mm.yyyy',
        height    : '34px',
        width     : '210px',
        inline    : false
    };

    private myForm  : FormGroup;
    private selector: number = 0;
*/
    // Initialized to specific date (09.10.2018).
   // private model: Object = { date: { year: 2018, month: 10, day: 9 } };


    //public tblDomResOperacion: TblDomResOperacion;
    public tblResumenPorBanco: TblResumenPorBanco;
    public tblResumenDepositos: TblResumenDepositos;


    public emailChartType       : ChartType;
    public emailChartData       : any;
    public emailChartLegendItems: LegendItem[];

    public hoursChartType       : ChartType;
    public hoursChartData       : any;
    public hoursChartOptions    : any;
    public hoursChartResponsive : any[];
    public hoursChartLegendItems: LegendItem[];

    public tipoGraficaRetirosPorHora      : ChartType;
    public datosGraficaRetirosPorHora     : any;
    public opcionesGraficaRetirosPorHora  : any;
    public responsiveGraficaRetirosPorHora: any[];
    public elementosGraficaRetirosPorHora : LegendItem[];

    /*
    public activityChartType       : ChartType;
    public activityChartData       : any;
    public activityChartOptions    : any;
    public activityChartResponsive : any[];
    public activityChartLegendItems: LegendItem[];
*/
    public bsValue     : any ;
    public bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];

    selectedItem: any;
    icons       : string[];
    items       : Array<{title: string, note: string, icon: string}>;

    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string                  = '/services/dataservices.asmx';
    public nomServicioPaginas: string   = 'GetEjaLogDataLength';
    public nomServicioDatosLog: string  = 'GetEjaLogPage';
    public TotalItems:number            = 0;
    public TotalPages:number            = 0;
    public tmpTotalItems:number         = 0;
    public tmpTotalPages:number         = 0;

    public numRetiros:number      = 0;
    public numConsultas:number    = 0;
    public tmpNumRetiros:number   = 0;
    public tmpNumConsultas:number = 0;
    public dFchIniProceso: string = '2017-09-10';
    public dFchFinProceso: string = '2017-09-10';
    public dHraIniProceso: string = '00-00';
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



    public ipATM: string;

    public tblConsRetPorMes: TblConsRetPorMes;
    public iPs:any[] = ['11.40.2.2', '11.40.2.8'];

    public iniArrCeros(numElems, valIni):Array<number>{
        return([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    }

    public datosATMs:any[] = [];
    public ipATMs:any[] = [];

    public inicializaVariables(): void {

        this.TotalItems    = 0;
        this.TotalPages    = 0;
        this.tmpTotalItems = 0;
        this.tmpTotalPages = 0;

        this.numRetiros      = 0;
        this.numConsultas    = 0;
        this.tmpNumRetiros   = 0;
        this.tmpNumConsultas = 0;

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

        arrDatosServidor = [];
        for(let idx=0; idx<24; idx++){
            this.datosRetirosXhora[idx] = new DatosRetirosXhora();
        }

        arrDepositos = [];
        this.listaErroresOper = [];
    };

    public paramsServicioNumPaginas: {
        ip            : any[],
        timeStampStart: string,
        timeStampEnd  : string,
        events        : string,
        minAmount     : string,
        maxAmount     : string,
        authId        : string,
        cardNumber    : string,
        accountId     : string
    } = {
        ip            : ['11.40.2.2'],
        timeStampStart: this.dFchIniProceso + "-" + this.dHraIniProceso,
        timeStampEnd  : this.dFchFinProceso + "-" + this.dHraFinProceso,
        events        : "-1",
        minAmount     : "-1",
        maxAmount     : "-1",
        authId        : "-1",
        cardNumber    : "-1",
        accountId     : "-1"
    };


    paramsServicioDatosLog: {
        ip            : any[],
        timeStampStart: string,
        timeStampEnd  : string,
        events        : string,
        minAmount     : string,
        maxAmount     : string,
        authId        : string,
        cardNumber    : string,
        accountId     : string,
        page          : number
    } = {
        ip            : this.paramsServicioNumPaginas.ip,
        timeStampStart: this.dFchIniProceso + "-" + this.dHraIniProceso,
        timeStampEnd  : this.dFchFinProceso + "-" + this.dHraFinProceso,
        events        : "-1",
        minAmount     : "-1",
        maxAmount     : "-1",
        authId        : "-1",
        cardNumber    : "-1",
        accountId     : "-1",
        page          : 0
    };

    public tblResOperacion: TblResOperacion;
    public retiros: InterRetirosPorHora;
    public retiroNoOk    : object = {};
    public resumenPorBanco: Array<number> = [0, 0, 0, 0, 0, 0, 0];  //Dep, Ret, RetNo, Rech, Cons,ConsNo, Rev

    // Actualiza informciòn de la pantalla.
    public pActualizaInfo(): void {

        console.log("this.paramsServicioNumPaginas.ip["+this.paramsServicioNumPaginas.ip[0]+"]");
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0] ||
            (gFchInicioAnterior != this.paramsServicioNumPaginas.timeStampStart ||
             gFchInicioFinAnterior != this.paramsServicioNumPaginas.timeStampEnd)){

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
        setTimeout(() => { this.pDatosDelJournal(); }, 300);
        intervalId = setInterval(() => { this.pDatosDelJournal(); }, tiempoRefreshDatos);
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
            /*case 'REC': this.opersBanco['numRechazos']++; break;*/
            case 'CON': this.opersBanco['numCons']++; break;
            case 'COE': this.opersBanco['numConsNoOk']++; break;
            case 'REV': this.opersBanco['numReversos']++; break;
        }
        this.listaBancos[nomBanco] = this.opersBanco;
    }

    public listaErroresOper: any[] = [];

    public guardaErrores(descError: string):void{
        //console.log("guardaErrores:: Inicio ["+descError+"]");
        if ( this.listaErroresOper[descError] == undefined ){
            this.listaErroresOper[descError] = 1;
        }else{
            this.listaErroresOper[descError]++;
        }

        ErroresPorBanco

    }

    public obtenDatosLog(result:object, numPag:number): void {

        this.inicializaVariables();

        let datosLog        = JSON.parse(JSON.stringify(result));
        let fchSys          = new Date();
        let _horaSys        = fchSys.getHours();
        let _horaUltimaOper = _horaSys;
        let tmpFechaSys     = sprintf("%04d-%02d-%02d",fchSys.getFullYear(), fchSys.getMonth() +1, fchSys.getDate());
        let listaBancos     = {};
        //let tmpAquirer      = "";
        //let tmpArqc         = "";
        let tipoUltimaOperacion  = "";
        let iniciaDeposito       = "";
        let terminaDeposito      = "";
        let montoDeposito        = 0;
        let id                   = 0;
        let numIntentos          = 0;
        let nivelUltimoDeposito  = 0;
        let datosDeposito        = "";
        let iniciaSesDeposito    = "";
        let dataAnterior         = "";
        let idSesion             = 1;
        let montoSesion          = 0;
        let numDepositos         = 0;
        let rollbackDeposito     = 0;                      // 0=Indica que no se provoco Rollback en el depósito / 1=Rollback en el deposito.
        let tmpArqc              = "";
        let tmpAquirer           = "";
        let tmpCardNumber        = "";
        let tmpAuthId            = "";

        this.resumenPorBanco = [0, 0, 0, 0, 0, 0, 0];

        datosLog.forEach((reg)=>{

            let date = new Date(reg.TimeStamp);
            let _hora = date.getHours();
            let tmpHoraOperacion = sprintf("%02d:%02d:%02d", date.getHours(), date.getMinutes(), date.getSeconds());
            let tmpFechaOper = sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth() + 1, date.getDate());

            fchSys = new Date();
            _horaSys = (tmpFechaOper != tmpFechaSys) ? 23 : fchSys.getHours();
            _horaUltimaOper = _horaSys;

            if (iniciaDeposito != "" && (tipoUltimaOperacion != "D" || (reg.Data == "VALIDAUSUARIO IsValid TRUE" && reg.Id != id))){ 
                iniciaDeposito      = "";
                terminaDeposito     = "";
                numIntentos         = 0;
                datosDeposito       = "";
                iniciaSesDeposito   = reg.TimeStamp;
                nivelUltimoDeposito = 0;
                idSesion++;
                montoSesion      = 0;
                numDepositos     = 0;
                rollbackDeposito = 0;
            }

            switch(reg.Event) {

                // Retiros
                case "Withdrawal": { 
                    switch(reg.Data){
                        
                        case "Withdrawal DispenseOk": { 
                            this.dNumRetiros++;
                            this.dMontoRetiros += reg.Amount;

                            if(this.dHraPrimerRetiro == ""){
                                this.dHraPrimerRetiro = tmpHoraOperacion;
                            }
                            this.dHraUltimoRetiro = tmpHoraOperacion;
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

                            break;
                        }

                        case "Withdrawal Service Error": {
                            this.incrementaBanco('REN', tmpAquirer);
                            //this.guardaErrores(reg.HWErrorCode);
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
                            //this.dNumRetirosNoExito++;
                            this.dMontoRetirosNoExito += reg.Amount;
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion;
                            //this.guardaErrores(reg.HWErrorCode);
                            break;
                        }

                        case "Declined transaction": {
                            //this.dNumRetirosNoExito++;
                            this.dMontoRetirosNoExito += reg.Amount;
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion;
                            //this.guardaErrores(reg.HWErrorCode);
                            break;
                        }

                        case "Withdrawal Reverse": {
                            this.dNumReversos++;
                            this.dMontoReversos += reg.Amount;
                            if(this.dHraPrimerReverso == ""){
                                this.dHraPrimerReverso = tmpHoraOperacion
                            }
                            this.dHraUltimoReverso = tmpHoraOperacion;
                            this.incrementaBanco('REV', reg.Aquirer);
                            break;
                        }
                    }

                    if (reg.SwitchResponseCode != 0){
                        this.incrementaBanco('REN', reg.Aquirer);
                        if ((reg.HWErrorCode in this.retiroNoOk) == true){
                            this.retiroNoOk[reg.HWErrorCode]++; // = this.retiroNoOk[reg.HWErrorCode] + 1;
                        } else {
                            this.retiroNoOk[reg.HWErrorCode] = 1;
                        }
                        if(reg.SwitchResponseCode == 54 || reg.SwitchResponseCode == 12 || reg.SwitchResponseCode == 1003 || reg.SwitchResponseCode == 62  || reg.SwitchResponseCode == 55  || reg.SwitchResponseCode == 38  || reg.SwitchResponseCode == 51){
                            tmpAquirer = reg.Aquirer;
                        }
                        this.incrementaErrorBanco(tmpAquirer, reg.HWErrorCode, reg.SwitchResponseCode);
                        this.dNumRetirosNoExito++;
                    }
                    break;
                }

                // Consultas
                case "BalanceCheck":

                    if(reg.SwitchResponseCode == 0){
                        this.dNumConsultas++;
                        this.dMontoConsultas += reg.Amount;

                        if(this.dHraPrimeraConsulta == ""){
                            this.dHraPrimeraConsulta = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsulta = tmpHoraOperacion;
                        if (_hora < 7){
                            this.dNumConsPorHora[6]++;
                        }else{
                            this.dNumConsPorHora[_hora]++;
                        }

                        this.datosRetirosXhora[_hora].dNumConsPorHora++;
                        this.incrementaBanco('CON', reg.Aquirer);
                        tmpAquirer = reg.Aquirer;
                    }else{
                        this.dNumConsultasNoExito++;
                        this.dMontoConsultasNoExito += reg.Amount;

                        if(this.dHraPrimeraConsultaNoExito == ""){
                            this.dHraPrimeraConsultaNoExito = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsultaNoExito = tmpHoraOperacion;
                        this.incrementaBanco('COE', reg.Aquirer);
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode);
                    }
                    tipoUltimaOperacion = "C";
                    
                    break;
                    
                case "CASH MANAGEMENT": 

                    if (reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                        iniciaDeposito = tmpHoraOperacion; //reg.TimeStamp;
                        if(this.dHraPrimerDeposito == ""){
                            this.dHraPrimerDeposito = tmpHoraOperacion;
                        }
                        this.dHraIniciaSesion = tmpHoraOperacion;
                    }

                    if (reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito"){
                        this.dNumDepositos++;
                        this.dMontoDepositos += reg.Amount;
                        this.dHraUltimoDeposito = tmpHoraOperacion;

                        let denominaBilletes = this.pDenominacionesBilletes(reg.Data);

                        arrDepositos.push(
                            {   dId: this.dNumDepositos, dHraIni: this.dHraIniciaSesion, dHraFin: tmpHoraOperacion, dMonto: reg.Amount,
                                dBill20: denominaBilletes.b20,
                                dBill50: denominaBilletes.b50,
                                dBill100: denominaBilletes.b100,
                                dBill200: denominaBilletes.b200,
                                dBill500: denominaBilletes.b500,
                                dBill1000: denominaBilletes.b1000,
                            }
                        );
                    }    
                    
                    if (reg.OperationType == "ControlMessage"){
                        if (reg.Data.substring(0,21) == "VALIDAUSUARIO IsValid"){
                            iniciaSesDeposito   = reg.TimeStamp;
                            iniciaDeposito      = reg.TimeStamp;
                            nivelUltimoDeposito = 1;
                            
                        } else if (reg.Data == "INPUTREFUSED ItemsTaken"){
                            numIntentos++;
                            nivelUltimoDeposito = 2;
                        } else if (reg.Data == "CASHINFAILED OnLoad"){

                        } else if (reg.Data == "CASHINFAILED RollbackOk"){
                            rollbackDeposito++;
                        }
                    }

                    if ((reg.OperationType == "CashManagement" && reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito") ||
                        (reg.OperationType == "ControlMessage" && reg.Data == "CASHINFAILED ItemsTaken")){
                        dbDexie      = this._guardaDepositosBD.calculaTiempoDeposito(dbDexie, idSesion, 2, iniciaDeposito, reg.TimeStamp, numIntentos, reg.Amount, reg.Data, rollbackDeposito);
                        montoSesion += reg.Amount;
                        numIntentos  = 0;
                        numDepositos++;
                    }

                    dataAnterior        = reg.Data;
                    tipoUltimaOperacion = "D";
                    terminaDeposito     = reg.TimeStamp;
                    montoDeposito       = reg.Amount;
                                        
                    break;

                case "PinChange": 
                    if(reg.SwitchResponseCode == 0){
                        this.dNumCambioNIP++;
                        if(this.dHraPrimerCambioNIP == ""){
                            this.dHraPrimerCambioNIP = tmpHoraOperacion
                        }
                        this.dHraUltimoCambioNIP = tmpHoraOperacion;
                    }else{
                        this.dNumCambioNIPNoExito++;
                        if(this.dHraPrimerCambioNIPNoExito == ""){
                            this.dHraPrimerCambioNIPNoExito = tmpHoraOperacion
                        }
                        this.dHraUltimoCambioNIPNoExito = tmpHoraOperacion;
                        this.incrementaErrorBanco(reg.Aquirer, reg.HWErrorCode, reg.SwitchResponseCode);
                    }
                    tipoUltimaOperacion = "P";
                    break;

            }

            if (reg.Event == "CASH MANAGEMENT" && reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                id = reg.Id
            }

        });


        this.mResumenOperaciones();
        this.mRretirosPorHora();
        this.mResumenPorBanco();
        this.pResumenDepositos();


        Object.keys(this.listaErrsPorBanco).forEach(function (banco) {
            let errsBanco = this[banco]

            for (let cve in errsBanco) {
 // Descomentar para pruebas               console.log(banco + " - " + cve + " - " + errsBanco[cve])
            }
        }, this.listaErrsPorBanco)

    }

    public listaErrsPorBanco: any[][] = [];

    public incrementaErrorBanco(nomBanco, descError, codError){

        if (descError.length > 0) {
            if (nomBanco == undefined || nomBanco == null || nomBanco.length == 0){
                nomBanco = "********";
            }
            let desc = descError.replace(/ /g, "_")+"_("+codError+")";
 // Descomentar para probar           console.log(nomBanco + " <--> " + desc + " <--> " + this.listaErrsPorBanco[nomBanco])
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

    // Arma los datos de la tabla del Resumen de Operaciones
    public mResumenOperaciones():void{
        this.tblResOperacion = {
            headerRow: [ {hDesc:'Descripcion', hOper:'Opers', hMonto:'Monto', hPrimera:'Primera', hUltima:'Ultima'} ],
            dataRows: [
                {etiqueta: "Depósitos Exitosos",     numOpers: this.dNumDepositos,        monto: this.dMontoDepositos,         primerMto: this.dHraPrimerDeposito,         ultimoMto: this.dHraUltimoDeposito},
                {etiqueta: "Retiros Exitosos",       numOpers: this.dNumRetiros,          monto: this.dMontoRetiros,           primerMto: this.dHraPrimerRetiro,           ultimoMto: this.dHraUltimoRetiro},
                {etiqueta: "Retiros No Exitosos*",   numOpers: this.dNumRetirosNoExito,   monto: this.dMontoRetirosNoExito,    primerMto: this.dHraPrimerRetiroNoExito,    ultimoMto: this.dHraUltimoRetiroNoExito},
                {etiqueta: "Consultas Exitosas",     numOpers: this.dNumConsultas,        monto: this.dMontoConsultas,         primerMto: this.dHraPrimeraConsulta,        ultimoMto: this.dHraUltimaConsulta},
                {etiqueta: "Consultas No Exitosas*", numOpers: this.dNumConsultasNoExito, monto: this.dMontoConsultasNoExito,  primerMto: this.dHraPrimeraConsultaNoExito, ultimoMto: this.dHraUltimaConsultaNoExito},
                {etiqueta: "Reversos",               numOpers: this.dNumReversos,         monto: this.dMontoReversos,          primerMto: this.dHraPrimerReverso,          ultimoMto: this.dHraUltimoReverso},
                {etiqueta: "Cambio NIP Exitoso",     numOpers: this.dNumCambioNIP,        monto: 0,                            primerMto: this.dHraPrimerCambioNIP,        ultimoMto: this.dHraUltimoCambioNIP},
                {etiqueta: "Cambio NIP Erroneo",     numOpers: this.dNumCambioNIPNoExito, monto: 0,                            primerMto: this.dHraPrimerCambioNIPNoExito, ultimoMto: this.dHraUltimoCambioNIPNoExito}
            ]
        };
    }

    // Arma los datos de la tabla del Depositos
    public pResumenDepositos():void{

        this.tblResumenDepositos = {
            headerRow: [
                {
                    hId:'ID',       hHraIni:'Inicio',       hHraFin: 'Finalizo',        hMonto:'Monto',     hBill20:'$20',
                    hBill50:'$50',  hBill100:'$100',        hBill200:'$200',            hBill500:'$500',    hBill1000:'$1000'
                }
            ],
            dataRows: arrDepositos
        };

        for(let idx=0; idx < arrDepositos.length; idx++){
            this.tBillDep[0].tMonto += Number(arrDepositos[idx].dMonto);
            this.tBillDep[0].tB20 += Number(arrDepositos[idx].dBill20);
            this.tBillDep[0].tB50 += Number(arrDepositos[idx].dBill50);
            this.tBillDep[0].tB100 += Number(arrDepositos[idx].dBill100);
            this.tBillDep[0].tB200 += Number(arrDepositos[idx].dBill200);
            this.tBillDep[0].tB500 += Number(arrDepositos[idx].dBill1000);
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
            headerRow: [
                {   hBanco:'Banco',         hNumRetOk:'Retiros Exitosos',       hNumRetNoOk:'Retiros Fallidos',
                    hNumCons:'Consultas',   hNumConsNoOk:'Consultas Fallidas',  hNumReversos: 'Reversos'
                }
            ],
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
        let tNumRetiros = 0;
        let tAcumNumRetiros = 0;
        let tNumConsultas = 0;
        let tAcumNumConsultas = 0;
        let tMontoRetiros = 0;
        let tAcumMontoRetiros = 0;
        let tNumConsPorHora = 0;
        let arrRetiros = [];


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
            acumCons[idx]   = (idx == 0) ? this.dNumConsPorHora[idx] : this.dNumConsPorHora[idx] + acumCons[idx -1];
            acumRet[idx]    = (idx == 0) ? this.dNumRetirosPorHora[idx] : this.dNumRetirosPorHora[idx] + acumRet[idx -1];
            acumMonto[idx]  = (idx == 0) ? this.dMontoRetirosPorHora[idx] : this.dMontoRetirosPorHora[idx] + acumMonto[idx -1];
        }

        // Agrega al objeto arrRetiros los movimientos que entraron despues de la 7 de la manañana
        for(let idx=7; idx < this.dAcumNumRetirosPorHora.length; idx++){
            if ( this.dNumConsPorHora[idx] > 0 || this.dNumRetirosPorHora[idx] > 0) {
                tmpHora = idx.toString();
                arrRetiros.push(
                {
                    hora: sprintf("%02s", idx.toString()),
                    numConsultasPorHora: (this.dNumConsPorHora[idx] > 0 ? this.dNumConsPorHora[idx] : carVacio),
                    acumNumConsultasPorHora: acumCons[idx],
                    numRetirosPorHora: (this.dNumRetirosPorHora[idx] > 0 ? this.dNumRetirosPorHora[idx] : carVacio),
                    acumNumRetirosPorHora: acumRet[idx],
                    montoRetirosPorHora: (this.dMontoRetirosPorHora[idx] > 0 ? this.dMontoRetirosPorHora[idx] : carVacio),
                    acumMontoRetirosPorHora: acumMonto[idx]
                });
            }
        }

        this.tblConsRetPorMes = {
            headerRow: [ {hHora:'Hora', hCons:'Consultas', hAcumCons:'Acumulado', hRet:'Retiros', hMonto: 'Monto', hAcumRet:'Acumulado'} ],
            datos: arrRetiros
        };
    }

    public dUltimaActualizacion: string;
    public obtenNumeroDePaginasLog(result:object, status){
        gNumPaginas   = JSON.parse(JSON.stringify(result)).TotalPages;
        gNumRegistros = JSON.parse(JSON.stringify(result)).TotalItems;
        //console.log("obtenNumeroDePaginasLog: gNumPaginas["+gNumPaginas+"]   gNumRegistros["+gNumRegistros+"]");
    }

    public numPaginas = 0;

    public obtenDatosJournal(result:any[], status){

        arrDatosServidorInc = null;  // Bloque de paginas con menor a 200 registros.
        numPaginaObtenida++;         // Numero de paginas obtenidas.
        console.log("obtenDatosJournal:: Pagina: ["+numPaginaObtenida+"]   Renglones: ["+result.length+"]");
        //if (result.length >= 200){
        if (numPagsCompletas < (gNumPaginas -1)){
            numPagsCompletas++;      // Numero de paginas completas.
            if (arrDatosServidor == undefined){
                arrDatosServidor = result;
            }else{
                arrDatosServidor = arrDatosServidor.concat(result);
            }
        }else {
            arrDatosServidorInc = result;
        }

    }



    public pDatosDelJournal(){

        this.paramsServicioNumPaginas.timeStampStart = this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.paramsServicioDatosLog.timeStampStart = this.paramsServicioNumPaginas.timeStampStart;
        this.paramsServicioDatosLog.timeStampEnd   = this.paramsServicioNumPaginas.timeStampEnd;

        console.log("Consulta Jounral ["+new Date()+"]");
        //console.log("pDatosDelJournal::  this.paramsServicioNumPaginas["+JSON.stringify(this.paramsServicioNumPaginas)+"]");
        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post(this.url, this.nomServicioPaginas, this.paramsServicioNumPaginas, this.obtenNumeroDePaginasLog);

        numPaginaObtenida = 0;
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
            ipAnterior = this.paramsServicioNumPaginas.ip[0];
            this.numPaginas = 0;
        }

        // *** Llama al servicio remoto para obtener la información solicitada del Journal.
        // ** this.numPaginas = Esta variable contiene el número de paginas completas de la última consulta.
        // ** gNumPaginas = El número máximo de información.
        for (let idx = gNumPaginasCompletas; idx < gNumPaginas; idx++) {
            this.paramsServicioDatosLog.page = idx;
            //console.log("pDatosDelJournal::  this.paramsServicioDatosLog["+JSON.stringify(this.paramsServicioDatosLog)+"]");
            this._soapService.post(this.url, this.nomServicioDatosLog, this.paramsServicioDatosLog, this.obtenDatosJournal)
        }


        // Respalda el arreglo con las paginas completas (200 registros).
        console.log("gNumRegistros ["+gNumRegistros+"]   gNumPaginasCompletas["+gNumPaginasCompletas+"]");
        if (gNumRegistros > 200 && (gNumPaginas -1) > gNumPaginasCompletas){ // && arrDatosServidorBack.length == 0){
            arrDatosServidorBack = arrDatosServidor; /* la primera consulta */
        }

        //else{
        {
            arrDatosServidor = arrDatosServidorBack;
        }

        gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
        this.obtenDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

        if (arrDatosServidorInc.length > 0) {
            this.numPaginas = gNumPaginas - 1;
        }

        gNumPaginasCompletas = (gNumPaginas -1);
        //console.log("arrDatosServidor["+arrDatosServidor.length+"]    arrDatosServidorInc["+arrDatosServidorInc.length+"]   NumRegsProcesados["+gNumRegsProcesados+"]");

        //}

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d      %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);
    }


    //date2: Date = new Date(2016, 5, 10);
    //date3: Date;
    //date4: Date;
    /*
    datepickerOpts: any = {
        startDate: new Date(2016, 5, 10),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'D, d MM yyyy'
    };
    */
    //date5: Date = new Date();
    //date6: Date = new Date();
    //dateFrom: Date;
    //dateTo: Date;
    datepickerToOpts: any = {};

    form: FormGroup;


public fechaHoraOperacion: string;

  ngOnInit() {




      this.obtieneIpATMs();
      this.datosGrafica();


      this.form = this.formBuilder.group({
          date: [new Date(1991, 8, 12)]
      });

      //tIdx = 0;
        let arrRetiros = [];
        for(let idx=0; idx < 24; idx++){
            arrRetiros.push(
            {
                hora: sprintf("%02s", idx.toString()),
                numConsultasPorHora: "",
                acumNumConsultasPorHora: "",
                numRetirosPorHora: "",
                acumNumRetirosPorHora: "",
                montoRetirosPorHora: "",
                acumMontoRetirosPorHora: ""
            });
        }

        this.retiros = {
            headerRow: [ {hHora:'Hora', hCons:'Consultas', hAcumCons:'Acumulado', hRet:'Retiros', hMonto: 'Monto', hAcumRet:'Acumulado'} ],
            datos: arrRetiros
        };


        this.fechaHoraOperacion         = this.dFchIniProceso + " " + this.dHraIniProceso.replace("-", ":") + "  /  " +  this.dFchFinProceso + " " + this.dHraFinProceso.replace("-", ":");
        this.datosGraficaRetirosPorHora = {
        'labels': ['<7', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
        'series': [[], []]
        };


        var fchSys   = new Date();
        var _anioSys = fchSys.getFullYear();
        var _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        var _diaSys  = fchSys.getDate();
        var _hraSys  = fchSys.getHours();
        var _minSys  = fchSys.getMinutes();
        var _segSys  = fchSys.getSeconds();

        this.dFchIniProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);
        this.dFchFinProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);

        this.paramsServicioNumPaginas.timeStampStart = this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.ipATM = '11.40.2.2';
        ipAnterior = this.paramsServicioNumPaginas.ip[0];
        gFchInicioAnterior = this.paramsServicioNumPaginas.timeStampStart;
        gFchInicioFinAnterior = this.paramsServicioNumPaginas.timeStampEnd;

        this.pActualizaInfo();
        this.graficaRetiros();
    }

    public otrasGraficas(): void{
      /*
      this.emailChartType = ChartType.Pie;
      
      this.emailChartData = {
        labels: ['62%', '32%', '6%'],
        series: [62, 32, 6]
      };
      
      this.emailChartData = {
        labels: [35,212,33,18,31,1],
        series: [35,212,33,18,31,1]
      };      
      this.emailChartLegendItems = [
        { title: 'Open', imageClass: 'fa fa-circle text-info' },
        { title: 'Bounce', imageClass: 'fa fa-circle text-danger' },
        { title: 'Unsubscribe', imageClass: 'fa fa-circle text-warning' }
      ];

      this.hoursChartType = ChartType.Line;
      this.hoursChartData = {
        labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
        series: [
          [287, 385, 490, 492, 554, 586, 698, 695, 752, 788, 846, 944],
          [67, 152, 143, 240, 287, 335, 435, 437, 539, 542, 544, 647],
          [23, 113, 67, 108, 190, 239, 307, 308, 439, 410, 410, 509]
        ]
      };
      this.hoursChartOptions = {
        low     : 0,
        high    : 800,
        showArea: true,
        height  : '245px',
        axisX   : {
          showGrid: false,
        },
        lineSmooth: Chartist.Interpolation.simple({
          divisor: 3
        }),
        showLine : false,
        showPoint: false,
      };
      this.hoursChartResponsive = [
        ['screen and (max-width: 640px)', {
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      this.hoursChartLegendItems = [
        { title: 'Open', imageClass: 'fa fa-circle text-info' },
        { title: 'Click', imageClass: 'fa fa-circle text-danger' },
        { title: 'Click Second Time', imageClass: 'fa fa-circle text-warning' }
      ];

      this.activityChartType = ChartType.Bar;
      this.activityChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
          [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
        ]
      };
      this.activityChartOptions = {
        seriesBarDistance: 10,
        axisX            : {
          showGrid: false
        },
        height: '245px'
      };
      this.activityChartResponsive = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX            : {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      this.activityChartLegendItems = [
        { title: 'Tesla Model S', imageClass: 'fa fa-circle text-info' },
        { title: 'BMW 5 Series', imageClass: 'fa fa-circle text-danger' }
      ];
*/



    /* Transacciones */
    /*
    this.transChartData = {
        labels: ['62%', '32%', '6%'],
        series: [62, 32, 6]
      };
      
      this.transChartData = {
        labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
        series: [35,212,33,0,18,31,1,0]
      };      
      this.transChartLegendItems = [
        { title: 'Open', imageClass: 'fa fa-circle text-info' },
        { title: 'Bounce', imageClass: 'fa fa-circle text-danger' },
        { title: 'Unsubscribe', imageClass: 'fa fa-circle text-warning' }
      ];
*/

    }

    fncAngularIndexedDB(){

/*
        db2.remove('depositosx', 1).then(() => {
            // Do something after remove
        }, (error) => {
            console.log(error);
        });
*/


/*
        db2.createStore(1, (evt) => {
            var objectStore = evt.currentTarget.result.createObjectStore(
                'depositosx', { keyPath: "id", autoIncrement: true });

            objectStore.createIndex("idx1", ['idDep', 'nivelDeposito'],  {unique: false });
            //objectStore.createIndex("email", "email", { unique: true });
        });

        db2.clear('depositosx').then(() => {
            // Do something after clear
            console.log("db2.clear OK");
        }, (error) => {
            console.log(error);
        });
        */
    }






    logMsgs(){
        this.logger.error('This is a priority level 1 error message...');
        this.logger.warn('This is a priority level 2 warning message...');
        this.logger.info('This is a priority level 3 info message...');
        this.logger.debug('This is a priority level 4 debug message...');
        this.logger.log('This is a priority level 5 log message...');
    }

    setLevel(level:Level){
        this.logger.level = level;
    }

    clear(){
        console.clear();
    }

    store(){
        this.logger.store();
    }

    unstore(){
        this.logger.unstore();
    }
    
    public openRequest2;

    iniciarBD(){
        console.log("iniciarBD:: Inicia");

        //window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        
        console.log("iniciarBD:: Se va a abrir la BD dbName");
        this.openRequest2 = window.indexedDB.open('dbName', 1 /* versión de base de datos */);

        console.log("iniciarBD:: Se va a ejecutar openRequest.onsuccess");
        this.openRequest2.onsuccess = function(e) {
            // Almacenamos una referencia global a la base de datos que acabamos de abrir
            db3 = e.target.result;
            console.log("Base de datos dbName: "+db3);
        };
            
        /*
        this.logger.error("iniciarBD:: Se va a ejecutar openRequest.onupgradeneeded");
        openRequest.onupgradeneeded = function(e) {
            // La base de datos no existía o su versión era inferior a la solicitada,
            // podemos proceder a actualizarla, crear los objectStores que queramos, etc.
            // ...
            this.logger.error('openRequest.onupgradeneeded ['+e+"]");
        };
        */

        console.log("iniciarBD:: Se va a ejecutar openRequest.onupgradeneeded");
        this.openRequest2.onupgradeneeded = function(e) {
            console.log("iniciarBD:: Se va a ejecutar e.target.result");
            //this.logger.error("iniciarBD:: Se va a ejecutar e.target.result");
            db3 = e.target.result;
            // Creamos un objectStore llamado "people" para guardarobjetos
            // cuya clave estará en la propiedad "id" y será generada por
            // indexedDB con un valor autoincremental

            console.log("iniciarBD:: Se va a ejecutar db3.createObjectStore");
            //this.logger.error("iniciarBD:: Se va a ejecutar db3.createObjectStore");
            storeRequest = db3.createObjectStore('people', {
              keyPath      : 'id',
              autoIncrement: 'true'
            });
           
            // Creamos un índice único sobre el email de cada persona
            console.log("iniciarBD:: Se va a ejecutar storeRequest.createIndex: idx_email");
            storeRequest.createIndex("idx_email", "email", {unique: true});
            
            // Creamos otro índice sobre la ciudad:
            console.log("iniciarBD:: Se va a ejecutar storeRequest.createIndex: idx_city");
            storeRequest.createIndex("idx_city", "city", {unique: false});
           
            console.log("iniciarBD:: Se va a ejecutar storeRequest.transaction.oncomplete");
            storeRequest.transaction.oncomplete = function(e) {
              // Todo es asíncrono, incluida la creación de objectStores
              // e índices. Cuando se complete la transacción sabremos
              // que ha terminado la operación y podemos empezar a trabajar
              // con el objectStore y el índice
              console.log("storeRequest.transaction.oncomplete ["+e+"]");
            };
          }


          console.log("iniciarBD:: Se va a ejecutar openRequest.onerror");
        this.openRequest2.onerror = function(e) {
            // No hemos podido abrir la base de datos
            console.log('openRequest.onerror ['+e+"]");
        };

        console.log("iniciarBD:: Termina");
    }


    graficaRetiros(): void{

        /* Grafica de Retiros */

        this.tipoGraficaRetirosPorHora = ChartType.Bar;
    
        this.opcionesGraficaRetirosPorHora = {
          seriesBarDistance: 10,
          axisX            : {
            showGrid: false
          },
          height: '145px'
        };
    
        this.responsiveGraficaRetirosPorHora = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX            : {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
    
        this.elementosGraficaRetirosPorHora = [
          { title: 'Retiros', imageClass: 'fa fa-circle text-info' },
          { title: 'Consultas', imageClass: 'fa fa-circle text-danger' }
        ];
        
    }

    // Datos para la fecha.
    //form: FormGroup;


    //customers: Customer[];
    constructor(private formBuilder: FormBuilder, public _soapService: SoapService, 
                public logger            : Logger, private _desglosaBilletes: DesglosaBilletes,
                public _guardaDepositosBD: GuardaDepositosBD){ //, service                  : Service) {

        //this.customers = service.getCustomers();

        this.setLevel(5);
        this.inicializaVariables();

    }

    public pDenominacionesBilletes(infoBilletes:string){

        var montoTotal = 0;
        var respBilletes = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, total: 0};
        let posInicial = infoBilletes.indexOf('[');
        let posFinal = infoBilletes.indexOf(']', posInicial);
        let billetes1 = infoBilletes.substr(posInicial, (posFinal - posInicial)).replace(/[\[\]]/g,'');
        let arrBilletes = billetes1.split("|");
        for(let idx=0; idx < arrBilletes.length; idx++){
            let arrBilletes2 =  arrBilletes[idx].split("x");
            switch(arrBilletes2[1]){
                case '20':   { respBilletes.b20   = Number(arrBilletes2[0]); break; }
                case '50':   { respBilletes.b50   = Number(arrBilletes2[0]); break; }
                case '100':  { respBilletes.b100  = Number(arrBilletes2[0]); break; }
                case '200':  { respBilletes.b200  = Number(arrBilletes2[0]); break; }
                case '500':  { respBilletes.b500  = Number(arrBilletes2[0]); break; }
                case '1000': { respBilletes.b1000 = Number(arrBilletes2[0]); break; }
            }
            respBilletes.total += Number(arrBilletes2[1]) * Number(arrBilletes2[0]);
        }
        return(respBilletes);
    }

    // Pie
    public pieChartLabels:string[] = ['Depósitos', 'Retiros', 'Consultas', 'Reversos'];
    public pieChartData:number[] = [7, 22, 12, 0];
    public pieChartType:string = 'pie';
    public polarAreaLegend:boolean = true;

    // events
    public chartClicked(e:any):void {
        console.log(e);
    }

    public chartHovered(e:any):void {
        console.log(e);
    }

    public activityChartType: ChartType;
    public activityChartData: any;
    public activityChartOptions: any;
    public activityChartResponsive: any[];
    public activityChartLegendItems: LegendItem[];

    public datosGrafica() {
        console.log("datosGrafica:: Inicio");
        this.activityChartType = ChartType.Bar;
        this.activityChartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
                [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
                [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
            ]
        };
        this.activityChartOptions = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: '245px'
        };
        this.activityChartResponsive = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];
        this.activityChartLegendItems = [
            {title: 'Tesla Model S', imageClass: 'fa fa-circle text-info'},
            {title: 'BMW 5 Series', imageClass: 'fa fa-circle text-danger'}
        ];

    }

    public obtenCierreAnterior(){
        // Restar un día a la fecha de inicio.
        // Llamar al servicio 
    }




    // Ip y Clave de ATMs

    public GetEjaFilters(result:any, status){

        //console.log("GetEjaFilters:: Inicio");
        //console.log(result)
        var ipATM = '';

        for(let idx = 0; idx < result.length; idx++){
            //console.log("GetEjaFilters:: idx["+idx+"]   result["+result[idx]+"]");
            for(let idx2 = 0; idx2 < result[idx].length; idx2++){
                //console.log("GetEjaFilters:: idx2["+idx2+"]   result["+result[idx][idx2]+"]");
                if(idx === 0){
                    //console.log("GetEjaFilters:: (1)");
                    ipATM = result[idx][idx2];
                    //console.log("GetEjaFilters:: (2)");
                    //this.ipATMs.push(result[idx][idx2]);
                    ipATMs[ipATMs.length] = result[idx][idx2];
                    //console.log("GetEjaFilters:: (3)");
                    //console.log(ipATM);
                }else{
                    datosATMs.push(result[idx][idx2] + "    ("+ result[0][idx2] + ")");

                }
                //console.log(result[idx][idx2]);
            }
        }
        //console.log('Datos ATM: ' + datosATMs);
        //console.log('ipATMs: ' + ipATMs);
    }

    public obtieneIpATMs(){
        console.log('obtenIpATMs:: Inicio');
        this._soapService.post(this.url, 'GetEjaFilters', '', this.GetEjaFilters);
        this.ipATMs = ipATMs;
        this.ipATMs = ipATMs.sort(comparar);
        /*
        for(let idx=0; idx < ipATMs.length; idx++){
            console.log('-> '+idx+")  "+this.ipATMs[idx]+"  -  " + ipATMs[idx]);
        }
        */
        //console.log('this.ipATMs['+this.ipATMs.sort(comparar)+']   ipATMs: ' + ipATMs.sort(comparar));
        console.log('obtenIpATMs:: Se ejecuto la consulta');
    }

}

function comparar ( a, b ){ return a - b; }

