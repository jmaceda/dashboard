// app/reportes/totales-por-tienda/totales-por-tienda.component.ts
import { Component }                                    from '@angular/core';
import { OnInit }                                       from '@angular/core';
import { SoapService }                                  from '../../services/soap.service';
import { FiltrosUtilsService }                          from '../../services/filtros-utils.service';
import { sprintf }                                      from "sprintf-js";
import { DataTableResource }                            from 'angular-4-data-table-fix';

export var gGetGroupsWithAtms:any;
export var gGetGroupsAtmsIps:any;
export var gGetAtmDetail:any;
export var gDatosGpoActual:any;
export var gGrupos:any;
export var gDatosTotalPorTienda:any;


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
    selector   : 'detalle-tienda',
    templateUrl: './detalle-por-tienda.component.html',
    styleUrls  : ['./detalle-por-tienda.component.css'],
    styles     : [`
        .even { color: red; }
        .odd { color: green; }
    `],
    providers: [SoapService]
})
export class DetallePorTienda implements OnInit  {

    // Parametros para la pantalla de filtros para la consulta
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "A";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = true;
    public dUltimaActualizacion:string;


    public itemResource = new DataTableResource([]);
    public items = [];
    public itemCount = 0;

    public regsLimite:number = 15;


    parametrosConsulta(infoRecibida){
        let parametrossConsulta:any = {};

        let fIniParam = infoRecibida.fchInicio;
        let fFinParam = infoRecibida.fchFin;
        let idAtm     = infoRecibida.atm;

        let fchIniParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let d1 = new Date(Number(fIniParam.year), Number(fIniParam.month)-1, Number(fIniParam.day));
        let fchFinParam:string = sprintf("%04d-%02d-%02d-%02d-%02d", fFinParam.year, fFinParam.month, fFinParam.day,
            fFinParam.hour, fFinParam.min);
        let d2= new Date(Number(fFinParam.year), Number(fFinParam.month)-1, Number(fFinParam.day)+1);
        let datosParam:any = {fchIni: d1.getTime(), fchFin: d2.getTime(), idAtm: idAtm};

        this.obtenTotalesTienda(datosParam);
    }

    GetStoreTotals(datosTienda:any, status){
        gDatosTotalPorTienda = datosTienda;
    }

    GetCmByStore(datosTienda:any, status){
        gDatosTotalPorTienda = datosTienda;
    }

    obtenTotalesTienda(datosParam){

        let parametros:any = {startDate: datosParam.fchIni, endDate: datosParam.fchFin, store: 16228090}; //datosParam.idAtm};

        this._soapService.post('', 'GetCmByStore', parametros, this.GetCmByStore, false);

        let arrDatosAtms:any[] = [];
        let idx:number = 0;
        gDatosTotalPorTienda.forEach(( reg )=> {
            arrDatosAtms[idx++] = {
                Store:      reg.Store,
                Atm:        reg.Atm,
                TxType:     reg.TxType,
                Date:       reg.Date + "   " + reg.Time,
                Amount1000: reg.Amount1000,
                Amount500:  reg.Amount500,
                Amount200:  reg.Amount200,
                Amount100:  reg.Amount100,
                Amount50:   reg.Amount50,
                Amount20:   reg.Amount20,

                Dispensed1000: reg.Dispensed1000,
                Dispensed500:  reg.Dispensed500,
                Dispensed200:  reg.Dispensed200,
                Dispensed100:  reg.Dispensed100,
                Dispensed50:   reg.Dispensed50,
                Dispensed20:   reg.Dispensed20,

                Taken1000: reg.Taken1000,
                Taken500:  reg.Taken500,
                Taken200:  reg.Taken200,
                Taken100:  reg.Taken100,
                Taken50:   reg.Taken50,
                Taken20:   reg.Taken20,
            }
        });

        this.itemResource = new DataTableResource(arrDatosAtms);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems( {limit: this.regsLimite, offset: 0});
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
    }

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService){}

    gGetGroupsWithAtms: GetGroupsWithAtms[] = gGetGroupsWithAtms;

    ngOnInit() {}

    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {}

    rowDoubleClick(rowEvent) {}

    rowTooltip(item) { return item.jobTitle; }

}

function comparar ( a, b ){ return a - b; }