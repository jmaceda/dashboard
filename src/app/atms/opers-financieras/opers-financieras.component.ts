// app/atms/detalle-atms.component.ts
import { Component, OnInit, OnDestroy }                                    from '@angular/core';
import { DataTable, DataTableTranslations, DataTableResource }  from 'angular-4-data-table-fix';
import { sprintf }                                              from "sprintf-js";
import { SoapService }                                          from '../../services/soap.service';
import { FiltrosUtilsService }                                  from '../../services/filtros-utils.service';
import { InfoAtmsService }                                      from '../../services/info-atms.service';
import { DatosJournalService }                                  from '../../services/datos-journal.service';
import { FiltrosConsultasComponent }                            from '../../shared/filtros-consultas/filtros-consultas.component';
import { UtilsService }                                         from '../../services/utils.service';


var arrDatosAtms:any[] = [];

export const nomComponente:string = "OpersFinancierasComponent";
export var gGetGroupsAtmIds:any;

export class GetGroupsAtmIds{
    Id: string;
    Description: string;
    Description2: string;
    Description3: string;

    constructor(Id: string, Description: string, Description2: string, Description3: string){
        this.Id = Id;
        this.Description = Description;
        this.Description2 = Description2;
        this.Description3 = Description3;
    }
}

@Component({
    selector: 'opers-financieras',
    templateUrl: './opers-financieras.component.html',
    styleUrls: ['./opers-financieras.component.css'],
    providers: [SoapService, InfoAtmsService, DatosJournalService, UtilsService]
})
export class OpersFinancierasComponent implements OnInit, OnDestroy {

    // Filtros
    public dListaAtmGpos:any            = [];
    public dTipoListaParams:string      = "G";
    public dSolicitaFechasIni           = true;
    public dSolicitaFechasFin           = false;
    public dUltimaActualizacion:string;

    public itemResource                 = new DataTableResource([]);
    public items                        = [];
    public itemCount                    = 0;

    public regsLimite:number            = 13;
    public intervalId                   = null;
    public tiempoRefreshDatos:number    = (1000 * 60 * 1); // Actualiza la información cada minuto.
    //public xtIsOnline:string            = "";
    public Titulo:string                = "";
    public opersFinancieras:any[]       = [];
    private isDatosJournal:boolean      = false;

    constructor(public _soapService: SoapService,
                public filtrosUtilsService: FiltrosUtilsService,
                public infoAtmsService: InfoAtmsService,
                public datosJournalService: DatosJournalService,
                public utilsService: UtilsService) {
    }

    public ngOnInit() { }

