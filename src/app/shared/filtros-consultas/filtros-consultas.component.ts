/* app/reportes/params/params.component.ts */
import { Component }                        from '@angular/core';
import { OnInit }                           from '@angular/core';
import { Input}                             from '@angular/core';
import { Output}                            from '@angular/core';
import { EventEmitter}                      from '@angular/core';
import { ViewChild, ViewChildren}           from '@angular/core';
import { TemplateRef }                      from '@angular/core';


import { sprintf }                          from "sprintf-js";
import { SoapService }                      from '../../services/soap.service';

import { DetalleAtmsService }               from '../../services/detalle-atms.service';
import {NgbModal, ModalDismissReasons}      from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalBasic }                   from '../../utils/modal-basic';
import { NgbdModalContent }                 from '../../utils/ngbd-modal-content';
import { BsModalComponent } from 'ng2-bs3-modal';
import * as $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.js';
//import { AngularDateTimePickerModule }      from 'angular2-datetimepicker';


export var datosATMs  = [];
export var ipATMs  = [];

var nomModulo = "ParamsComponent";


@Component({
    selector   : 'filtros-consultas',
    templateUrl: './filtros-consultas.component.html',
    styleUrls  : ['./filtros-consultas.component.css'],
    providers: [SoapService, DetalleAtmsService],
})
export class FiltrosConsultasComponent implements OnInit {

    @Input() dUltimaActualizacion: string;      // Recibe lf fecha y hora de la ultima actualización para mostrarla en "idFchHraUltimaActual"
    @Input() dListaAtmGpos: any;                // Recibe la lista de ATMs o Grupos para ser mostrados en el combo "idComboAtmGpo".
    @Input() dTipoListaParams: any;             // Recibe si el combo "idComboAtmGpo" debe mostar A=lista de ATMs o G=lista de Grupos
    @Input() dSolicitaFechasIni: any;           // Indica se mostrara el combo para solicitar la fecha inicial o no (true=Si /false=No)
    @Input() dSolicitaFechasFin: any;           // Indica se mostrara el combo para solicitar la fecha final o no (true=Si /false=No)
    @Output() parametrosConsulta = new EventEmitter(); // Función del Componente Padre que será ejecutada al oprimir el bototon "Actualiza".


    @ViewChild('myModal')
    modal: BsModalComponent;
    settings = {
        bigBanner: true,
        timePicker: true,
        format: 'dd-MMM-yyyy HH:mm',
        defaultOpen: false,
        closeOnSelect: true
    };

    public contenidoCombo;
    public fchInicio: Date;
    public fchFin: Date;
    public elijaOpcion:string = "Seleccione el ATM";
    public gListaGpos:any[];
    public ipATMs:any[] = [];
    public ip;
    public url;
    public paramsConsulta:any = {};
    public contenidoLista:string = "";
    public gpoSeleccionado:string = "";
    public atmSeleccionado:string = "";
    //public value:number;

    constructor(public _soapService: SoapService,
                public detalleAtmsService: DetalleAtmsService,
                private modalService: NgbModal){
    }


    public ngOnInit() {
        console.log(nomModulo + ".ngOnInit:: Inicio");

        this.inicilizaFechasFiltro();

        if (this.dTipoListaParams == "G") {
            this.contenidoCombo = "Grupos";
            this.gListaGpos = this.detalleAtmsService.obtenGetGroups();
            this.ipATMs = [];
            this.ipATMs.push("-- Todos --");
            this.gListaGpos.forEach((reg)=> {
                this.ipATMs.push(reg.Description);
            });

            console.log("--> " + this.ipATMs + "<--");
            this.contenidoLista = "Seleccione Grupo";
        } else if (this.ipATMs.length == 0) {
            this.contenidoCombo = "ATMs";
            this.ipATMs = this.detalleAtmsService.obtenGetAtm();
            this.contenidoLista = "Seleccione ATM";
        }

        this.ipATMs.sort(function (a, b) {
            return a.localeCompare(b);
        });
    }

    public inicilizaFechasFiltro(){
        console.log(nomModulo+".obtenFchSys:: init");
        let fchSys      = new Date();
        let _anioSys    = fchSys.getFullYear();
        let _mesSys     = fchSys.getMonth();
        let _diaSys     = fchSys.getDate();
        let _hraSys     = fchSys.getHours();
        let _minSys     = fchSys.getMinutes();
        let _segSys     = fchSys.getSeconds();

        this.fchInicio  = new Date( _anioSys, _mesSys, _diaSys, 0, 0, 0 );
        this.fchFin     = new Date( _anioSys, _mesSys, _diaSys, 23, 59, 59 );
    }

