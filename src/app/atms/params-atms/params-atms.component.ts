/* app/reportes/params/params.component.ts */
import { Component }                        from '@angular/core';
import { OnInit }                           from '@angular/core';
import { Input}                             from '@angular/core';
import { Output}                            from '@angular/core';
import { EventEmitter}                      from '@angular/core';
import { ViewChild, ViewChildren}           from '@angular/core';
import { TemplateRef }                      from '@angular/core';

import {NgbModal, ModalDismissReasons}      from '@ng-bootstrap/ng-bootstrap';
import { BsModalComponent } from 'ng2-bs3-modal';
import * as $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.js';


import { sprintf }                          from "sprintf-js";
import { SoapService }                      from '../../services/soap.service';

import { InfoAtmsService }               from '../../services/info-atms.service';
import { NgbdModalBasic }                   from '../../utils/modal-basic';
import { NgbdModalContent }                 from '../../utils/ngbd-modal-content';




export var datosATMs  = [];
export var ipATMs  = [];

var nomModulo = "ParamsComponent";


@Component({
    selector   : 'params-atms',
    templateUrl: './params-atms.component.html',
    styleUrls  : ['./params-atms.component.css'],
    providers: [SoapService, InfoAtmsService],
})
export class ParamsAtmsComponent implements OnInit {

    @Input() dUltimaActualizacion: string;
    @Input() dListaAtmGpos: any;
    @Input() dTipoListaParams: any;
    @Input() dSolicitaFechasIni: any;
    @Input() dSolicitaFechasFin: any;
    @Output() parametrosConsulta = new EventEmitter();

    public gListaGpos:any[];

    @ViewChild('myModal')
    modal: BsModalComponent;

    fchInicio: Date;
    fchFin: Date;
    elijaOpcion:string = "Seleccione el ATM";

    settings = {
        bigBanner: true,
        timePicker: true,
        format: 'dd-MMM-yyyy HH:mm',
        defaultOpen: false,
        closeOnSelect: true
    };

    public ipATMs:any[] = [];
    public ip;
    public ipATM;
    public url;
    public paramsConsulta:any = {};
    public contenidoLista:string = "";
    public contenidoCombo = (this.dTipoListaParams == 'G') ? "Grupos" : "ATMs";

    obtenFchSys(){
        console.log(nomModulo+".obtenFchSys:: init");
        let fchSys      = new Date();
        let _anioSys    = fchSys.getFullYear();
        let _mesSys     = fchSys.getMonth();   //hoy es 0!
        let _diaSys     = fchSys.getDate();
        let _hraSys     = fchSys.getHours();
        let _minSys     = fchSys.getMinutes();
        let _segSys     = fchSys.getSeconds();

        this.fchInicio  = new Date( _anioSys, _mesSys, _diaSys, 0, 0, 0 );
        this.fchFin     = new Date( _anioSys, _mesSys, _diaSys, 23, 59, 59 );
    }

    public ngOnInit() {

        if (this.dTipoListaParams == "G") {
            this.contenidoCombo = "Grupos";
            this.gListaGpos     = this.detalleAtmsService.obtenGetGroups();
            this.ipATMs         = [];
            this.ipATMs.push("-- Todos --");
            this.gListaGpos.forEach((reg)=> {
                this.ipATMs.push(reg.Description);
            });
            this.contenidoLista = "Seleccione Grupo";
        } else if (this.ipATMs.length == 0) {
            this.contenidoCombo = "ATMs";
            this.ipATMs         = this.detalleAtmsService.obtenGetAtm();
            this.contenidoLista = "Seleccione ATM";
        }
    }

    constructor(public _soapService: SoapService,
                public detalleAtmsService: InfoAtmsService,
                private modalService: NgbModal){
    }

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
        ipATMs  = [];
        this._soapService.post('', 'GetEjaFilters', '', this.GetEjaFilters, false);
        this.ipATMs = ipATMs;
        this.ipATMs = ipATMs.sort(comparar);
    }

    public Date2Json(fecha:Date):string {

        let fchLocal: Date;
        if ( typeof(fecha) == 'string') {
            fchLocal = new Date(fecha);
        }else{
            fchLocal = fecha;
        }
        let fchJson:any = {};
        fchJson.year    = fchLocal.getFullYear();
        fchJson.month   = fchLocal.getMonth() +1;
        fchJson.day     = fchLocal.getDate();
        fchJson.hour    = fchLocal.getHours();
        fchJson.min     = fchLocal.getMinutes();
        fchJson.sec     = fchLocal.getSeconds();
        fchJson.milsec  = fchLocal.getTime();

        //console.log("Date2Json:: ["+JSON.stringify(fchJson));
        return(fchJson);
    }


    public paramsActuales(idOrigen:number){
        console.log("ParamsAtmsComponent.paramsActuales:: inicia");
        console.log("ParamsAtmsComponent.paramsActuales:: gpoSeleccionado["+this.gpoSeleccionado+"]");

        let fchInicio   = (this.dSolicitaFechasIni) ? this.Date2Json(this.fchInicio) :  this.Date2Json(new Date());
        let fchFin      = (this.dSolicitaFechasFin) ? this.Date2Json(this.fchFin) :  this.Date2Json(new Date()) ;
        let ipGpo       = this.gpoSeleccionado;
        let ipATM;

        let idGpo:any;
        if (this.dTipoListaParams == "G") {
            if (this.gpoSeleccionado != "Todos") {
                idGpo = this.detalleAtmsService.obtenIdGroup(this.gpoSeleccionado);
            }
            idGpo = (typeof(idGpo) == 'number') ? idGpo.toString() : idGpo;
            let d = new Date();
            let tFchFin = d.getTime();
            console.log("ParamsAtmsComponent.paramsActuales:: fchInicio["+fchInicio+"]");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, gpo: idGpo, idOrigen: idOrigen};
        }else {
            console.log("ParamsAtmsComponent.paramsActuales:: ipATM["+ipATM+"]");
            ipATM = ipATM.substring(ipATM.lastIndexOf("(") + 1).replace(")", "");
            this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, atm: ipATM, idOrigen: idOrigen};
        }

        this.parametrosConsulta.emit(this.paramsConsulta);
    }

    public pActualizaParams() {

        console.log("ParamsAtmsComponent.pActualizaParams:: Se va a abrir la modal");
        this.modal.open();
        console.log("ParamsAtmsComponent.pActualizaParams:: Se abrio la modal");
        this.paramsActuales(3);
    }

    public pActualizaInfo(){
        //console.log("pActualizaInfo:: Atm seleccionado["+this.atmSeleccionado+"]");
        this.paramsActuales(1);
    }

    public gpoSeleccionado:string = "";
    public value:number;
    public pAtmSeleccionado(idx){

    }

    /*
     closeResult: string;
     @ViewChild('msgModal')
     private msgModal:TemplateRef<any>;
     open(content) {
     this.modalService.open(content).result.then((result) => {
     this.closeResult = `Closed with: ${result}`;
     }, (reason) => {
     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
     });
     }
     private getDismissReason(reason: any): string {
     if (reason === ModalDismissReasons.ESC) {
     return 'by pressing ESC';
     } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
     return 'by clicking on a backdrop';
     } else {
     return  `with: ${reason}`;
     }
     }
     */
}

function comparar ( a, b ){ return a - b; }
