/* app/services/detalle-atms-service.ts */

import { Injectable }               from '@angular/core';
import { OnInit }                   from '@angular/core';
import { SoapService }              from './soap.service';
import { GroupsModel }              from '../models/groups.model';
import { GroupsAtmsModel }          from '../models/groups-atms.model';

//export var gDatosAtm:any;
export var gDatosGroups:any = [];
export var gGrupos;
export var gDevicesAtm:any[]  = [];
export var gGroupsWithAtms:any[] = [];
export var gGroupsAtmIds:any[] = [];

var nomServicio = "InfoGroupsService";

@Injectable()
export class InfoGroupsService implements OnInit {

    public groupsWithAtmsModel: GroupsModel[]  = [];
    public groupsModel: GroupsModel[]          = [];
    public groupsAtmsModel: GroupsAtmsModel[]  = [];

    constructor(public _soapService: SoapService){}

    public ngOnInit() {}

    public GetGroup(datosGroups:any, status){
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
        gGrupos = datosGroups;
    }

    public obtenGroupsConAtms(){

        this.groupsWithAtmsModel = [];
        this._soapService.post('', "GetGroupsWithAtms", '', this.GetGroupsWithAtms, false);

        if (gGrupos.length > 0){
            gGrupos.forEach( reg => {
                this.groupsWithAtmsModel.push(reg);
            });
        }

        return(gGrupos);
    };


    public GetGroupsAtmIds(datosIdAtms:any, status){
        gGroupsAtmIds = datosIdAtms;
    }

    public obtenGroupsAtms(idGroup, descGpo){

        let parameters:any  = {groups: idGroup};
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

        this.groupsAtmsModel    = [];

        if (this.groupsWithAtmsModel.length > 0){
            this.groupsWithAtmsModel.forEach( reg => {
                this.obtenGroupsAtms(reg.Id, reg.Description);
            });
        }
    }

    public obtenGroupsAtm(idAtm){

        let arrGroupsAtm        = [];

        this.groupsAtmsModel.forEach( reg => {
            if (idAtm == reg.IdAtm){
                arrGroupsAtm.push(reg);
            }
        });

        return(arrGroupsAtm);
    }


    public cargaCataAtmsConGrupos(){

        this.obtenGroupsConAtms();

        // Cargar grupos con ATMs asociados
        if (this.groupsWithAtmsModel.length > 0){
            this.groupsWithAtmsModel.forEach( reg => {
                this.obtenGroupsAtms(reg.Id, reg.Description);
            });
        }
    }

    public obtenDescGroupsConAtms(){

        let descGruposConAtms:any = [];

        this.groupsWithAtmsModel = [];

        this._soapService.post('', "GetGroupsWithAtms", '', this.GetGroupsWithAtms, false);

        if (gGrupos.length > 0){
            gGrupos.forEach( reg => {
                descGruposConAtms.push(reg.Description);
            });
        }

        return(descGruposConAtms);
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
}

function comparar ( a, b ){ return a - b; }