/* app/services/detalle-atms-service.ts */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';

export var gDatosAcumTienda;
export var gGrupos;
export var gDatosAtms;

var nomModulo = "AcumPorTiendaService";

@Injectable()
export class AcumPorTiendaService implements OnInit {

    constructor(public _soapService: SoapService){
        console.log(nomModulo+".constructor:: init");
    }

    public GetStoreCumulative(datosAtms:any, status){

        console.log(nomModulo+".GetStoreCumulative:: Inicio  ["+new Date()+"]");
        gDatosAcumTienda = datosAtms;
    }


    public obtenGetStoreCumulative() {

        console.log(nomModulo+".obtenGetStoreCumulative:: Se van a obtener los datos");

        let parameters = { 	nemonico: -1, groupId: -1, brandId: -1, modelId: -1, 
							osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetStoreCumulative", parameters, this.GetStoreCumulative, false);

        let idx = 0;
        let arrNomAtms:any[] = [];

        gDatosAcumTienda.forEach((reg)=> {
            arrNomAtms.push( (reg.Description + ' (' + reg.Ip + ')') );
        });

        return(arrNomAtms.sort(comparar));

    };


    public GetGroupsWithAtms(datosGroups:any, status){
        gGrupos = datosGroups;
    }

    public obtenGetGroups(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms, false);

        let arrNomGrupos:any[] = [];

        gGrupos.forEach((reg)=> {
            arrNomGrupos.push( (reg.Description));
        });
        console.log("InfoAtmsService.obtenGetGroups:: ["+arrNomGrupos+"]");
        return(gGrupos.sort(comparar));
    }


    public obtenIdGroup(descGpo){
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

    public ngOnInit(){}

}

function comparar ( a, b ){ return a - b; }