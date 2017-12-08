/* app/services/detalle-atms-service.ts */

import { Injectable } from '@angular/core';
import { OnInit } from '@angular/core';

import { SoapService }      from './soap.service';

export var gDatosAtms;
var nomModulo = "DetalleAtmsService";

@Injectable()
export class DetalleAtmsService implements OnInit {

	constructor(public _soapService: SoapService){
        console.log(nomModulo+".constructor:: init");
    }

    public GetAtm(datosAtms:any, status){

        console.log(nomModulo+".GetAtm:: Inicio  ["+new Date()+"]");
        gDatosAtms = datosAtms;
    }


    public obtenGetAtm() {

        console.log(nomModulo+".obtenGetAtm:: Se van a obtener los datos");

        let parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1 };

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm);

        let idx = 0;
		let arrNomAtms:any[] = [];
		
        gDatosAtms.forEach((reg)=> {
			arrNomAtms.push( (reg.Description + ' (' + reg.Ip + ')') );
        });

		return(arrNomAtms.sort(comparar));

    };	

	ngOnInit() {

	}

}

function comparar ( a, b ){ return a - b; }
