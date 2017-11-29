import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';


import { SOAPClient } from './soapclient.js';
import { SOAPClientParameters } from './soapclient.js';


@Injectable()
export class SoapService {
    
    public soapParams:any;
    public soapClient:any;
    public url:string = "";

    constructor() {
        console.log("SoapService.constructor:: ["+window.location.origin+"]  ["+window.location.port+"]");

        if (window.location.port == '8687'){
            this.url = '/services/dataservices.asmx'; // Prod
        }else{
            this.url = '/dataservices.asmx'; //  QA
        }
    }


   post(url, action, params, fncCallBack){

        console.log("SoapService.post:: url["+url+"]   this.url["+this.url+"]");
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

                this.soapClient.invoke(this.url, action, this.soapParams, false, soapCallback);
            });
    }
    setCredentials(username, password){
        this.soapClient.username = username;
		this.soapClient.password = password;
    }
}
