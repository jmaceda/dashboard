/* app/services/detalle-atms-service.ts */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';

export var gDatosAtms;
export var gGrupos;

var nomServicio = "InfoAtmsService";

@Injectable()
export class InfoAtmsService implements OnInit {

    constructor(public _soapService: SoapService){
        console.log(nomServicio+".constructor:: init");
    }

    public GetAtm(datosAtms:any, status){

        console.log(nomServicio+".GetAtm:: Inicio  ["+new Date()+"]");
        gDatosAtms = datosAtms;
    }


    public obtenDetalleAtms(parametros?:any) {

        console.log(nomServicio+".obtenGetAtm:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        return(gDatosAtms);
        /*
        let idx = 0;
        let arrNomAtms:any[] = [];

        gDatosAtms.forEach((reg)=> {
            arrNomAtms.push( (reg.Description + ' (' + reg.Ip + ')') );
        });

        return(arrNomAtms.sort(comparar));
        */

    };

    public obtenGetAtm(parametros?:any) {

        console.log(nomServicio+".obtenGetAtm:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        let idx = 0;
        let arrNomAtms:any[] = [];

        gDatosAtms.forEach((reg)=> {
            arrNomAtms.push( (reg.Description + ' (' + reg.Ip + ')') );
        });

        return(arrNomAtms.sort(comparar));

    };


    GetGroupsWithAtms(datosGroups:any, status){
        gGrupos = datosGroups;
    }

    obtenGetGroups(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms);

        let arrNomGrupos:any[] = [];

        gGrupos.forEach((reg)=> {
            arrNomGrupos.push( (reg.Description));
        });
        console.log("InfoAtmsService.obtenGetGroups:: ["+arrNomGrupos+"]");
        return(gGrupos.sort(comparar));
    }


    obtenIdGroup(descGpo){
        let idGpo = -1;

        if (gGrupos != null && gGrupos != "") {
            gGrupos.forEach((reg) => {
                if (idGpo == -1 && descGpo == reg.Description) {
                    idGpo = reg.Id;
                }
            });
        }

        return(idGpo);
    }

    ngOnInit(){}

}

function comparar ( a, b ){ return a - b; }