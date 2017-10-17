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
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
// Importamos la clase del servicio
import { DesglosaBilletes } from './services/DesglosaBilletes.service';
import { GuardaDepositosBD } from './services/GuardaDepositosBD.service';

// import { DxDataGridModule } from 'devextreme-angular';
// import { Customer, Service } from './app.service';


export var gNumPaginas                 = 0;
export var gNumRegistros               = 0;
export var gNumRegsProcesados          = 0;
export var aDatosJournal               = [];
export var paramsServicioDatosLogX:any = {};
export var tIdx:number = 0;

var fechaSys = new Date();
var fechaHoy = sprintf("%4d-%02d-%02d",fechaSys.getFullYear(), (fechaSys.getMonth() + 1), fechaSys.getDate());
var ipAnterior:string = null;

// Formatea numeros
var l10nUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
var request;
var objStore;
var tiempoRefreshDatos:number = (1000 * 60 * 1); // Actualiza la información cada minuto.

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

export class RetirosXhora {  
    hora: string;  
    numConsultasPorHora: number;
    acumNumConsultasPorHora: number;
    numRetirosPorHora: number;
    acumNumRetirosPorHora: number;
    montoRetirosPorHora: number; 
    acumMontoRetirosPorHora: number;            
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

    chartLabels = ['January', 'February', 'Mars', 'April'];

    onChartClick(event) {
        console.log(event);
    }

    newDataPoint(dataArr = [100, 100, 100], label) {

        this.chartData.forEach((dataset, index) => {
            this.chartData[index] = Object.assign({}, this.chartData[index], {
                data: [...this.chartData[index].data, dataArr[index]]
            });
        });

        this.chartLabels = [...this.chartLabels, label];

    }


    Level = Level;



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
    private model: Object = { date: { year: 2018, month: 10, day: 9 } };


    public tblDomResOperacion: TblDomResOperacion;
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

    public activityChartType       : ChartType;
    public activityChartData       : any;
    public activityChartOptions    : any;
    public activityChartResponsive : any[];
    public activityChartLegendItems: LegendItem[];

