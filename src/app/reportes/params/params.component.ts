/* app/reportes/params/params.component.ts */
import { Component }        from '@angular/core';
import { OnInit }           from '@angular/core';
import { Input}             from '@angular/core';

import { SoapService } from '../../services/soap.service';

//import {A2Edatetimepicker} from 'ng2-eonasdan-datetimepicker';
import * as moment from 'moment';

//import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
//import { FormGroup, FormBuilder } from '@angular/forms';

export var datosATMs  = [];
export var ipATMs  = [];


@Component({
    selector   : 'params',
    templateUrl: './params.component.html',
    styleUrls  : ['./params.component.css'],
    providers: [SoapService]
})
export class ParamsComponent implements OnInit  {

    //@Input() ipATMs: string;

    public ipATMs:any[] = [];
    public ip;
    public url;

    public dFchIniProceso: string = '2017-09-10';
    public dFchFinProceso: string = '2017-09-10';
    public dHraIniProceso: string = '00-00';
    public dHraFinProceso: string = '23-59';




    ngOnInit() {
        console.log("ParamsComponent.ngOnInit:: Inicio");

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.dFchIniProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);
        this.dFchFinProceso = sprintf("%4d-%02d-%02d", _anioSys, _mesSys, _diaSys);

        this.obtieneIpATMs();
    }

    constructor(public _soapService: SoapService){

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

    public pActualizaInfo(){

    }


    /*
    public ipATMs:any[] = [];
    public ip;
    public url;
    date2: Date = new Date(2016, 5, 10);
    date3: Date;
    date4: Date;
    datepickerOpts: any = {
        startDate: new Date(2016, 5, 10),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'D, d MM yyyy'
    };
    date5: Date = new Date();
    date6: Date = new Date();
    dateFrom: Date;
    dateTo: Date;
    datepickerToOpts: any = {};
    form: FormGroup;

    date: moment.Moment;
    a2eOptions: any;

    dateChange(date) {
        this.date = date;
    }

    dateClick() {
        console.log('click click!')
    }

    getTime() {
        alert('Selected time is:' + this.date);
    };

    addTime(val, selector) {
        this.date = moment(this.date.add(val, selector));
    };

    clearTime() {
        this.date = null;
    };
*/
    /*
    constructor(public _soapService: SoapService){
        this.date = moment();
        this.a2eOptions = {format: 'YYYY/MM/DD HH:mm'};
    }
    */
/*
    ngOnInit() {
        console.log("ParamsComponent.ngOnInit:: Inicio");
        this.obtieneIpATMs();
        this.form = this.formBuilder.group({
            date: [new Date(1991, 8, 12)]
        });
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

    public pActualizaInfo(){

    }

    constructor(private formBuilder: FormBuilder, public _soapService: SoapService) { }

    handleDateFromChange(dateFrom: Date) {
        // update the model
        this.dateFrom = dateFrom;

        // do not mutate the object or angular won't detect the changes
        this.datepickerToOpts = {
            startDate: dateFrom
        };
    }

    getDate(dt: Date): number {
        return dt && dt.getTime();
    }
*/

}


function comparar ( a, b ){ return a - b; }

