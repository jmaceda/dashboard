import { Injectable } from '@angular/core';

var nomModulo = "CargaDatosLocalesService";

@Injectable()
export class CargaDatosLocalesService {

    public nomArchivo: string = "";

    constructor () {}

    public leeArchivoLocal(nomArchivo: any){

        if(nomArchivo == null || nomArchivo == undefined || nomArchivo == ""){
            return([ {"err": "** No indico el nombre del archivo **"} ]);
        }

        this.nomArchivo = nomArchivo;

        var rows:any;

        this.leeArchivoY((data) => {

            let dataLocal = data.trim();
            let tipoDato:any = typeof(dataLocal);

            if (tipoDato == "string"){
                if (dataLocal.substring(0,1) == "["){
                    dataLocal = (new Function("return " + dataLocal + ";")());
                }else if (dataLocal.substring(0,1) == "{"){
                    dataLocal = JSON.parse(dataLocal);
                }
            }

            rows = dataLocal;
        });

        return(rows);
    }

    private leeArchivo(cb) {
        const req = new XMLHttpRequest();
        req.open('GET', this.nomArchivo, false);

        req.onload = () => {
           cb(req.response);
        };

        req.send();
    }

    private leeArchivoY(cb) {

        var xhr = new XMLHttpRequest();

        xhr.open("GET", this.nomArchivo, false); // true=asincrono / false=sincrono

        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    cb(xhr.response);
                } else {}
            }
        };

        xhr.onerror = function (e) {};

        xhr.send();
    }


}
