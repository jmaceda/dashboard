import { BrowserModule }                   from '@angular/platform-browser';
import { NgModule }                        from '@angular/core';
//import { FormsModule } from '@angular/forms';
import { HttpModule }                      from '@angular/http';
import { RouterModule }                    from '@angular/router';

import { AppRoutingModule }                from './app.routing';
import { NavbarModule }                    from './shared/navbar/navbar.module';
import { FooterModule }                    from './shared/footer/footer.module';
import { SidebarModule }                   from './sidebar/sidebar.module';
import { LbdModule }                       from './lbd/lbd.module';

import { AppComponent }                    from './app.component';

import { HomeComponent }                   from './home/home.component';
import { UserComponent }                   from './user/user.component';
import { TablesComponent }                 from './tables/tables.component';
import { TypographyComponent }             from './typography/typography.component';
import { IconsComponent }                  from './icons/icons.component';
import { MapsComponent }                   from './maps/maps.component';
import { NotificationsComponent }          from './notifications/notifications.component';
import { UpgradeComponent }                from './upgrade/upgrade.component';
import { LOCALE_ID }                       from '@angular/core';
import { FormsModule }                     from '@angular/forms';
import { ReactiveFormsModule }             from '@angular/forms';

import { Logger }                          from "angular2-logger/core"; // ADD THIS

import { DepositosComponent }              from "./home/datosDepositos/depositos.component"
import { AlertComponent }                  from './home/tmp/alert.component';

//import { AgGridModule }                    from "ag-grid-angular";

// grouped inner
//import { MedalRendererComponent }          from "./home/tmp/medal-renderer.component";
//import { GroupRowComponent }               from "./home/tmp/group-row-renderer.component";


import { DataTableModule } from 'angular-2-data-table';
import { DataTableDemo1 } from './home/tmp/demo1/data-table-demo1';
//import { DataTableDepositos } from './home/datosDepositos/data-table-depositos';
//import { DxDataGridModule } from 'devextreme-angular';

//import { DevExtremeModule } from 'devextreme-angular';

//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


//import { DataTableDemo }          from "./home/tmp/datatabledemo";


//import {SampleDatePickerAccessModifier} from './home/sample-date-picker-access-modifier';

//import {AngularIndexedDB} from 'angular2-indexeddb';
//import { AsyncLocalStorageModule } from 'angular-async-local-storage';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    TablesComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
    DepositosComponent,
    //DataTableDemo1,
    //DataTableDepositos
    //DataTableDemo,
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NavbarModule,
    FooterModule,
    SidebarModule,
    RouterModule,
    AppRoutingModule,
    LbdModule,
    ReactiveFormsModule,
    //DataTableModule,
    //DxDataGridModule,
    //DevExtremeModule
  ],
  providers: [Logger],
  bootstrap: [AppComponent]
})
export class AppModule { }
  