/* app/services/detalle-atms-service.ts */

import { Injectable }           from '@angular/core';
import { Inject }               from '@angular/core';
import { OnInit }               from '@angular/core';
import { SoapService }          from './soap.service';
import { InfoGroupsService }    from './info-groups.service';

//import { NotificationsComponent } from '../../notifications/notifications.component';

export var gDatosAtm:any;
export var gDatosAtms:any;
export var gGrupos;
export var gDevicesAtm:any[]  = [];
var nomServicio = "InfoAtmsService";

@Injectable()
export class InfoAtmsService implements OnInit {

    //public notificationsComponent: NotificationsComponent;

    // The constructor parameters.
    //static get parameters() {
    //    return [LocalStorage, SessionStorage];
    //}

    constructor(public _soapService: SoapService,
                public infoGroupsService: InfoGroupsService){

        //this.notificationsComponent = new NotificationsComponent();
    }

    public ngOnInit() {

    }

    public GetAtm(datosAtms:any, status){
        gDatosAtms = datosAtms;
    }

    public obtenDetalleAtms(parametros?:any) {

        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        this._soapService.post('', "GetAtm", parameters, this.GetAtm, false);

        return(gDatosAtms);
    };

    public obtenGetAtm(parametros?:any) {

        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        this._soapService.post('', "GetAtm", parameters, this.GetAtm, false);

        let idx = 0;
        let arrNomAtms:any[] = [];

        if (gDatosAtms.length > 0) {
            gDatosAtms.forEach((reg) => {
                arrNomAtms.push((reg.Description + ' (' + reg.Ip + ')'));
            });
        }

        return(arrNomAtms.sort(comparar));
    };


    public GetAtmDetail(datosAtm:any, status){
        gDatosAtm = datosAtm;
    }

    public obtenGetAtmDetail(parametros?:any) {

        let parameters:any = parametros;

        if (parametros != null || parametros != undefined) {
            this._soapService.post('', "GetAtmDetail", parameters, this.GetAtmDetail, false);
        }else{
            gDatosAtm = "*** No ha indicado el ID del Cajero a consultar ***";
        }

        return(gDatosAtm);

    };

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

        let parameters:any = parametros;

        if (parametros == null || parametros == undefined) {
            parameters = { nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1}
        }

        this._soapService.post('', "GetAtmsIps", parameters, this.GetAtmsIps, false);

        return(gDatosAtms);
    };

    public obtenInfoAtmsOnLine(){

        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, osId: -1, 
				stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let infoAtms:any[]      = [];
        let infoDatosAtms:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
        let fchSys:any          = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

        infoDatosAtms 			= this.obtenDetalleAtms(parametros);

        if(infoDatosAtms.length > 0) {
            infoDatosAtms.forEach((reg) => {
                fchOper = new Date(reg.LastIOnlineTimestamp).toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');

                if (fchOper == fchSys) {
                    infoAtms.push({'Description': reg.Description, 'Name': reg.Name, 'Id': reg.Id, 'Ip': reg.Ip});
                }
            });
        }
        return(infoAtms);
    }

	public obtenInfoAtmsOnLinePorGpo(paramsConsulta?:any){

        let parametros          = { 
				nemonico: -1, groupId: -1, brandId: -1, modelId: -1, 
				osId: -1, stateId: -1, townId: -1, areaId: -1, zipCode: -1
		};
        let fchOper:any;
        let infoAtms:any[]      = [];
        let infoDatosAtms:any   = [];
        let ftoFchSys:any       = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any       = /(\d+)\/(\d+)\/(\d+)/;
		let fchParam:any        = paramsConsulta.timeStampEnd.substring(0,10);
        let fchSys:any          = (new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2')).toString();
        let arrDevicesOffline   = [];
        let arrFechasUltimaAct  = [];
        let arrGroupsAtm        = [];

		parametros.groupId 		= (paramsConsulta.idGpo != undefined && paramsConsulta.idGpo != null) ? paramsConsulta.idGpo : -1;
        
        console.log("Obtiene datos de los cajeros");
        console.log(JSON.stringify(parametros));
        infoDatosAtms           = this.obtenDetalleAtms(parametros);
        
        //console.log(JSON.stringify(infoDatosAtms));

		console.log("Filtra datos de los cajeros");
        if(infoDatosAtms.length > 0) {
            /* Información de ATMs de la fecha indicada como parametro */
			console.log("fchParam["+fchParam+"]   fchSys["+fchSys+"]");
			if (fchParam == fchSys) {
				infoDatosAtms.forEach((reg) => {
                    arrFechasUltimaAct   = [];
                    arrGroupsAtm        = [];
                    if ( reg.OfflineDevices.length > 0 ){
                        for(let cve in reg.OfflineDevices) {
                            arrDevicesOffline.push(gDevicesAtm[reg.OfflineDevices[cve]]);
                        }
                    }

                    arrFechasUltimaAct.push({'desc': 'ATM',          'fcha': reg.LastIOnlineTimestamp});
                    arrFechasUltimaAct.push({'desc': 'Caseteros',    'fcha': reg.CassettesStatusTimestamp});
                    arrFechasUltimaAct.push({'desc': 'Bóveda',       'fcha': reg.SafeOpenTs});
                    arrFechasUltimaAct.push({'desc': 'Gabinete',     'fcha': reg.CabinetOpenTs});

                    arrGroupsAtm.push( this.infoGroupsService.obtenGroupsAtm(reg.Id));

                    infoAtms.push({
                        'Description': reg.Description,
                        'Name': reg.Name,
                        'Id': reg.Id,
                        'Ip': reg.Ip,
                        'DevicesOffline': arrDevicesOffline,
                        'FechasUltimaAct': arrFechasUltimaAct,
                        'Grupos': arrGroupsAtm
                    });
                });
			} else {
				infoDatosAtms.forEach((reg) => {
					fchOper = new Date(reg.LastIOnlineTimestamp).toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3-$1-$2');
					//if (fchOper == fchSys) 
					{
                        infoAtms.push({
							'Description': reg.Description, 
							'Name': reg.Name, 
							'Id': reg.Id, 
							'Ip': reg.Ip
						});
					}
				});
			}
            //console.log(JSON.stringify(infoAtms));
        }
		console.log("Devuelve datos de los cajeros");
        return(infoAtms);
    }
}

function comparar ( a, b ){ return a - b; }