    public pActualizaInfo(){
        console.log("ParamsComponent.paramsActuales:: inicia");

        let fchInicio   = this.Date2Json(this.fchInicio);
        let fchFin      = this.Date2Json(this.fchFin);
        let ipATM       = this.atmSeleccionado;

        console.log("params.component.paramsActuales: fchInicio["+JSON.stringify(fchInicio)+"] fchFin["+JSON.stringify(fchFin)+"]");
        let idGpo:any;
        if (this.dTipoListaParams == "G") {
            console.log("ParamsComponent.paramsActuales:: gpoSeleccionado["+this.atmSeleccionado+"]");
            if (this.atmSeleccionado != "Todos") {
                idGpo = this.detalleAtmsService.obtenIdGroup(this.atmSeleccionado);
            }
            console.log("ParamsComponent.paramsActuales:: idGpo["+typeof(idGpo)+"]");
            idGpo = (typeof(idGpo) == 'number') ? idGpo.toString() : idGpo;
            console.log("ParamsComponent.paramsActuales:: idGpo["+idGpo+"]");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, gpo: idGpo};
        }else {
            console.log("ParamsComponent.paramsActuales:: ipATM["+ipATM+"]");
            ipATM = ipATM.substring(ipATM.lastIndexOf("(") + 1).replace(")", "");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, atm: ipATM};
        }

        this.parametrosConsulta.emit(this.paramsConsulta);
    }


    public Date2Json(fecha:Date):string {

        let fchLocal: Date = ( typeof(fecha) == 'string') ? new Date(fecha) : fecha;
        let fchJson:any = {};

        fchJson.year    = fchLocal.getFullYear();
        fchJson.month   = fchLocal.getMonth() +1;
        fchJson.day     = fchLocal.getDate();
        fchJson.hour    = fchLocal.getHours();
        fchJson.min     = fchLocal.getMinutes();
        fchJson.sec     = fchLocal.getSeconds();
        fchJson.milsec  = fchLocal.getTime();

        return(fchJson);
    }

    public pAtmSeleccionado(idx){}

    /*

    Código pendiente para aplicar cuando se muestren todos los filtros para seleccionarlos desde una pantalla modal.

    public GetEjaFilters(result:any, status){

        var ipATM = '';

        for(let idx = 0; idx < result.length; idx++){
            for(let idx2 = 0; idx2 < result[idx].length; idx2++){
                if(idx === 0){
                    ipATM = result[idx][idx2];
                    ipATMs[ipATMs.length] = result[idx][idx2];
                }else{
                    datosATMs.push(result[idx][idx2] + "    ("+ result[0][idx2] + ")");
                }
            }
        }
    }

    public obtieneIpATMs(){
        //console.log('ParamsComponent.obtenIpATMs:: Inicio');
        ipATMs  = [];
        this._soapService.post('', 'GetEjaFilters', '', this.GetEjaFilters);
        this.ipATMs = ipATMs;
        //this.ipATMs = ipATMs.sort(comparar);
        this.ipATMs = ipATMs.sort(function (a, b) {
            return a.localeCompare(b);
        });
        //console.log('ParamsComponent.obtenIpATMs:: Se ejecuto la consulta');
    }




    public gSeleccion:any;

    public paramsActuales(idOrigen:number){
        console.log("ParamsComponent.paramsActuales:: inicia");
        //this.arrParams  = this.ipATMs;
        let fchInicio   = this.Date2Json(this.fchInicio);
        let fchFin      = this.Date2Json(this.fchFin);
        let ipATM       = this.atmSeleccionado;

        console.log("params.component.paramsActuales: fchInicio["+JSON.stringify(fchInicio)+"] fchFin["+JSON.stringify(fchFin)+"]");
        let idGpo:any;
        if (this.dTipoListaParams == "G") {
            console.log("ParamsComponent.paramsActuales:: gpoSeleccionado["+this.atmSeleccionado+"]");
            if (this.atmSeleccionado != "Todos") {
                idGpo = this.detalleAtmsService.obtenIdGroup(this.atmSeleccionado);
            }
            console.log("ParamsComponent.paramsActuales:: idGpo["+typeof(idGpo)+"]");
            idGpo = (typeof(idGpo) == 'number') ? idGpo.toString() : idGpo;
            console.log("ParamsComponent.paramsActuales:: idGpo["+idGpo+"]");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, gpo: idGpo, idOrigen: idOrigen};
        }else {
            console.log("ParamsComponent.paramsActuales:: ipATM["+ipATM+"]");
            ipATM = ipATM.substring(ipATM.lastIndexOf("(") + 1).replace(")", "");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, atm: ipATM, idOrigen: idOrigen};
        }

        this.parametrosConsulta.emit(this.paramsConsulta);
    }

    public pActualizaParams() {

        console.log("ParamsComponent.pActualizaParams:: Se va a abrir la modal");
        this.modal.open();
        console.log("ParamsComponent.pActualizaParams:: Se abrio la modal");
        this.paramsActuales(3);
    }

    public pActualizaInfoX(){
        //console.log("pActualizaInfo:: Atm seleccionado["+this.atmSeleccionado+"]");
        this.paramsActuales(1);
    }
   */



}

