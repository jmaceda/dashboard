import { Component, OnInit }    from '@angular/core';
import { LocationStrategy }     from '@angular/common';
import { PlatformLocation }     from '@angular/common';
import { Location }             from '@angular/common';
import { InfoGroupsService }    from './services/info-groups.service';




export var gCatalogoEventos:any[]       = [];
export var gDevicesAtm:any[]            = [];

export var variable_de_app_component    = "Variable declarada en app.component";
export var nomComponente:any            = "AppComponent";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

     constructor(public location: Location,
                 public infoGroupsService: InfoGroupsService) {}

    ngOnInit(){
        //this.infoGroupsService.cargaCataAtmsConGrupos();
    }

    isMap(path){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      titlee = titlee.slice( 1 );
      if(path == titlee){
        return false;
      }
      else {
        return true;
      }
    }
}
