/* app/services/detalle-atms-service.ts */

import { Injectable }               from '@angular/core';
import { OnInit }                   from '@angular/core';
import { SoapService }              from './soap.service';
import { GroupsModel }              from '../models/groups.model';
import { GroupsAtmsModel }          from '../models/groups-atms.model';

export var gDatosAtm:any;
export var gDatosGroups:any = [];
export var gGrupos;
export var gDevicesAtm:any[]  = [];
export var gGroupsWithAtms:any[] = [];
export var gGroupsAtmIds:any[] = [];


var nomServicio = "InfoGroupsService";

@Injectable()
export class InfoGroupsService implements OnInit {

    private groupsWithAtmsModel: GroupsModel[] = [];
    private groupsModel: GroupsModel[] = [];
    public groupsAtmsModel: GroupsAtmsModel[] = [];

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

    public obtenGroups(parametros?:any) {

        this._soapService.post('', "GetGroup", parametros, this.GetGroup, false);

        if (gDatosGroups.length > 0){
            gDatosGroups.forEach( reg => {
                this.groupsModel.push(reg);
            });
        }
        return(gDatosGroups);
    }

    public GetGroupsWithAtms(datosGroups:any, status){
        gGroupsWithAtms = datosGroups;
    }

    public obtenGroupsConAtms(){

        console.log(nomServicio+".obtenGroupsConAtms:: Obten grupos con ATMs asociados");
        //console.log(nomServicio+".obtenGroupsConAtms (1):: gGroupsWithAtms["+gGroupsWithAtms+"]");
        this.groupsWithAtmsModel = [];
        this._soapService.post('', "GetGroupsWithAtms", '', this.GetGroupsWithAtms, false);
        //console.log(nomServicio+".obtenGroupsConAtms (2):: gGroupsWithAtms["+gGroupsWithAtms+"]");
        if (gGroupsWithAtms.length > 0){

            gGroupsWithAtms.forEach( reg => {
                this.groupsWithAtmsModel.push(reg);
            });
        }
        return(gGroupsWithAtms);
    };


    public GetGroupsAtmIds(datosIdAtms:any, status){
        gGroupsAtmIds = datosIdAtms;
    }

    public obtenGroupsAtms(idGroup, descGpo){

        //console.log(nomServicio+".obtenGroupsAtms:: Se van a obtener los datos del grupo ["+idGroup+"]  ["+descGpo+"]");

        let parameters:any = {groups: idGroup};
        let idAtms:string[] = [];

        this._soapService.post('', "GetGroupsAtmIds", parameters, this.GetGroupsAtmIds, false);

        if (gGroupsAtmIds.length > 0){

            idAtms = gGroupsAtmIds.toString().split(",");

            for(let idx=0; idx < idAtms.length; idx++){
                if ( idAtms[idx] != "" && idAtms[idx] != null && idAtms[idx] != undefined ){
                    this.groupsAtmsModel.push({'IdAtm': parseInt(idAtms[idx]), 'IdGpo': idGroup, 'DescGpo': descGpo});
                }
            }
        }

        return(gGroupsWithAtms);
    };


    public cargaCatAtmGroups(){

        console.log(nomServicio+".cargaCatAtmGroups:: Carga el catalogo de Grupos por ATM");

        //let gruposConAtms:any   = this.obtenGroupsConAtms();
        this.groupsAtmsModel    = [];

        //console.log(nomServicio+".obtenGroupsAtm:: -->" + JSON.stringify(this.groupsWithAtmsModel) + "<--");

        if (this.groupsWithAtmsModel.length > 0){
            this.groupsWithAtmsModel.forEach( reg => {
                this.obtenGroupsAtms(reg.Id, reg.Description);
            });

            //console.log(nomServicio+".obtenGroupsAtm:: Fin-->" + JSON.stringify(this.groupsAtmsModel) + "<--");
        }


    }

    public obtenGroupsAtm(idAtm){

        console.log(nomServicio+".obtenGroupsAtm:: Obten del catalogo los grupos del ATM ["+idAtm+"]");

        let arrGroupsAtm        = [];

        this.groupsAtmsModel.forEach( reg => {
            if (idAtm == reg.IdAtm){
                arrGroupsAtm.push(reg);
            }
        });
        return(arrGroupsAtm);
    }


    public cargaCataAtmsConGrupos(){

        console.log(nomServicio+".cargaCataAtmsConGrupos:: Carga catalogo de ATMs con sus grupos asociados");

        // Cargar grupos con ATMs asociados
        this.obtenGroupsConAtms();

        // Cargar grupos con ATMs asociados
        if (this.groupsWithAtmsModel.length > 0){
            this.groupsWithAtmsModel.forEach( reg => {
                this.obtenGroupsAtms(reg.Id, reg.Description);
            });

    }

    }
    /*
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
*/

                /*
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
    */

/*
    GetAtmsIps(datosGroups:any, status){
        gDatosGroups = datosGroups;
    }
    */
/*
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
*/
    /*
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
*/


    /*
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
*/

}

function comparar ( a, b ){ return a - b; }