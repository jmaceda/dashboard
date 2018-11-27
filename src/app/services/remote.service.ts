import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { DataTableParams } from 'angular-4-data-table-fix';
import { SoapService }     from './soap.service';




const BASE_URL = 'http://localhost:3000';

function paramsToQueryString(params: DataTableParams) {
    let result = [];

    if (params.offset != null) {
        result.push(['_start', params.offset]);
    }
    if (params.limit != null) {
        result.push(['_limit', params.limit]);
    }
    if (params.sortBy != null) {
        result.push(['_sort', params.sortBy]);
    }
    if (params.sortAsc != null) {
        result.push(['_order', params.sortAsc ? 'ASC' : 'DESC']);
    }

    return result.map(param => param.join('=')).join('&');
}


@Injectable()
export class RemoteService {

    constructor (private http: Http, public _soapService: SoapService) {}

    numPag=0;


    nuevaPagina(numPag){
        this.numPag = numPag;
    }

    obtenDatosJournal(result:any[], status){
            return({
                items: result,
                count: result.length
            })
    }

    consulta(nomServicioDatosLog, paramsServicioDatosLog, numPag){
        paramsServicioDatosLog.page = numPag;

        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this._soapService.post('', nomServicioDatosLog, paramsServicioDatosLog, '', false)
            .then((resp: Response) => ({
                items: resp.json(),
                count: Number(resp.headers.get('X-Total-Count'))
            }))
            .catch(this.handleErrorPromise);
    }

    query(params: DataTableParams) {}

    queryx(params: DataTableParams) {
        return this.http.get(BASE_URL + '/people?' + paramsToQueryString(params)).toPromise()
            .then((resp: Response) => ({
                items: resp.json(),
                count: Number(resp.headers.get('X-Total-Count'))
            }));
    }

    private extractData(res: Response) {
        let body = res.json();
        return body.data || {};
    }
    private handleErrorObservable (error: Response | any) {
        console.error(error.message || error);
        return Observable.throw(error.message || error);
    }
    private handleErrorPromise (error: Response | any) {
        console.error(error.message || error);
        return Promise.reject(error.message || error);
    }

}


/*

addBookWithPromise(book:Book): Promise<Book> {
 let headers = new Headers({ 'Content-Type': 'application/json' });
 let options = new RequestOptions({ headers: headers });
 return this.http.post(this.url, book, options).toPromise()
     .then(this.extractData)
     .catch(this.handleErrorPromise);
 }
 */

/*
 this.http.post('http://jsonplaceholder.typicode.com/posts', {
 title: 'foo',
 body: 'bar',
 userId: 1
 })
 .subscribe(
 res => {
 console.log(res);
 },
 err => {
 console.log("Error occured");
 }
 );
 */