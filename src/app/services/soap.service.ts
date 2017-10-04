import { Injectable } from '@angular/core';


import { SOAPClient } from './soapclient.js';
import { SOAPClientParameters } from './soapclient.js';


@Injectable()
export class SoapService {
    
    public soapParams:any;


    public soapClient:any;

  constructor() {}

   post(url, action, params, fncCallBack){
    this.soapParams = new SOAPClientParameters;
    this.soapClient = SOAPClient;
     return new Promise((resolve, reject) => {
			//Create SOAPClientParameters
			for(var param in params){
				this.soapParams.add(param, params[param]);
			}
			//Create Callback
            var soapCallback = function (e, status) {
                if (e == null || e.constructor.toString().indexOf("function Error()") != -1) {
                    reject("Unable to contat the server: " + status);
                } else {
                    resolve(e);
                }
            }
            
            if(fncCallBack != undefined && fncCallBack != ""){
                soapCallback = fncCallBack;
            }

            this.soapClient.invoke(url, action, this.soapParams, false, soapCallback);
        });
    }
    setCredentials(username, password){
        this.soapClient.username = username;
		this.soapClient.password = password;
    }
}
