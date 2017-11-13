import { BrowserModule }                   from '@angular/platform-browser';
import { NgModule }                        from '@angular/core';
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
import { FormsModule }                     from '@angular/forms';
import { ReactiveFormsModule }             from '@angular/forms';

//import { Logger }                          from "angular2-logger/core"; // ADD THIS
//import { DepositosComponent }              from "./home/datosDepositos/depositos.component";
//import { ChartsModule } from 'ng2-charts/ng2-charts';
//import { DatetimePopupModule } from 'ngx-bootstrap-datetime-popup';
//import { DatetimePopupModule } from 'ngx-bootstrap-datetime-popup/lib/datetime-popup.module';


import { ReportesComponent } from "./reportes/reportes.component";

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
    ReportesComponent
    //DepositosComponent,
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
    //ChartsModule,
  ],
  providers: [
    //Logger,
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }
  