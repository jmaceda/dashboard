/* app/reportes/params/params.component.ts */
import { Component }        from '@angular/core';
import { OnInit }           from '@angular/core';
import { Input}             from '@angular/core';
import { Output}            from '@angular/core';
import { EventEmitter}      from '@angular/core';

import { sprintf }          from "sprintf-js";
import { SoapService }      from '../../services/soap.service';

import { DetalleAtmsService } from '../../services/detalle-atms.service';
//import '../sass/main.scss';



//import {A2Edatetimepicker} from 'ng2-eonasdan-datetimepicker';
//mport * as moment from 'moment';

//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
//import { FormGroup, FormBuilder } from '@angular/forms';

export var datosATMs  = [];
export var ipATMs  = [];


@Component({
    selector   : 'params',
    templateUrl: './params.component.html',
    styleUrls  : ['./params.component.css'],
    providers: [SoapService, DetalleAtmsService]
})
export class ParamsComponent implements OnInit  {

    @Input() arrParams: any[];
    @Output() Params = new EventEmitter();

    fchInicio: Date;
    fchFin: Date;
    elijaOpcion:string = "Seleccione el ATM";

    settings = {
        bigBanner: true,
        timePicker: true,
        format: 'dd-MMM-yyyy HH:mm',
        defaultOpen: false,
        closeOnSelect: true
    }

    public ipATMs:any[] = [];
    public ip;
    public url;

    obtenFchSys(){

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth();   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.fchInicio = new Date( _anioSys, _mesSys, _diaSys, 0, 0, 0 );
        this.fchFin = new Date( _anioSys, _mesSys, _diaSys, 23, 59, 59 );
    }

    ngOnInit() {
        console.log("ParamsComponent.ngOnInit:: Inicio");

        this.obtenFchSys();
        //this.obtieneIpATMs();
        console.log("Se va a ejecutar el servicio detalleAtmsService...");
        if (this.ipATMs.length == 0) {
            this.ipATMs = this.detalleAtmsService.obtenGetAtm();

            this.arrParams = this.ipATMs;
            this.Params.emit({
                value: this.arrParams
            });
        }

        console.log(this.ipATMs);
    }

    constructor(public _soapService: SoapService, public detalleAtmsService: DetalleAtmsService){

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
        console.log('ParamsComponent.obtenIpATMs:: Inicio');
        ipATMs  = [];
        this._soapService.post('', 'GetEjaFilters', '', this.GetEjaFilters);
        this.ipATMs = ipATMs;
        this.ipATMs = ipATMs.sort(comparar);
        console.log('ParamsComponent.obtenIpATMs:: Se ejecuto la consulta');
    }

    public Date2Json(fecha:Date):string {
        let fchJson:any = {};
        fchJson.year    = fecha.getFullYear();
        fchJson.month   = fecha.getMonth() +1;
        fchJson.day     = fecha.getDate();
        fchJson.hour    = fecha.getHours();
        fchJson.min     = fecha.getMinutes();
        fchJson.sec     = fecha.getSeconds();
        fchJson.milsec  = fecha.getTime();

        console.log(fchJson);

        return(fchJson);
    }
    public pActualizaParams() {

        console.log("pActualizaParams:: inicia");
        let fchInicio = this.fchInicio;
        let fchFin = this.fchFin;
        this.Date2Json(fchInicio);
        this.Date2Json(fchFin);
        console.log(fchInicio.getDate())
        //console.log(fchInicio.getFullYear() + "  -  " + this.fchFin);
    }

    public pActualizaInfo(){

    }

}

function comparar ( a, b ){ return a - b; }

