/* app/services/detalle-atms-service.ts */

import { Injectable }       from '@angular/core';
import { OnInit }           from '@angular/core';
import { SoapService }      from './soap.service';

export var gDatosAtm:any;
export var gDatosGroups:any = [];
export var gGrupos;
export var gDevicesAtm:any[]  = [];
var nomServicio = "InfoAtmsService";

@Injectable()
export class InfoGroupsService implements OnInit {

    constructor(public _soapService: SoapService){ //},
        console.log(nomServicio+".constructor:: init");
    }

    public ngOnInit() {
        //gDevicesAtm  = this.logHmaService.GetHmaDevices();
    }

    public GetGroup(datosGroups:any, status){

        console.log(nomServicio+".GetGroup:: Inicio  ["+new Date()+"]");
        gDatosGroups = datosGroups;
    }


    public obtenDetalleGroups(parametros?:any) {

        //console.log(nomServicio+".obtenGroups:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetGroup", parameters, this.GetGroup, false);

        return(gDatosGroups);
    };

    public obtenGroups(parametros?:any) {

        console.log(nomServicio+".obtenGroups:: Se van a obtener los datos");
        let parameters:any = parametros;
        let arrNomGroups:any[] = [];

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        if ( gDatosGroups == 0 ) {
            // Obtiene los datos de los Grupos
            this._soapService.post('', "GetGroup", parameters, this.GetGroup, false);
        }

        arrNomGroups = gDatosGroups;

        /*
        gDatosGroups.forEach((reg)=> {
            arrNomGroups.push( (reg.Id + ' (' + reg.Ip + ')') );
        });
        */
        return(arrNomGroups.sort(comparar));

    };


    public GetAtmDetail(datosAtm:any, status){
        gDatosAtm = datosAtm;
    }

    public obtenGroupsDetail(parametros?:any) {

        console.log(nomServicio+".obtenGroups:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros != null || parametros != undefined) {
            // Obtiene los datos del detalle de un ATMs
            this._soapService.post('', "GetAtmDetail", parameters, this.GetAtmDetail, false);
        }else{
            gDatosAtm = "*** No ha indicado el ID del Cajero a consultar ***";
        }

        return(gDatosAtm);

    };

    GetGroupsWithAtms(datosGroups:any, status){
        gGrupos = datosGroups;
    }

    obtenGroupss(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms, false);

        let arrNomGrupos:any[] = [];

        gGrupos.forEach((reg)=> {
            arrNomGrupos.push( (reg.Description));
        });
        //console.log("InfoAtmsService.obtenGroupss:: ["+arrNomGrupos+"]");
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


    GetAtmsIps(datosGroups:any, status){
        gDatosGroups = datosGroups;
    }

    public obtenGroupssIps(parametros?:any) {

        console.log(nomServicio+".obtenGroupssIps:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs por Id
        this._soapService.post('', "GetAtmsIps", parameters, this.GetAtmsIps, false);

        return(gDatosGroups);
    };

    public obtenIdAtmsOnLine(){

        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, 
				stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let idAtms:any[]        = [];
        let infodatosGroups:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
        let fchSys:any          = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

        infodatosGroups 			= this.obtenDetalleGroups(parametros);

        if(infodatosGroups.length > 0) {
            infodatosGroups.forEach((reg) => {
                fchOper = new Date(reg.LastIOnlineTimestamp).toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

                if (fchOper == fchSys) {
                    idAtms.push({'Description': reg.Description, 'Name': reg.Name, 'Id': reg.Id, 'Ip': reg.Ip});
                }
            });
        }
        return(idAtms);
    }

	public obtenIdAtmsOnLinePorGpo(paramsConsulta?:any){
		//console.log(paramsConsulta);
		
        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, 
				osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let idAtms:any[]        = [];
        let infodatosGroups:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
		let fchParam:any        = paramsConsulta.timeStampEnd.substring(0,10);
        let fchSys:any          = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');
        let arrDevicesOffline   = [];
		parametros.groupId 		= (paramsConsulta.idGpo != undefined && paramsConsulta.idGpo != null) ? paramsConsulta.idGpo : -1;
		
        infodatosGroups = this.obtenDetalleGroups(parametros);

        if(infodatosGroups.length > 0) {
			if (fchParam == fchSys.toString()) {
				infodatosGroups.forEach((reg) => {
                    if ( reg.OfflineDevices.length > 0 ){
                        for(let cve in reg.OfflineDevices) {
                            arrDevicesOffline.push(gDevicesAtm[reg.OfflineDevices[cve]]);
                        }
                    }
                    idAtms.push({
                        'Description': reg.Description,
                        'Name': reg.Name,
                        'Id': reg.Id,
                        'Ip': reg.Ip,
                        'DevicesOffline': arrDevicesOffline
                    });
                });
			} else {
				infodatosGroups.forEach((reg) => {
					fchOper = new Date(reg.LastIOnlineTimestamp).toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

					if (fchOper == fchSys) {
						idAtms.push({
							'Description': reg.Description, 
							'Name': reg.Name, 
							'Id': reg.Id, 
							'Ip': reg.Ip
						});
					}
				});
			}

        }
        return(idAtms);
    }


}

function comparar ( a, b ){ return a - b; }