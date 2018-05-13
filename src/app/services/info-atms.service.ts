/* app/services/detalle-atms-service.ts */

import { Injectable }           from '@angular/core';
import { OnInit }               from '@angular/core';
import { SoapService }          from './soap.service';
import { InfoGroupsService }    from './info-groups.service';

export var gDatosAtm:any;
export var gDatosAtms:any;
export var gGrupos;
export var gDevicesAtm:any[]  = [];
var nomServicio = "InfoAtmsService";

@Injectable()
export class InfoAtmsService implements OnInit {

    constructor(public _soapService: SoapService,
                public infoGroupsService: InfoGroupsService){//},
                //public logHmaService: LogHmaService){
        console.log(nomServicio+".constructor:: init");
    }

    public ngOnInit() {
        //gDevicesAtm  = this.logHmaService.GetHmaDevices();
    }

    public GetAtm(datosAtms:any, status){
        gDatosAtms = datosAtms;
    }


    public obtenDetalleAtms(parametros?:any) {

        console.log(nomServicio+".obtenDetalleAtms:: Obten datos de todos los ATMs (GetAtm)");

        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm, false);

        return(gDatosAtms);
    };

    public obtenGetAtm(parametros?:any) {

        console.log(nomServicio+".obtenGetAtm:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs
        this._soapService.post('', "GetAtm", parameters, this.GetAtm, false);

        let idx = 0;
        let arrNomAtms:any[] = [];

        gDatosAtms.forEach((reg)=> {
            arrNomAtms.push( (reg.Description + ' (' + reg.Ip + ')') );
        });

        return(arrNomAtms.sort(comparar));

    };


    public GetAtmDetail(datosAtm:any, status){
        gDatosAtm = datosAtm;
    }

    public obtenGetAtmDetail(parametros?:any) {

        console.log(nomServicio+".obtenGetAtm:: Se van a obtener los datos");
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

    obtenGetGroups(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms, false);

        let arrNomGrupos:any[] = [];

        gGrupos.forEach((reg)=> {
            arrNomGrupos.push( (reg.Description));
        });
        //console.log("InfoAtmsService.obtenGetGroups:: ["+arrNomGrupos+"]");
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


    GetAtmsIps(datosAtms:any, status){
        gDatosAtms = datosAtms;
    }

    public obtenGetAtmsIps(parametros?:any) {

        console.log(nomServicio+".obtenGetAtmsIps:: Se van a obtener los datos");
        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        // Obtiene los datos de los ATMs por Id
        this._soapService.post('', "GetAtmsIps", parameters, this.GetAtmsIps, false);

        return(gDatosAtms);
    };

    public obtenIdAtmsOnLine(){

        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, 
				stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let idAtms:any[]        = [];
        let infoDatosAtms:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
        let fchSys:any          = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

        infoDatosAtms 			= this.obtenDetalleAtms(parametros);

        if(infoDatosAtms.length > 0) {
            infoDatosAtms.forEach((reg) => {
                fchOper = new Date(reg.LastIOnlineTimestamp).toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

                if (fchOper == fchSys) {
                    idAtms.push({'Description': reg.Description, 'Name': reg.Name, 'Id': reg.Id, 'Ip': reg.Ip});
                }
            });
        }
        return(idAtms);
    }

	public obtenIdAtmsOnLinePorGpo(paramsConsulta?:any){

        console.log(nomServicio+".obtenIdAtmsOnLinePorGpo:: Obten datos de ATMs Online por Grupo");
		
        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, 
				osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let idAtms:any[]        = [];
        let infoDatosAtms:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
		let fchParam:any        = paramsConsulta.timeStampEnd.substring(0,10);
        let fchSys:any          = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');
        let arrDevicesOffline   = [];
        let arrFchasUltimaAct   = [];
        let arrGroupsAtm        = [];
		parametros.groupId 		= (paramsConsulta.idGpo != undefined && paramsConsulta.idGpo != null) ? paramsConsulta.idGpo : -1;
		
        infoDatosAtms = this.obtenDetalleAtms(parametros);

        if(infoDatosAtms.length > 0) {
			if (fchParam == fchSys.toString()) {
				infoDatosAtms.forEach((reg) => {
                    arrFchasUltimaAct   = [];
                    arrGroupsAtm        = [];
                    if ( reg.OfflineDevices.length > 0 ){
                        for(let cve in reg.OfflineDevices) {
                            arrDevicesOffline.push(gDevicesAtm[reg.OfflineDevices[cve]]);
                        }
                    }

                    arrFchasUltimaAct.push({'desc': 'ATM',          'fcha': reg.LastIOnlineTimestamp});
                    arrFchasUltimaAct.push({'desc': 'Cassettes',    'fcha': reg.CassettesStatusTimestamp});
                    arrFchasUltimaAct.push({'desc': 'Bóveda',       'fcha': reg.SafeOpenTs});
                    arrFchasUltimaAct.push({'desc': 'Gabinete',     'fcha': reg.CabinetOpenTs});

                    arrGroupsAtm.push( this.infoGroupsService.obtenGroupsAtm(reg.Id));

                    idAtms.push({
                        'Description': reg.Description,
                        'Name': reg.Name,
                        'Id': reg.Id,
                        'Ip': reg.Ip,
                        'DevicesOffline': arrDevicesOffline,
                        'FchasUltimaAct': arrFchasUltimaAct,
                        'Grupos': arrGroupsAtm
                    });
                });
			} else {
				infoDatosAtms.forEach((reg) => {
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
        //console.log(nomServicio+".obtenIdAtmsOnLinePorGpo:: idAtms<"+JSON.stringify(idAtms)+">");
        return(idAtms);
    }


}

function comparar ( a, b ){ return a - b; }