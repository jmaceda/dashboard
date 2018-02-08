import { Component, OnInit } from '@angular/core';
import { LocationStrategy, PlatformLocation, Location } from '@angular/common';

export var variable_de_app_component = "Variable declarada en app.component";

@Component({
  selector: 'app-root',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent implements OnInit {

     constructor(public location: Location) {}

    ngOnInit(){
    }

}
