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


export var datosATMs  = [];
export var ipATMs  = [];

var nomModulo = "ParamsComponent";


@Component({
    selector   : 'params-atms',
    templateUrl: './params-atms.component.html',
    styleUrls  : ['./params-atms.component.css'],
    providers: [SoapService, DetalleAtmsService],
})
export class ParamsAtmsComponent implements OnInit {

    @Input() dUltimaActualizacion: string;
    @Output() parametrosConsulta = new EventEmitter();

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
    public url;
    public paramsConsulta:any = {};

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

    ngOnInit() {
        console.log(nomModulo+".ngOnInit:: Inicio");

        this.obtenFchSys();

        //console.log("Se va a ejecutar el servicio detalleAtmsService...");
        if (this.ipATMs.length == 0) {
            this.ipATMs = this.detalleAtmsService.obtenGetAtm();
        }

        console.log(nomModulo+".ngOnInit:: " + this.ipATMs);
    }

    constructor(public _soapService: SoapService, public detalleAtmsService: DetalleAtmsService,
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
        //console.log('ParamsComponent.obtenIpATMs:: Inicio');
        ipATMs  = [];
        this._soapService.post('', 'GetEjaFilters', '', this.GetEjaFilters);
        this.ipATMs = ipATMs;
        this.ipATMs = ipATMs.sort(comparar);
        //console.log('ParamsComponent.obtenIpATMs:: Se ejecuto la consulta');
    }

    public Date2Json(fecha:Date):string {

        let fchLocal: Date;
        if ( typeof(fecha) == 'string') {
            //fecha = new Date(this.fchInicio);
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
        console.log("ParamsComponent.paramsActuales:: inicia");
        //this.arrParams  = this.ipATMs;
        let fchInicio   = this.Date2Json(this.fchInicio);
        let fchFin      = this.Date2Json(this.fchFin);
        let ipATM       = this.atmSeleccionado;

        //console.log("params.component.paramsActuales: fchInicio["+fchInicio+"] fchFin["+fchFin+"]");
        ipATM = ipATM.substring(ipATM.lastIndexOf("(")+1).replace(")","");
        this.paramsConsulta = {fchInicio: fchInicio, fchFin: fchFin, atm: ipATM, idOrigen: idOrigen};

        this.parametrosConsulta.emit(this.paramsConsulta);
    }

    public pActualizaParams() {
        //console.log("pActualizaParams:: Atm seleccionado["+this.atmSeleccionado+"]");
        //$(".alert").alert();
        console.log("ParamsComponent.pActualizaParams:: Se va a abrir la modal");
        this.modal.open();
        console.log("ParamsComponent.pActualizaParams:: Se abrio la modal");
        this.paramsActuales(3);
    }

    public pActualizaInfo(){
        //console.log("pActualizaInfo:: Atm seleccionado["+this.atmSeleccionado+"]");
        this.paramsActuales(1);
    }

    public atmSeleccionado:string = "";
    public value:number;
    public pAtmSeleccionado(idx){
        //console.log("pAtmSeleccionado:: Atm seleccionado["+this.atmSeleccionado+"]");
        //this.paramsActuales(2);
        //open(this.msgModal);
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