    public ngOnDestroy() {
        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }
    }

    public parametrosConsulta(filtrosConsulta) {
        let idGpo 					= filtrosConsulta.gpo;
        let fIniParam               = filtrosConsulta.fchInicio;
        let fFinParam               = filtrosConsulta.fchInicio;
        let ipAtm                   = filtrosConsulta.gpo;
        let timeStampStart:string   = sprintf("%04d-%02d-%02d-%02d-%02d", fIniParam.year, fIniParam.month, fIniParam.day,
            fIniParam.hour, fIniParam.min);
        let timeStampEnd:string     = sprintf("%04d-%02d-%02d-23-59", fIniParam.year, fIniParam.month, fIniParam.day);
        let paramsConsulta:any      = {
				'timeStampStart': timeStampStart, 
				'timeStampEnd': timeStampEnd, 
				'idGpo': idGpo
		};

        this.pDatosDelJournal(paramsConsulta);

    }

    public pDatosDelJournal(paramsConsulta){

        if (this.intervalId != null){
            clearInterval(this.intervalId);
        }

        let ftoFchSys:any = {year: 'numeric', month: '2-digit', day: '2-digit'};
        let expFchSys:any = /(\d+)\/(\d+)\/(\d+)/
        let fchSys:any    = new Date().toLocaleString('en-us', ftoFchSys).replace(expFchSys, '$3$1$2');
        let fchParam:any  = (paramsConsulta.timeStampEnd.substring(0,10)).replace(/-/g,"");

        this.datosDeOperacion(paramsConsulta);

        if( fchSys == fchParam) {
            this.intervalId = setInterval(() => {
                this.datosDeOperacion(paramsConsulta);
            }, this.tiempoRefreshDatos);
        }
    }

    public datosDeOperacion(paramsConsulta){
        let datosAtm:any;
		let idAtms:any[]        	= this.infoAtmsService.obtenInfoAtmsOnLinePorGpo(paramsConsulta);
		let numRetirosTiendas		= 0;
		let numConsultasTiendas		= 0;		
		let comisTotalTiendas   	= 0;
		let comisRetirosTiendas 	= 0;
		let comisConsultasTiendas	= 0;
		let numRetirosPlazas   		= 0;
		let numConsultasPlazas 		= 0;		
		let comisTotalPlazas   		= 0;
		let comisRetirosPlazas 		= 0;
		let comisConsultasPlazas 	= 0;
		let expRegText              = "^CI[0-9]{2}XX[0-9]{4}[0-9A-Za-z]*$";
		let regexTienda:any     	= new RegExp( expRegText.replace(/XX/g, "GT") );
		let regexPlaza:any      	= new RegExp( expRegText.replace(/XX/g, "GP") );

		this.opersFinancieras   	= [];

        if(idAtms != null){
            idAtms.forEach( (reg) => {
                datosAtm = this.datosJournalService.obtenComisionesPorAtm(paramsConsulta, {
							'Description': reg.Description,
							'descAtm': reg.Name, 
							'Ip': reg.Ip
				});

                if ( (datosAtm.numConsultas + datosAtm.numRetiros + datosAtm.numDepositos) > 0) {
                    this.opersFinancieras.push(datosAtm);

					if ( regexTienda.test(datosAtm.idAtm) ){
						numRetirosTiendas       += datosAtm.numRetiros;
						comisRetirosTiendas 	+= datosAtm.comisionesRetiros;
						numConsultasTiendas     += datosAtm.numConsultas;
						comisConsultasTiendas 	+= datosAtm.comisionesConsultas;
						comisTotalTiendas 		+= datosAtm.totalComisiones;
					} else if( regexPlaza.test(datosAtm.idAtm) ){
						numRetirosPlazas        += datosAtm.numRetiros;
						comisRetirosPlazas 		+= datosAtm.comisionesRetiros;
						numConsultasPlazas      += datosAtm.numConsultas;
						comisConsultasPlazas 	+= datosAtm.comisionesConsultas;
						comisTotalPlazas 		+= datosAtm.totalComisiones;						
					}
                }
            });

        }

        this.opersFinancieras.sort(this.utilsService.sort_by('Description', false));
		
		if (comisTotalTiendas > 0 || comisTotalPlazas > 0){
			this.opersFinancieras.push({
				'Description': 'Comisiones Tiendas',
				'numRetiros': numRetirosTiendas,
				'comisionesRetiros': comisRetirosTiendas,
				'numConsultas': numConsultasTiendas,
				'comisionesConsultas': comisConsultasTiendas,
				'totalComisiones': comisTotalTiendas
			});
			this.opersFinancieras.push({
				'Description': 'Comisiones Plazas', 
				'numRetiros': numRetirosPlazas,
				'comisionesRetiros': comisRetirosPlazas,
				'numConsultas': numConsultasPlazas,				
				'comisionesConsultas': comisConsultasPlazas, 
				'totalComisiones': comisTotalPlazas
			});
		}


        if ($('#btnExpExel2').length == 0) {
            $('div.button-panel[_ngcontent-c6]').append('<input id="btnExpExel2" type=image src="assets/img/office_excel.png" width="40" height="35" (click)="exportaComisiones2Excel()">');
        }

        if (this.opersFinancieras.length > 0) {
            $('#btnExpExel2').css('cursor', 'pointer');
            this.isDatosJournal = false;
        }else{
            $('#btnExpExel2').css('cursor', 'not-allowed');
            this.isDatosJournal = true;
        }

        this.itemResource = new DataTableResource(this.opersFinancieras);
        this.itemResource.count().then(count => this.itemCount = count);
        this.reloadItems({limit: this.regsLimite, offset: 0});
        this.filtrosUtilsService.fchaHraUltimaActualizacion();
        this.opersFinancieras = [];
    }

    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }

    rowClick(rowEvent) {}

    rowDoubleClick(rowEvent) {}

    rowTooltip(item) {}

    private exportaComisiones2Excel(event){}

	getColor(Description){
		let styles:any = {};

		if (Description == "Comisiones Tiendas" || Description == "Comisiones Plazas"){
			styles = {'font-weight': 'bold', 'color': 'blue'};
		}
		return styles;
	}

}
