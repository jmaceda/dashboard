import {Component} from "@angular/core";
import {OnInit} from "@angular/core";
//import {SoapService} from "autopulous-angular2-soap/soap.service";

import { SoapService }   from './services/soap.service';



var parameters:{} = null;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    providers: [SoapService]
})
export class UserAuthentication implements OnInit {
    private servicePort:string = '/services/dataservices.asmx';
    private servicePath:string = 'GetEjaLogDataLength';
    private targetNamespace:string = 'http://Pentomino.mx/';

    private responseJso:{} = null;
	
	public nomServicioPaginas: string   = 'GetEjaLogDataLength';
	public idPerisur: number = 3414803;
	public idStaLucia:number = 16228090;
	public idTienda:number   = null;
		
		
	public GetEjaLogDataLength(result:object, status){
		console.log("GetEjaLogDataLength:: Inicio");
	}
	

	
	public obtienePaginasJournal(){
		console.log("obtienePaginasJournal:: Inicio");
		parameters = { 
				ip: ['11.40.2.2'], timeStampStart: '2017-10-21-00-00', timeStampEnd: '2017-10-21-23-59',
				events: "-1", minAmount: "-1", maxAmoun: "-1", authId: "-1", cardNumber: "-1", accountId: "-1" 
		};
		this.servicePath = "GetEjaLogDataLength";
		
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetEjaLogDataLength);
		console.log("obtienePaginasJournal:: Se ejecuto la consulta");		
	}
	
	// Ip y Clave de ATMs
	public GetEjaFilters(result:any, status){
		
		console.log("GetEjaFilters:: Inicio");
		console.log(result)

		for(let idx=0; idx < result.length; idx++){
			for(let idx2=0; idx2 < result[idx].length; idx2++){
				console.log(result[idx][idx2]);
			}
		}	
	}
	
	public obtieneIpATMs(){
		console.log("obtenIpATMs:: Inicio");
		
		this.servicePath = "GetEjaFilters";
			
		this.soapService.post(this.servicePort, this.servicePath, '', this.GetEjaFilters);
		console.log("obtenIpATMs:: Se ejecuto la consulta");		
	}


	// Detalle por Tienda
	public GetCmByStore(result:any, status){
		
		console.log("GetCmByStore:: Inicio");
		console.log(result)

	}
	
	public obtieneDetallePorTienda(){
		console.log("obtieneDetallePorTienda:: Inicio");

		// Convierte Fecha normal a TimeStamp
		var fchInicio = parseInt((new Date('2017.10.22 00:00:00').getTime()).toFixed(0));
	    var fchFin    = parseInt((new Date('2017.10.23 00:00:00').getTime()).toFixed(0));

		
		// Convierte TimeStamp a Fecha normal.
		console.log(new Date(fchInicio));
		console.log(new Date(fchFin));
		
		
		parameters = {
			startDate: fchInicio, endDate: fchFin, store: this.idStaLucia
		}
		
		this.servicePath = "GetCmByStore";
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetCmByStore);
		console.log("obtieneDetallePorTienda:: Se ejecuto la consulta");		
	}
	
	
	
	// Acumulado por Depósito
	public GetDepositCumulative(result:any, status){
		
		console.log("GetDepositCumulative:: Inicio");
		console.log(result)
		for(let idx=0; idx < result.length; idx++){
			let reg = result[idx];
			console.log(reg.Atm + " - " + reg.Store + " - " + reg.Date + " - " + reg.Amount20 + " - " + reg.Amount50 + " - " + reg.Amount100 + " - " + reg.Amount200 + " - " + reg.Amount500 + " - " + reg.Total);    
		}
	}
	
	public obtieneAcumuladoPorDeposito(){
		console.log("obtieneAcumuladoPorDeposito:: Inicio");

		// Convierte Fecha normal a TimeStamp
		var fchInicio = parseInt((new Date('2017.10.20 00:00:00').getTime()).toFixed(0));
	    var fchFin    = parseInt((new Date('2017.10.21 00:00:00').getTime()).toFixed(0));

		
		// Convierte TimeStamp a Fecha normal.
		console.log(new Date(fchInicio));
		console.log(new Date(fchFin));
		
		// Id Tienda: 3414803 (Perisur)
		// Id Tienda: 16228090 (Sta Lucia)
		
		parameters = {
			startDate: fchInicio, endDate: fchFin, store: 3414803
		}
		
		this.servicePath = "GetDepositCumulative";
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetDepositCumulative);
		console.log("obtieneAcumuladoPorDeposito:: Se ejecuto la consulta");		
	}
	
	// Acumulado por Tienda
	public GetStoreCumulative(result:any, status){
		
		console.log("GetStoreCumulative:: Inicio");
		console.log(result)
	}
	
	public obtieneAcumuladoPorTienda(){
		console.log("obtieneAcumuladoPorTienda:: Inicio");

		// Convierte Fecha normal a TimeStamp
		var fchInicio = parseInt((new Date('2017.10.20 00:00:00').getTime()).toFixed(0));
	    var fchFin    = parseInt((new Date('2017.10.21 00:00:00').getTime()).toFixed(0));

		
		// Convierte TimeStamp a Fecha normal.
		console.log(new Date(fchInicio));
		console.log(new Date(fchFin));
		
		parameters = {
			startDate: fchInicio, endDate: fchFin, store: this.idPerisur
		}
		
		this.servicePath = "GetStoreCumulative";
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetStoreCumulative);
		console.log("obtieneAcumuladoPorTienda:: Se ejecuto la consulta");		
	}
	
	// Totales por Tienda
	public GetStoreTotals(result:any, status){
		
		console.log("GetStoreTotals:: Inicio");
		console.log(result)
	}
	
	public obtieneTotalesPorTienda(){
		console.log("obtieneTotalesPorTienda:: Inicio");

		// Convierte Fecha normal a TimeStamp
		var fchInicio = parseInt((new Date('2017.10.17 00:00:00').getTime()).toFixed(0));
	    var fchFin    = parseInt((new Date('2017.10.23 00:00:00').getTime()).toFixed(0));

		
		// Convierte TimeStamp a Fecha normal.
		console.log(new Date(fchInicio));
		console.log(new Date(fchFin));
		
		parameters = {
			startDate: fchInicio, endDate: fchFin, store: this.idPerisur
		}
		
		this.servicePath = "GetStoreTotals";
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetStoreTotals);
		console.log("obtieneTotalesPorTienda:: Se ejecuto la consulta");		
	}	
	
	// Totales por Tienda / Totales por Operación
	public GetCmByStoreTotales(result:any, status){
		
		console.log("GetStoreTotals:: Inicio");
		console.log(result)
	}
	
	public obtieneTotalesPorOperacion(){
		console.log("obtieneTotalesPorOperacion:: Inicio");

		// Convierte Fecha normal a TimeStamp
		var fchInicio = parseInt((new Date('2017.10.22 00:00:00').getTime()).toFixed(0));
	    var fchFin    = parseInt((new Date('2017.10.23 00:00:00').getTime()).toFixed(0));

		
		// Convierte TimeStamp a Fecha normal.
		console.log(new Date(fchInicio));
		console.log(new Date(fchFin));
		
		parameters = {
			startDate: fchInicio, endDate: fchFin, store: this.idStaLucia
		}
		
		this.servicePath = "GetCmByStore";
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetCmByStoreTotales);
		console.log("obtieneTotalesPorOperacion:: Se ejecuto la consulta");		
	}		

	
	// Catálogo de Grupos
	public GetGroup(result:any, status){
		
		console.log("GetGroup:: Inicio");
		console.log(result)
	}
	
	public catalogoDeGrupos(){
		console.log("catalogoDeGrupos:: Inicio");

		this.servicePath = "GetGroup";
			
		this.soapService.post(this.servicePort, this.servicePath, '', this.GetGroup);
		console.log("catalogoDeGrupos:: Se ejecuto la consulta");		
	}
	
	
	// Estatus de efectivo en ATM
	public GetAtmMoneyStat(result:any, status){
		
		console.log("GetAtmMoneyStat:: Inicio");
		console.log(result)
		this.obtieneTotalesPorOperacion();
	}
	
	public estatusDeEfectivoEnATM(){
		console.log("estatusDeEfectivoEnATM:: Inicio");

		this.servicePath = "GetAtmMoneyStat";
		parameters = {
			atmId: 16281584
		}
			
		this.soapService.post(this.servicePort, this.servicePath, parameters, this.GetAtmMoneyStat);
		console.log("estatusDeEfectivoEnATM:: Se ejecuto la consulta");		
	}
	
    constructor(public soapService: SoapService) {

		console.log("constructor:: Inicio");

    }
	
	public ngOnInit(){
		
		this.idTienda = this.idPerisur;
		
		//this.obtienePaginasJournal();
		//this.obtieneIpATMs();
		//this.obtieneDetallePorTienda();
	    //this.obtieneAcumuladoPorTienda();
		//this.obtieneAcumuladoPorDeposito();
		//this.obtieneTotalesPorTienda();
		//this.obtieneTotalesPorOperacion();
		//this.catalogoDeGrupos();
	    this.estatusDeEfectivoEnATM();
	}
	
    private username:string = '';
    private password:string = '';

    public login(username:string, password:string) {
        var method:string = 'Login';
        var parameters:{}[] = [];

        this.username = username;
        this.password = password;

        parameters['LoginRequest xmlns="urn:application:security:messages:1:0"'] = UserAuthentication.userLogin(username, password);

        //this.soapService.post(method, parameters);
    }

    private static userLogin(username, password):{}[] {
        var parameters:{}[] = [];

        parameters["UserName"] = username;
        parameters['Password'] = password;

        return parameters;
    }

    private envelopeBuilder(requestBody:string):string {
        return "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
               "<SOAP-ENV:Header>" +
               "<wsse:Security SOAP-ENV:mustUnderstand=\"1\" xmlns:wsse=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" soapenv =\"http://schemas.xmlsoap.org/soap/envelope/\">" +
               "<wsse:UsernameToken wsu:ld=\"UsernameToken-104\" xmlns:wsu=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\" >" +
                "<wsse:Username>" + this.username + "</wsse:Username>" +
                "<wsse:Password Type=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText\">" + this.password + "</wsse:Password>" +
                "</wsse:UsernameToken>" +
                "</wsse:Security>" +
                "</SOAP-ENV:Header>" +
                "<SOAP-ENV:Body>" +
                requestBody +
                "</SOAP-ENV:Body>" +
                "</SOAP-ENV:Envelope>";
    }
}
