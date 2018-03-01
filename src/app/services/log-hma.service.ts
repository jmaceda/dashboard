import { Injectable }                           from '@angular/core';
import { OnInit }                               from '@angular/core';
import { sprintf }                              from "sprintf-js";
import { SoapService }                          from './soap.service';


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
            events: ['MediaInserted', 'CardEjected', 'MediaRemoved', 'MediaTaken'], device: ['ICM', 'PTR']
        };

        // *** Llama al servicio remoto para obtener el numero de paginas a consultar.
        this._soapService.post('', 'GetHmaLogDataLength', paramsCons, this.GetHmaLogDataLength, false);

        let datosRespLogHma:any = [];

        if (gNumPagsLogHma > 0) {
            for (let idx = 0; idx < gNumPagsLogHma; idx++) {
                paramsCons.page = idx;
                this._soapService.post('', 'GetHmaLogPage', paramsCons, this.GetHmaLogPage, false);
                datosRespLogHma = datosRespLogHma.concat(gRespDatosLogHma);
            }

            let cveCat;
            datosRespLogHma.forEach( (reg) => {
                console.log(reg);
                /*
                cveCat = "c"+reg.HmaEventId;
                reg.Events = gCatalogoEventos[cveCat];
                reg.DescDevice = gDevicesAtm[reg.Device];
                */
            });
        }


    }

}