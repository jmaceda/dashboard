// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { OnDestroy }                                    from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { sprintf }                                      from "sprintf-js";
import { DataTable }                                    from 'angular-4-data-table-fix';
import { DataTableTranslations }                        from 'angular-4-data-table-fix';
import { DataTableResource }                            from 'angular-4-data-table-fix';
import { Angular2Csv }                                  from 'angular2-csv/Angular2-csv';
import { EventEmitter}      from '@angular/core';



export var gGetGroupsWithAtms:any;
export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;


export class GetAtmDetail{
    Id: string;
    Description: string;
    Ip: string;
    Name: string;
    groupId: number;

    constructor(Id: string, Description: string, Ip: string, Name: string, groupId: number){
        this.Id = Id;
        this.Description = Description;
        this.Ip = Ip;
        this.Name = Name;
        this.groupId = groupId;
    }
}

export class GetGroupsAtmsIps{
    IdAtms: string;

    constructor(IdAtms: string){
        this.IdAtms = IdAtms;
    }
}

export class GetGroupsWithAtms{
    Id: string;
    Description: string;
    Description2: string;

    constructor(Id: string, Description: string, Description2: string){
        this.Id = Id;
        this.Description = Description;
        this.Description2 = Description2;
    }
}



@Component({
    selector   : 'total_tienda',
    templateUrl: './totales-por-tienda.component.html',
    styleUrls  : ['./totales-por-tienda.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class TotalesPorTiendaComponent implements OnInit  {

    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

    public dListaAtmGpos:any = [];
    public dTipoListaParams:string = "G";


    parametrosConsulta(infoRecibida){
        console.log("Se va mostrar la información enviada desde el componente Params");
        console.log("Params recibidos: ["+JSON.stringify(infoRecibida)+"]");
        console.log("Se mostro la información enviada desde el componente Params");
        let parametrossConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let ipParam   = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        console.log(fchIniParam);
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);

        console.log(fchFinParam);

        let datosParam:any = {fchIni: fchIniParam, fchFin: fchFinParam, ip: ipParam};

        //this.obtenGetGroupsWithAtms();
        this.obtenTotalesTienda();
    }

    GetStoreTotals(datosTienda:any, status){
        console.log(datosTienda);
    }

    obtenTotalesTienda(){
        let parametros:any = {startDate: 1507784400000, endDate: 1507870800000, store: 16228090};
        this._soapService.post('', 'GetStoreTotals', parametros, this.GetStoreTotals);
    }

    constructor(public _soapService: SoapService){

    }

    gGetGroupsWithAtms: GetGroupsWithAtms[] = gGetGroupsWithAtms;

    ngOnInit() {
        this.obtenGetGroupsWithAtms();
        this.dListaAtmGpos = gGrupos;

    }

    reloadItems(params) {
        console.log("reloadItems::  parms: "+JSON.stringify(params));

        this.itemResource.query(params).then(items => this.items = items);

    }

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }




    GetAtmDetail(datosAtm:any, status){
        //console.log("TotalesPorTiendaComponent.GetAtmDetail:: ATMs["+JSON.stringify(datosAtm)+"]");

        gGetAtmDetail.push({
            Id: datosAtm.Id,
            Description: datosAtm.Description,
            Ip: datosAtm.Ip,
            Name: datosAtm.Description,
            groupId: gDatosGpoActual.Id,
            groupDesc: gDatosGpoActual.Descripcion
        });
    }

    obtenDatosATM(idAtm){

        let parametros:any = {atmId: idAtm};
        this._soapService.post('', 'GetAtmDetail', parametros, this.GetAtmDetail);
    }

    GetGroupsAtmsIps(listaAtms:any, status){
        //console.log("TotalesPorTiendaComponent.GetGroupsAtmIds:: ATMs["+JSON.stringify(listaAtms)+"]");

        gGetGroupsAtmsIps = listaAtms;

    }

    obtenGetGroupsAtmsIps(idGpo){

        //console.log("Grupo: "+idGpo);
        gGetGroupsAtmsIps = "";

        let parametros:any = {groups: idGpo};
        this._soapService.post('', 'GetGroupsAtmIds', parametros, this.GetGroupsAtmsIps);
        //console.log(gGetGroupsAtmsIps);
        gGetGroupsAtmsIps.split(",").forEach((reg)=> {
            //console.log(reg);
            if (reg != null && reg != ""){
                this.obtenDatosATM(reg);
            }
        })

    }

    GetGroupsWithAtms(datosGroups:any, status){

        gGetGroupsWithAtms = [];
        gGrupos = [];
        datosGroups.forEach((reg)=> {
            gGetGroupsWithAtms.push({
                Id: reg.Id,
                Description: reg.Description
            });
            gGrupos.push(reg.Description);
        })
    }

    obtenGetGroupsWithAtms(){

        this._soapService.post('', 'GetGroupsWithAtms', '', this.GetGroupsWithAtms);

        //console.log("TotalesPorTiendaComponent.obtenGetGroupsWithAtms:: ["+JSON.stringify(gGetGroupsWithAtms)+"]");
        gGetAtmDetail = [];
        gGetGroupsWithAtms.forEach((reg)=> {
            gDatosGpoActual = {Id: reg.Id, Descripcion: reg.Description};
            this.obtenGetGroupsAtmsIps(reg.Id);
        })
        //console.log(gGetAtmDetail);
    }
}

function comparar ( a, b ){ return a - b; }