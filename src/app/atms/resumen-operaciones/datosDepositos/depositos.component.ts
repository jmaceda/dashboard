import { Component }  from '@angular/core';
import { OnInit }     from '@angular/core';
import { Input}       from '@angular/core';
import { sprintf }    from "sprintf-js";

import { DepositosModel }  from '../models/depositos';


export class Hero {
  id  : number;
  name: string;
}

@Component({
  selector: 'my-app2',
  template: ` 
      <p>Prueba de clase de depositos</p>
      <div>{{hraIniDep}}</div>
  <!-- 
        <ag-grid-angular style="width: 900px; height: 115px;" class="ag-fresh"
            [rowData]    = "rowData"
            [columnDefs] = "columnDefs">
        </ag-grid-angular>
        -->
    `
})
export class DepositosComponent implements OnInit {

    public ftoHra    = "%02d:%02d:%02d";
    public fchIni    = new Date();
    public hraIniDep = sprintf(this.ftoHra, this.fchIni.getHours(), this.fchIni.getMinutes(), this.fchIni.getSeconds());


    columnDefs;
    rowData;
    @Input() infoDepositos: DepositosModel[];

    constructor() {
        /*
        this.columnDefs = [
            {headerName: "Make", field: "make", width: 300},
            {headerName: "Model", field: "model", width: 300},
            {headerName: "Price", field: "price", width: 300}
        ];

        this.rowData = [
            {make: "Toyota", model: "Celica", price: 35000},
            {make: "Ford", model: "Mondeo", price: 32000},
            {make: "Porsche", model: "Boxter", price: 72000}
        ]
        */
    }

    ngOnInit() {
        console.log("Se va a mostrar el contenido de infoDepositos");
        for(var dato in this.infoDepositos){
            console.log(this.infoDepositos[dato].denominaBill);
        }
        console.log("Se mostro el contenido de infoDepositos");
    }
    onGridReady(params) {
        //params.api.sizeColumnsToFit();
    }
}
