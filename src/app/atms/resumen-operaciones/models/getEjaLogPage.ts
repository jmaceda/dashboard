
//mport { Injectable } from '@angular/core';
import {sprintf} from "sprintf-js";

var fechaSys = new Date();
var fechaHoy = sprintf("%4d-%02d-%02d",fechaSys.getFullYear(), (fechaSys.getMonth() + 1), fechaSys.getDate());

var paramsServicioDatosLog: {
  ip:string,
  timeStampStart:string,
  timeStampEnd:string,
  events:string,
  minAmount:string,
  maxAmount:string,
  authId:string,
  cardNumber:string,
  accountId:string,
  page:number
};


//@Injectable()
export class GetEjaLogPage {
    
  	public paramsServicioDatosLogT: {
  		ip:string,
  		timeStampStart:string,
  		timeStampEnd:string,
  		events:string,
  		minAmount:string,
  		maxAmount:string,
  		authId:string,
  		cardNumber:string,
  		accountId:string,
  		page:number
  	};

    public ip: string;
    public timeStampStart: string;
    public timeStampEnd: string;
    public events: string;
    public minAmount: string;
    public maxAmount: string;
    public authId: string;
    public cardNumber: string;
    public accountId: string;
    public page: number;


    getIp() {return(this.ip)}       
    getTimeStampStart() {return(this.timeStampStart)}
    getTimeStampEnd() {return(this.timeStampEnd)}
    getEvents() {return(this.events)}
    getMinAmount() {return(this.minAmount)}
    getMaxAmount() {return(this.maxAmount)}
    getAuthId() {return(this.authId)}
    getCardNumber() {return(this.cardNumber)}
    getAccountId() {return(this.accountId)}
    getPage() {return(this.accountId)}

    setIp(ip:string) {this.ip = ip}       
    setTimeStampStart(timeStampStart:string) {this.timeStampStart = timeStampStart}
    setTimeStampEnd(timeStampEnd:string) {this.timeStampEnd = timeStampEnd}
    setEvents(events:string) {this.events = events}
    setMinAmount(minAmount:string) {this.minAmount = minAmount}
    setMaxAmount(maxAmount:string) {this.maxAmount = maxAmount}
    setAuthId(authId:string) {this.authId = authId}
    setCardNumber(cardNumber:string) {this.cardNumber = cardNumber}
    setAccountId(accountId:string) {this.accountId = accountId}
    setPage(page:number) {return(this.page = page)}

    constructor(public infoLogPage: any) {

      //console.log(JSON.stringify(infoLogPage));

      //var fchHoy = 


      /*
      this.timeStampStart  = infoLogPage.timeStampStart;
      this.timeStampEnd    = infoLogPage.timeStampEnd;
      this.events          = infoLogPage.events;
      this.minAmount       = infoLogPage.minAmount;
      this.maxAmount       = infoLogPage.maxAmount;
      this.authId          = infoLogPage.authId;
      this.cardNumber      = infoLogPage.cardNumber;
      this.accountId       = infoLogPage.accountId;
      */
      //this.setIp(infoLogPage.ip = '-1');  
      //this.ip              = infoLogPage.ip;
      this.setIp(infoLogPage.ip);          
      this.setTimeStampStart(infoLogPage.timeStampStart = fechaHoy);
      this.setTimeStampEnd(infoLogPage.timeStampEnd = fechaHoy);  
      this.setEvents(infoLogPage.events = '-1');        
      this.setMinAmount(infoLogPage.minAmount = '-1');     
      this.setMaxAmount(infoLogPage.maxAmount = '-1');     
      this.setAuthId(infoLogPage.authId = '-1');        
      this.setCardNumber(infoLogPage.cardNumber = '-1');      
      this.setAccountId(infoLogPage.accountId = '-1');
      this.setAccountId(infoLogPage.page);
    }

}