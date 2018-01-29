import { Injectable }                           from '@angular/core';
import { OnInit }                               from '@angular/core';
import { sprintf }                              from "sprintf-js";
import { SoapService }                          from './soap.service';


export var gCatEventos:any;
export var gCatalogoEventos:any[] = [];
export var gDevicesAtm:any[] = [];

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

        this._soapService.post('', 'GetHmaEvent', '', this.GetHmaEvent);

        let cveCat;
        gCatEventos.forEach( (reg) => {
            cveCat = "c"+reg.SerializedId;
            gCatalogoEventos[cveCat] = reg.Name;
        });
        //console.log(Object.keys(gCatalogoEventos).length);

        return(gCatalogoEventos);
    }

}