    public bsValue     : any ;
    public bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];

    selectedItem: any;
    icons       : string[];
    items       : Array<{title: string, note: string, icon: string}>;

    //public url: string                  = 'https://manager.redblu.com.mx:8080/services/dataservices.asmx';
    public url: string                  = '/services/dataservices.asmx';
    public nomServicioPaginas: string   = 'GetEjaLogDataLength';
    public nomServicioDatosLog: string  = 'GetEjaLogPage';
    public nomServicioGetEjaLog: string = 'GetEjaLog';
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
    public dHraIniciaSesión: string = "";

    public dNumRetiros: number      = 0;
    public dMontoRetiros: number    = 0;
    public dHraPrimerRetiro: string = ""
    public dHraUltimoRetiro: string = ""

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
    //public opersBanco              : any;
    public opersBanco : object   = new Object();
    public listaBancos: string[] = [];

    public infoDepositos: DepositosModel[] = [];

    //public arrDepositos: DepositosModel[] = [];
    public resumenDatos: any[];

    //public datosRetirosXhora: DatosRetirosXhora[];
    public datosRetirosXhora: Array<DatosRetirosXhora> = new Array(24);

    public ipATM: string;

    public tblConsRetPorMes: TblConsRetPorMes;
    public iPs:any[] = ['11.40.2.2', '11.40.2.8'];
    model1 = new Date(this.dFchIniProceso);
    model2 = new Date(this.dFchFinProceso);

    iniArrCeros(numElems, valIni):Array<number>{
        return([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    }

    inicializaVariables(): void {

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
        this.dHraIniciaSesión = "";

        this.dNumRetiros      = 0;
        this.dMontoRetiros    = 0;
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


        this.infoDepositos = [];


        this.opersBanco  = {'nomBanco': "", 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
        this.listaBancos = [];

        arrDatosServidor = [];
        for(let idx=0; idx<24; idx++){
            this.datosRetirosXhora[idx] = new DatosRetirosXhora();
        }

        //this.tblDomResOperacion = new TblDomResOperacion();
        arrDepositos = [];
    }

    public retirosXhora: RetirosXhora[] = [];



    public paramsServicioGetEjaLog: {
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

    public tblResOperacion: TblDomResOperacion
    public retiros: InterRetirosPorHora;

    public numDep        : number;
    public listaDepositos: object = {};
    public retiroNoOk    : object = {};
   
    public resumenPorBanco: Array<number> = [0, 0, 0, 0, 0, 0, 0];  //Dep, Ret, RetNo, Rech, Cons,ConsNo, Rev
    public listaDatosBanco:Array<any>     = [];


    public pActualizaInfo(): void {

        console.log("pActualizaInfo:: ipAnterior["+ipAnterior+"]   ip["+this.paramsServicioNumPaginas.ip[0]+"]");
        if (ipAnterior != this.paramsServicioNumPaginas.ip[0]){
            ipAnterior           = this.paramsServicioNumPaginas.ip[0];
            this.numPaginas      = 0;
            gNumRegsProcesados   = 0;
            arrDatosServidorBack = [];
        }

        if (intervalId != null){
            clearInterval(intervalId);
        }
        setTimeout(() => { this.pDatosDelJournal(); }, 300);
        intervalId = setInterval(() => { this.pDatosDelJournal(); }, tiempoRefreshDatos);
    }
    
    //public listaBancos:[]                = [];

    public incrementaBanco(tipoOper:string, nomBanco:string): void{
        //this.opersBanco  = {'nomBanco': "", 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
        //console.log("incrementaBanco:: ["+nomBanco+"]");

        if (nomBanco == undefined || nomBanco == null || nomBanco == ""){
            nomBanco = "********";
        }
        
        if ( this.listaBancos[nomBanco] == undefined ){
            //console.log("incrementaBanco:: nuevo   nomBanco["+nomBanco+"]   tipoOper["+tipoOper+"]");                           
            //oBanco    = {'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
            this.opersBanco = {'nomBanco': nomBanco, 'numRetOk':0, 'numRetNoOk':0, 'numRechazos':0, 'numCons':0, 'numConsNoOk':0, 'numReversos':0};
            this.listaBancos[nomBanco]       = {'opersBanco': {} };
        }else{
            //console.log("incrementaBanco:: existente   nomBanco["+nomBanco+"]   tipoOper["+tipoOper+"]");
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
        //console.log(JSON.stringify(this.listaBancos[nomBanco]));
    }

 
/*
    public iniciaDB_Dexie(nomBD): void{
        
        dbDexie = new Dexie(nomBD);

        dbDexie.version(1).stores({
            tabDepositos: "++id, nivelDep, [idSesDep+nivelDep]"
        });

        dbDexie.open().catch (function (err) {
            console.log('Failed to open db: ' + (err.stack || err));
        });
          
        //this.infoDataBaseDexie(bdRedBlu);
    }
*/

    public obtenDatosLog(result:object, numPag:number): void {

        this.inicializaVariables();

        var datosLog        = JSON.parse(JSON.stringify(result))
        var fchSys          = new Date();
        var _horaSys        = fchSys.getHours();
        var _horaUltimaOper = _horaSys
        var tmpFechaSys     = sprintf("%04d-%02d-%02d",fchSys.getFullYear(), fchSys.getMonth() +1, fchSys.getDate());
        var listaBancos     = {};
        var tmpAquirer      = "";
        var tmpArqc         = "";

        var tipoUltimaOperacion  = "";
        var iniciaDeposito       = "";
        var terminaDeposito      = "";
        var montoDeposito        = 0;
        var id                   = 0;
        var numIntentos          = 0;
        var nivelUltimoDeposito  = 0;
        var datosDeposito        = "";
        var iniciaSesDeposito    = "";
        var dataAnterior         = "";
        var idSesion             = 1;
        var montoSesion          = 0;
        var numDepositos         = 0;
        var rollbackDeposito     = 0;                      // 0=Indica que no se provoco Rollback en el depósito / 1=Rollback en el deposito.
        var tmpArqc              = "";
        var tmpAquirer           = "";
        var tmpCardNumber        = "";
        var tmpAuthId            = "";
        this.resumenPorBanco = [0, 0, 0, 0, 0, 0, 0];

        

        datosLog.forEach((reg)=>{

            //console.log("1) Evento: "+reg.Event);

            var date = new Date(reg.TimeStamp);
            var _hora = date.getHours();
            var tmpHoraOperacion = sprintf("%02d:%02d:%02d", date.getHours(), date.getMinutes(), date.getSeconds());
            var tmpFechaOper = sprintf("%04d-%02d-%02d", date.getFullYear(), date.getMonth() + 1, date.getDate());

            //console.log("Hora movimiento: "+tmpHoraOperacion + "    Event: ["+reg.Event+"]");
            //console.log("Hora movimiento: "+tmpHoraOperacion + "    Event: ["+reg.Event+"]");

            fchSys = new Date();
            _horaSys = (tmpFechaOper != tmpFechaSys) ? 23 : fchSys.getHours();
            _horaUltimaOper = _horaSys;

            if (iniciaDeposito != "" && (tipoUltimaOperacion != "D" || (reg.Data == "VALIDAUSUARIO IsValid TRUE" && reg.Id != id))){ 
				//this.calculaTiempoDeposito(idSesion, 1, iniciaSesDeposito, terminaDeposito, numDepositos, montoSesion, datosDeposito, rollbackDeposito);
                //dbDexie             = this._guardaDepositosBD.calculaTiempoDeposito(dbDexie, idSesion, 1, iniciaSesDeposito, terminaDeposito, numDepositos, montoSesion, datosDeposito, rollbackDeposito);
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
            //console.log("data: ["+reg.Data+"]");
            switch(reg.Event) {
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
                                //console.log(_hora+")"+this.dAcumNumRetirosPorHora[6]);
                                this.dMontoRetirosPorHora     [6] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[6]  += reg.Amount;
                            }else if(_hora <= _horaSys){
                                this.dNumRetirosPorHora[_hora]++;
                                this.dAcumNumRetirosPorHora[_hora]++;
                                //console.log("hora < 23: " + _hora+") "+this.dAcumNumRetirosPorHora[_hora]);
                                this.dMontoRetirosPorHora     [_hora] += reg.Amount;
                                this.dAcumMontoRetirosPorHora[_hora]  += reg.Amount;
                            }
                            this.datosRetirosXhora[_hora].dNumRetirosPorHora++;
                            this.datosRetirosXhora[_hora].dAcumMontoRetirosPorHora += reg.Amount;
                            //console.log(this.dNumRetirosPorHora, this.dAcumNumRetirosPorHora, this.dMontoRetirosPorHora, this.dAcumMontoRetirosPorHora);
                            
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
                            this.dNumRetirosNoExito++;
                            this.dMontoRetirosNoExito += reg.Amount
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion
                            break;
                        }

                        case "Declined transaction": {
                            this.dNumRetirosNoExito++;
                            this.dMontoRetirosNoExito += reg.Amount
                            if(this.dHraPrimerRetiroNoExito == ""){
                                this.dHraPrimerRetiroNoExito = tmpHoraOperacion
                            }
                            this.dHraUltimoRetiroNoExito = tmpHoraOperacion
                            break;
                        }

                        case "Withdrawal Reverse": {
                            this.dNumReversos++;
                            this.dMontoReversos += reg.Amount
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
                            this.retiroNoOk[reg.HWErrorCode] = this.retiroNoOk[reg.HWErrorCode] + 1;
                        } else {
                            this.retiroNoOk[reg.HWErrorCode] = 1;
                        }
                    }
                    break;
                }

                case "BalanceCheck": 
                    if(reg.SwitchResponseCode == 0){
                        this.dNumConsultas++;
                        if(this.dHraPrimeraConsulta == ""){
                            this.dHraPrimeraConsulta = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsulta = tmpHoraOperacion;
                        if (_hora < 7){
                            this.dNumConsPorHora[6]++;
                        }else{
                            this.dNumConsPorHora[_hora]++;
                        }
                        //console.log("Consulta: "+_hora+" - "+this.datosRetirosXhora[_hora].dNumConsPorHora+"  -  "+this.dHraUltimaConsulta)
                        this.datosRetirosXhora[_hora].dNumConsPorHora++;
                        this.incrementaBanco('CON', reg.Aquirer);
                    }else{
                        this.dNumConsultasNoExito++;
                        if(this.dHraPrimeraConsultaNoExito == ""){
                            this.dHraPrimeraConsultaNoExito = tmpHoraOperacion;
                        }
                        this.dHraUltimaConsultaNoExito = tmpHoraOperacion;
                        this.incrementaBanco('COE', reg.Aquirer);
                    }
                    tipoUltimaOperacion = "C";
                    
                    break;
                    
                case "CASH MANAGEMENT": 

                    if (reg.Data == "VALIDAUSUARIO IsValid TRUE"){
                        iniciaDeposito = tmpHoraOperacion; //reg.TimeStamp;
                        if(this.dHraPrimerDeposito == ""){
                            this.dHraPrimerDeposito = tmpHoraOperacion;
                        }
                        this.dHraIniciaSesión = tmpHoraOperacion;
                    }
                    //if ( dataAnterior.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito"){
                    if (reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito"){
                        // Data = "PROCESADEPOSITO ConfirmaDeposito [0x20|0x50|0x100|0x200|26x500|1x1000]"
                        this.dNumDepositos++;
                        
                        this.dMontoDepositos += reg.Amount;


                        this.dHraUltimoDeposito = tmpHoraOperacion;
                        //console.log("CASH MANAGEMENT:: se va a revisar la denominacion de los billetes");
                        let denominaBilletes = this.pDenominacionesBilletes(reg.Data);

                        //console.log(this.dNumDepositos + " - " + this.dHraPrimerDeposito + " - " + tmpHoraOperacion + " - " + reg.Amount, denominaBilletes.b20,denominaBilletes.b50,denominaBilletes.b100,denominaBilletes.b200,denominaBilletes.b500,denominaBilletes.b1000 );

                        arrDepositos.push(
                            {   dId: this.dNumDepositos, dHraIni: this.dHraIniciaSesión, dHraFin: tmpHoraOperacion, dMonto: reg.Amount,
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
                            // Hora inicio de sesión.
                            // Numero de sesiones.
                            // Hora inicio depoisito
                            iniciaSesDeposito   = reg.TimeStamp;
                            iniciaDeposito      = reg.TimeStamp;
                            nivelUltimoDeposito = 1;
                            
                        } else if (reg.Data == "INPUTREFUSED ItemsTaken"){
                            // Numero de intentos
                            numIntentos++;
                            nivelUltimoDeposito = 2;
                        } else if (reg.Data == "CASHINFAILED OnLoad"){

                        } else if (reg.Data == "CASHINFAILED RollbackOk"){
                            // Depósito cancelado
                            rollbackDeposito++;
                        }
                    }

                    if ((reg.OperationType == "CashManagement" && reg.Data.substring(0,32) == "PROCESADEPOSITO ConfirmaDeposito") ||
                        (reg.OperationType == "ControlMessage" && reg.Data == "CASHINFAILED ItemsTaken")){
                        // Guarda datos deposito
                        //console.log(reg.OperationType + "  <------->  " + reg.Data);
                        //this.calculaTiempoDeposito(idSesion, 2, iniciaDeposito, reg.TimeStamp, numIntentos, reg.Amount, reg.Data, rollbackDeposito);
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

    }

    public objDepositos; 

    fchActualSys() {

    }

    // Arma los datos de la tabla del Resumen de Operaciones
    public mResumenOperaciones():void{
        this.tblResOperacion = {
            headerRow: [ {hDesc:'Descripción', hOper:'Opers', hMonto:'Monto', hPrimera:'Primera', hUltima:'Última'} ],
            dataRows: [
                {etiqueta: "Depósitos Exitosos", numOpers: this.dNumDepositos, monto: this.dMontoDepositos, primerMto: this.dHraPrimerDeposito, ultimoMto: this.dHraUltimoDeposito},
                {etiqueta: "Retiros Exitosos", numOpers: this.dNumRetiros, monto: this.dMontoRetiros, primerMto: this.dHraPrimerRetiro, ultimoMto: this.dHraUltimoRetiro},
                {etiqueta: "Retiros No Exitosos*", numOpers: this.dNumRetirosNoExito, monto: this.dMontoRetirosNoExito, primerMto: this.dHraPrimerRetiroNoExito, ultimoMto: this.dHraUltimoRetiroNoExito},
                {etiqueta: "Consultas Exitosas", numOpers: this.dNumConsultas, monto: "", primerMto: this.dHraPrimeraConsulta, ultimoMto: this.dHraUltimaConsulta},
                {etiqueta: "Consultas No Exitosas*", numOpers: this.dNumConsultasNoExito, monto:"", primerMto: this.dHraPrimeraConsultaNoExito, ultimoMto: this.dHraUltimaConsultaNoExito},
                {etiqueta: "Reversos", numOpers: this.dNumReversos, monto: this.dMontoReversos, primerMto: this.dHraPrimerReverso, ultimoMto: this.dHraUltimoReverso},
                {etiqueta: "Cambio NIP Exitoso", numOpers: this.dNumCambioNIP, monto: "", primerMto: this.dHraPrimerCambioNIP, ultimoMto: this.dHraUltimoCambioNIP},
                {etiqueta: "Cambio NIP Erroneo", numOpers: this.dNumCambioNIPNoExito, monto:"", primerMto: this.dHraPrimerCambioNIPNoExito, ultimoMto: this.dHraUltimoCambioNIPNoExito},
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

        console.log(JSON.stringify(this.tblResumenDepositos.headerRow));

    }


    // Arma la información de la tabla de Resumen de Operaciones por Banco
    public mResumenPorBanco():void{

        var arrDatos = [];
        var arrTotDatos = [{fNumBancos: 0, fNumRetOk: 0, fNumRetNoOK: 0, fNumCons: 0, fNumConsNoOk: 0, fNumReversos: 0, fnumRechazos: 0}];
        var fNumBancos = 0;
        var fNumRetOk = 0;
        var fNumRetNoOK = 0;
        var fNumCons = 0;
        var fNumConsNoOk = 0;
        var fNumReversos = 0;
        var fnumRechazos = 0;
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
            //fnumRechazos += datosBanco['numRechazos'];

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
        //                     fNumCons: fNumCons, fNumConsNoOk: fNumConsNoOk, fNumReversos: fNumReversos, fnumRechazos: fnumRechazos
    }

    // Despiega en la pagina la información de Consultas y Retiros.
    public mRretirosPorHora():void{

        // Acumula los movimientos que se realizaron antes de la 7 de la mañana.
        var tNumRetiros = 0;
        var tAcumNumRetiros = 0;
        var tNumConsultas = 0;
        var tAcumNumConsultas = 0;
        var tMontoRetiros = 0;
        var tAcumMontoRetiros = 0;
        var tNumConsPorHora = 0;
        var arrRetiros = [];


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
                //tNumConsPorHora    = this.dAcumNumConsultasPorHora[idx];
            }
        }

        // Agrega al objeto arrRetiros los movimientos que entraron antes de la 7 de la manañana
        var carVacio = "0";
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
        //console.log("obtenNumeroDePaginasLog: "+ JSON.stringify(result));
        gNumPaginas   = JSON.parse(JSON.stringify(result)).TotalPages;
        gNumRegistros = JSON.parse(JSON.stringify(result)).TotalItems;
        console.log("obtenNumeroDePaginasLog: gNumPaginas["+gNumPaginas+"]   gNumRegistros["+gNumRegistros+"]");
    }

    //public arrDatosServidorBak = "";
    public numPaginasJournal = 0;
    public numPaginas = 0;
    public paginaIncompleta = 0;




    public obtenDatosJournal(result:any[], status){
        //var datosLog = JSON.parse(JSON.stringify(result));

        tIdx++;
        arrDatosServidorInc = null;
        numPaginaObtenida++;
        console.log("obtenDatosJournal:: Pagina: ["+numPaginaObtenida+"]   Renglones: ["+result.length+"]");

        if (result.length >= 200){
            numPagsCompletas++;
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
    
        var fchSys   = new Date();
        var _anioSys = fchSys.getFullYear();
        var _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        var _diaSys  = fchSys.getDate();
        var _hraSys  = fchSys.getHours();
        var _minSys  = fchSys.getMinutes();
        var _segSys  = fchSys.getSeconds();

        this.paramsServicioNumPaginas.timeStampStart = this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.paramsServicioDatosLog.timeStampStart = this.paramsServicioNumPaginas.timeStampStart;
        this.paramsServicioDatosLog.timeStampEnd   = this.paramsServicioNumPaginas.timeStampEnd;

        console.log("pDatosDelJournal::  this.paramsServicioNumPaginas["+JSON.stringify(this.paramsServicioNumPaginas)+"]");
        this._soapService.post(this.url, this.nomServicioPaginas, this.paramsServicioNumPaginas, this.obtenNumeroDePaginasLog);

        console.log("pDatosDelJournal::  this.paramsServicioDatosLog["+JSON.stringify(this.paramsServicioDatosLog)+"]");
        console.log("pDatosDelJournal::  gNumRegistros["+gNumRegistros+"]   gNumRegsProcesados["+gNumRegsProcesados+"]");

        //if ( gNumRegistros > gNumRegsProcesados ) {

            numPaginaObtenida = 0;
            if (ipAnterior != this.paramsServicioNumPaginas.ip[0]) {
                ipAnterior = this.paramsServicioNumPaginas.ip[0];
                this.numPaginas = 0;
            }

            console.log("1) pDatosDelJournal:: numPaginas[" + this.numPaginas + "]    gNumPaginas[" + gNumPaginas + "]");
            console.log("1) pDatosDelJournal:: ipAnterior[" + ipAnterior + "]    ip[" + this.paramsServicioNumPaginas.ip[0] + "]");

            for (let idx = this.numPaginas; idx < gNumPaginas; idx++) {
                this.paramsServicioDatosLog.page = idx;
                this._soapService.post(this.url, this.nomServicioDatosLog, this.paramsServicioDatosLog, this.obtenDatosJournal)
            }

            console.log("2) pDatosDelJournal:: numPaginas[" + this.numPaginas + "]    gNumPaginas[" + gNumPaginas + "]");

            //console.log("1) pDatosDelJournal:: arrDatosServidor["+ arrDatosServidor.length+"]  arrDatosServidorInc["+arrDatosServidorInc.length+"]");

            console.log("1) pDatosDelJournal:: arrDatosServidor[" + arrDatosServidor.length + "]");
            console.log("1) pDatosDelJournal:: arrDatosServidorInc[" + arrDatosServidorInc.length + "]");

            if (arrDatosServidorBack != null && arrDatosServidorBack.length > 0){
                if (arrDatosServidorBack.length > arrDatosServidor.length) {
                    arrDatosServidor = arrDatosServidorBack;
                }
            } else {
                arrDatosServidorBack = arrDatosServidor;
            }

            gNumRegsProcesados = (arrDatosServidor.concat(arrDatosServidorInc)).length;
            console.log("2) pDatosDelJournal:: arrDatosServidor[" + arrDatosServidor.length + "]  arrDatosServidorBack[" + arrDatosServidorBack.length + "]  Todos los renglones[" + (arrDatosServidor.concat(arrDatosServidorInc)).length + "]");
            console.log("2) pDatosDelJournal:: arrDatosServidor[" + arrDatosServidor.length + "]  arrDatosServidorBack[" + arrDatosServidorBack.length + "]  Todos los renglones[" + gNumRegsProcesados + "]");
            //console.log("2) pDatosDelJournal:: arrDatosServidorBack["+arrDatosServidorBack.length+"]");
            //console.log("2) pDatosDelJournal:: Todos los renglones["+(arrDatosServidor.concat(arrDatosServidorInc)).length+"]");

            this.obtenDatosLog(arrDatosServidor.concat(arrDatosServidorInc), gNumPaginas);

            if (arrDatosServidorInc.length > 0) {
                this.numPaginas = gNumPaginas - 1;
            }


            console.log("arrDatosServidor["+arrDatosServidor.length+"]    arrDatosServidorInc["+arrDatosServidorInc.length+"]   NumRegsProcesados["+gNumRegsProcesados+"]");

        //}
        //console.log("3) pDatosDelJournal:: arrDatosServidor["+arrDatosServidor.length+"]");
        //console.log("3) pDatosDelJournal:: arrDatosServidorBack["+arrDatosServidorBack.length+"]");

        fchSys   = new Date();
        _anioSys = fchSys.getFullYear();
        _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        _diaSys  = fchSys.getDate();
        _hraSys  = fchSys.getHours();
        _minSys  = fchSys.getMinutes();
        _segSys  = fchSys.getSeconds();
        
        this.dUltimaActualizacion = sprintf('%4d-%02d-%02d %02d:%02d:%02d', _anioSys, _mesSys, _diaSys, _hraSys, _minSys, _segSys);
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

      this.form = this.formBuilder.group({
          date: [new Date(1991, 8, 12)]
      });

      tIdx = 0;
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

        //this.dFchIniProceso = sprintf("%4d-%02d-%02d", 2017, 10, 1);
        //this.dFchFinProceso = sprintf("%4d-%02d-%02d", 2017, 10, 1);

        this.paramsServicioNumPaginas.timeStampStart = this.dFchIniProceso + "-" + this.dHraIniProceso;
        this.paramsServicioNumPaginas.timeStampEnd   = this.dFchFinProceso + "-" + this.dHraFinProceso;

        this.ipATM = '11.40.2.2';
        ipAnterior = this.paramsServicioNumPaginas.ip[0];
        //     this.pDatosDelJournal();

        this.pActualizaInfo();
        /*
        setTimeout(() => { this.pDatosDelJournal(); }, 300);
        intervalId = setInterval(() => { this.pDatosDelJournal(); }, tiempoRefreshDatos);
        */

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

/*
    infoDataBaseDexie(nomDB): void{

        new Dexie(nomDB).open().then(function (db) {
            console.log ("Found database: " + db.name);
            console.log ("Database version: " + db.verno);
            db.tables.forEach(function (table) {
                console.log ("Found table: " + table.name);
                console.log ("Table Schema: " +
                    JSON.stringify(table.schema, null, 4));
            });
        }).catch('NoSuchDatabaseError', function(e) {
            // Database with that name did not exist
            console.log ("Database not found");
        }).catch(function (e) {
            console.log ("Oh uh: " + e);
        });
        
    }
*/
/*
    consultaDepositosDexie(): void{

        // count
        
        dbDexie.tabDepositos.toCollection().count(function (count) {
           console.log(count + " Depositos.");
        });

        / *
        dbDexie.tabDepositos
        .each(function (d) {

            console.log(sprintf("%5.5d %3.3d %3.3d %8.8s %8.8s %7.7d %2.2d %4.4d %2.2d %2.2d  %9.9d",
                d.id, d.idSesDep, d.nivelDep, d.hraIniDep, d.hraTerDep, d.monto, d.numIntentos, d.totSegundos, d.minutos, d.segundos, d.difMiliSegs));

        });
        * /

        dbDexie.tabDepositos.where('nivelDep').equals(1)
        .each(function (d) {

            console.log(sprintf("%5.5d %3.3d %3.3d %8.8s %8.8s %7.7d %2.2d %2.2d %4.4d %2.2d %2.2d  %9.9d",
                d.id, d.idSesDep, d.nivelDep, d.hraIniDep, d.hraTerDep, d.monto, d.numIntentos, d.fallidos, d.totSegundos, d.minutos, d.segundos, d.difMiliSegs));

        });
        //dbDexie.tabDepositos.where('nivelDep').equals(1).each(function(d){console.log(d.hraIniDep)});

        / *
        dbDexie.tabDepositos.orderBy('id')(function (dep){
          console.log(dep.id, dep.hraIniDep, dep.hraTerDep);
        });
        * /
        / *
        dbDexie.each(function(tabDepositos) {
            console.log(sprintf("%s - %s - %d",tabDepositos.hraIniDep, tabDepositos.hraTerDep, tabDepositos.monto));
        });
        * /
    }
*/

/*
    borraContenidoTabla():  void{

        //console.log("Se va a borrar el contenido de la tabla tabDepositos");
        / *
        dbDexie.tabDepositos.clear().then(function (err){
            //console.log("La tabla tabDepositos se borra correctamente.");
        }).catch (function (err) {
            console.log('Error al borrar el contenido de la tabla tabDepositos: ' + (err.stack || err));
        });
        * /
        if (dbDexie.isOpen() == true){
            dbDexie.tabDepositos.clear().then(function (err){
                //console.log("La tabla tabDepositos se borra correctamente.");
            }).catch (function (err) {
                console.log('Error al borrar el contenido de la tabla tabDepositos: ' + (err.stack || err));
            });
        }

        console.log("Estado de la BD: ["+dbDexie.isOpen()+"]")

    }
*/
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
        //console.log(infoBilletes);
        var montoTotal = 0;
        var respBilletes = {b20: 0, b50: 0, b100: 0, b200: 0, b500: 0, b1000: 0, total: 0};
        // Localiza la posición del caracter [
        let posInicial = infoBilletes.indexOf('[');

        // Localiza la posición del caracter ]
        let posFinal = infoBilletes.indexOf(']', posInicial);

        // Extrae el contenido que se encuentra entre los caracteres [ y ] y elimina estos caracteres.
        let billetes1 = infoBilletes.substr(posInicial, (posFinal - posInicial)).replace(/[\[\]]/g,'');
        //console.log("pDenominacionesBilletes:: billetes1("+billetes1+")");

        // Realiza un split sobre el resultado del paso anterior y con el caracter "pipe" para creaer un arreglo.
        let arrBilletes = billetes1.split("|");
        for(let idx=0; idx < arrBilletes.length; idx++){
            //console.log("pDenominacionesBilletes:: ("+arrBilletes[idx]+")");
            let arrBilletes2 =  arrBilletes[idx].split("x");
            //for(let idx2=0; idx2 < arrBilletes2.length; idx2++){
                //console.log("pDenominacionesBilletes:: ("+arrBilletes2[0]+") x ("+arrBilletes2[1]+")");
                /*
                switch(arrBilletes2[1]){
                    case '20':   { respBilletes.b20   += Number(arrBilletes2[0]); break; }
                    case '50':   { respBilletes.b50   += Number(arrBilletes2[0]); break; }
                    case '100':  { respBilletes.b100  += Number(arrBilletes2[0]); break; }
                    case '200':  { respBilletes.b200  += Number(arrBilletes2[0]); break; }
                    case '500':  { respBilletes.b500  += Number(arrBilletes2[0]); break; }
                    case '1000': { respBilletes.b1000 += Number(arrBilletes2[0]); break; }
                }
                */
                switch(arrBilletes2[1]){
                    case '20':   { respBilletes.b20   = Number(arrBilletes2[0]); break; }
                    case '50':   { respBilletes.b50   = Number(arrBilletes2[0]); break; }
                    case '100':  { respBilletes.b100  = Number(arrBilletes2[0]); break; }
                    case '200':  { respBilletes.b200  = Number(arrBilletes2[0]); break; }
                    case '500':  { respBilletes.b500  = Number(arrBilletes2[0]); break; }
                    case '1000': { respBilletes.b1000 = Number(arrBilletes2[0]); break; }
                }
                //console.log("1) "+respBilletes.total + " - " + arrBilletes2[0] + " - " + arrBilletes2[1]);
                respBilletes.total += Number(arrBilletes2[1]) * Number(arrBilletes2[0]);
                //console.log("2) "+respBilletes.total + " - " + arrBilletes2[0] + " - " + arrBilletes2[1]);
            //}
        }
        //console.log(JSON.stringify(respBilletes));
        // Entrar a un for sobre el arreglo del paso anterior.
        // Por cada elemento del arreglo del paso anterior, realizar un split por el caracter "x".
        // Realizar un for por cada elemento del arreglo del paso anterior.
        // Acumular el número de billetes.
        // Acumular el resultado de la multiplicación del número de piezas por la denominación.

        return(respBilletes);
    }

    public pActParams(): void{
        ipAnterior           = this.paramsServicioNumPaginas.ip[0];
    }
}

