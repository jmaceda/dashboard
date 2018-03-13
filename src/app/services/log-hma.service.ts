import { Injectable }                           from '@angular/core';
import { OnInit }                               from '@angular/core';
import { sprintf }                              from "sprintf-js";
import { SoapService }                          from './soap.service';

import * as moment from 'moment';


export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

export var gNumPagsLogHma = 0;
export var gNumRegsLogHma = 0;
export var gRespDatosLogHma:any;

var nomComponente:string = "LogHmaService";

@Injectable()
export class LogHmaService implements OnInit {

    public devicesAtm:any[] = [];

    constructor(public _soapService: SoapService){
        console.log(nomComponente+".constructor:: init");
    }

    public ngOnInit() {
    }

    public GetHmaDevices() {

        let url = "assets/data/devicesAtm.json";

        $.getJSON(url, function (data) {
            //recorre cada elemento
            $.each(data, function (idx, descripcion) {
                //console.log(JSON.stringify("("+idx+") "+descripcion));
                gDevicesAtm[idx] = descripcion;
            });
        });
        return(gDevicesAtm);
    }

    private GetHmaEvent(catEventos:any, status){
        gCatEventos = catEventos;
    }

    public obtenEventos(){

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent, false);

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
        //console.log(Object.keys(gCatalogoEventos).length);

        return(gCatalogoEventos);
    }

    public GetHmaLogDataLength(respNumPaginasLogHma:object, status){
        gNumPagsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalPages;
        gNumRegsLogHma  = JSON.parse(JSON.stringify(respNumPaginasLogHma)).TotalItems;
    }

    public GetHmaLogPage(respDatosLogHma:any[], status){
        gRespDatosLogHma = respDatosLogHma;
    }

    public obtenTiempoPromedioOper(filtrosConsulta){


        let paramsCons: any = {
            ip: [filtrosConsulta.ipAtm], timeStampStart: filtrosConsulta.timeStampStart, timeStampEnd: filtrosConsulta.timeStampEnd,
            events: ['MediaInserted', 'CardEjected', 'MediaRemoved'], device: ['ICM']
        };
        console.log(paramsCons);
        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);
        console.log("Paginas: <"+gNumPagsLogHma+">");
        let datosRespLogHma:any     = [];
        let datosTiempoOpers:any    = [];
        let respDatosTiempoOpers:any;

        if (gNumPagsLogHma > 0) {

            let cveCat:string       = "";
            let ftoHora:any         = {month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'};
            let hraInicio:any       = null;
            let hraTermino:any      = null;
            let segsDuracion:any    = 0;
            let numOpers:number     = 0;
            let tiempoDuracion:any  = "00:00";
            let minsTotDura:number  = 0;
            let segsTotDura:number  = 0;
            let acumSegs:number     = 0;
            let hraTiempoMin:any    = null;
            let segsTiempoMin:any = "99:99";
            let hraTiempoMax:any    = null;
            let segsTiempoMax:any = "00:00";


            for (let idx = 0; idx < gNumPagsLogHma; idx++) {
                paramsCons.page = idx;
                console.log(paramsCons);
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                //datosRespLogHma = datosRespLogHma.concat(gRespDatosLogHma);

                gRespDatosLogHma.forEach( (reg, idx) => {
                    reg.TimeStamp   = new Date(reg.TimeStamp).toLocaleString('es-sp', ftoHora);
                    cveCat          = "c"+reg.HmaEventId;
                    reg.Events      = gCatalogoEventos[cveCat];
                    reg.DescDevice  = gDevicesAtm[reg.Device];

                    if(reg.DescDevice == "Lectora de Tarjetas" && reg.Events == "MediaInserted"){
                        hraInicio = reg.TimeStamp;
                    }else if( (reg.Events == "MediaRemoved" && reg.DescDevice == "Lectora de Tarjetas")){
                        hraTermino      = reg.TimeStamp;
                        segsDuracion    = moment(hraTermino, 'DD/MM/YYYY HH:mm:ss').diff(moment(hraInicio, 'DD/MM/YYYY HH:mm:ss'), 'seconds');
                        minsTotDura     = Math.floor(segsDuracion/60);
                        segsTotDura     = (minsTotDura == 0) ? segsDuracion : segsDuracion - (minsTotDura * 60);
                        tiempoDuracion  = sprintf("%02d:%02d", minsTotDura, segsTotDura);

                        if (hraInicio == null){
                            hraInicio = "*****";
                            tiempoDuracion = "*****";
                        }else{
                            acumSegs += segsDuracion;
                            numOpers++;
                        }



                        datosTiempoOpers.push({hraIni: hraInicio, hraFin: hraTermino, tiempoDura: tiempoDuracion, acumSegs: acumSegs, numOpers: numOpers});
                        hraInicio   = null;
                    }

                    if (hraTiempoMin == null || (tiempoDuracion < segsTiempoMin && tiempoDuracion != "*****")){
                        hraTiempoMin    = reg.TimeStamp;
                        segsTiempoMin   = tiempoDuracion
                    }
                    if (hraTiempoMax == null || (tiempoDuracion > segsTiempoMax)){
                        hraTiempoMax    = reg.TimeStamp;
                        segsTiempoMax   = tiempoDuracion
                    }
                });
            }
            console.log("Num. opers: "+numOpers);

            minsTotDura     = Math.floor( (acumSegs / numOpers) / 60);
            segsTotDura     = (minsTotDura == 0) ? Math.floor( acumSegs / numOpers) : acumSegs - (minsTotDura);
            let tiempoPromedio  = Math.round(acumSegs / numOpers);

            console.log("acumSegs: ["+acumSegs+"]  numOpers["+numOpers+"]");
            console.log("minsTotDura: ["+minsTotDura+"]  segsTotDura["+segsTotDura+"]  tiempoPromedio["+tiempoPromedio+"]");
            respDatosTiempoOpers = {
                'resumen': {'hraTiempoMin': hraTiempoMin, 'segsTiempoMin': segsTiempoMin, 'hraTiempoMax': hraTiempoMax, 'segsTiempoMax': segsTiempoMax, 'numOper': numOpers },
                'detalle': datosTiempoOpers
            };
        }
        return(respDatosTiempoOpers);
    }

}