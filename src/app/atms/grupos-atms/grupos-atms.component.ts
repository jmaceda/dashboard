import { Component } from '@angular/core';
//import { VERSION } from '@angular/core';
import {SoapService} from "../../services/soap.service";
import {InfoAtmsService} from "../../services/info-atms.service";
import {DepositosPorTiendaService} from "../../services/acumulado-por-deposito.service";
import {DatosJournalService} from "../../services/datos-journal.service";
import {UtilsService} from "../../services/utils.service";
import {LogHmaService} from "../../services/log-hma.service";
import {SweetAlertService} from "ngx-sweetalert2/src/index";
import {InfoGroupsService} from "../../services/info-groups.service";

//import { Ng4LoadingSpinnerModule, Ng4LoadingSpinnerService  } from 'ng4-loading-spinner';


@Component({
    selector: 'gpos-atms',
    templateUrl: './grupos-atms.component.html',
    styleUrls  : ['./grupos-atms.component.css'],
    providers: [InfoGroupsService, InfoAtmsService],
    //providers: [SoapService, InfoAtmsService, DepositosPorTiendaService, DatosJournalService, UtilsService, LogHmaService, SweetAlertService]
})
export class GruposAtmsComponent {

    private listaGrupos:any = [];
    private listaAtms:any = [];
    private name:string;

    rows = [];

    selected = [];

    columns: any[] = [
        { prop: 'name'} ,
        { name: 'Company' },
        { name: 'Gender' }
    ];

    constructor(
                private _infoGroupsService: InfoGroupsService,
                private _infoAtmsService: InfoAtmsService
                //private ng4LoadingSpinnerService: Ng4LoadingSpinnerService
               ) {

        //this.name = `Angular! v${VERSION.full}`;

        this.fetch((data) => {
            this.selected = [data[2]];
            this.rows = data;
        });

        this.listaGrupos = this._infoGroupsService.obtenGroups();
        console.log(JSON.stringify(this.listaGrupos));
// Description":"BAZ","Description2":"rortega@glider.com.mx","Description3":null,"Id":"77979156"


        this.listaAtms = this._infoAtmsService.obtenAtms();
        console.log(JSON.stringify(this.listaAtms));

    }

    fetch(cb) {
        //this.ng4LoadingSpinnerService.show();
        const req = new XMLHttpRequest();
        req.open('GET', `assets/data/company.json`);

        req.onload = () => {
            cb(JSON.parse(req.response));
            //this.ng4LoadingSpinnerService.hide();
        };

        req.send();
    }

    onSelect({ selected }) {
        console.log('Select Event', selected, this.selected);
    }

    onActivate(event) {
        console.log('Activate Event', event);
    }

}


/*
   <soap:Body>
      <pen:GetGroup/>
   </soap:Body>


            <GenericFilter>
               <Description>BAZ</Description>
               <Description2>rortega@glider.com.mx</Description2>
               <Description3/>
               <Id>77979156</Id>
            </GenericFilter>

 */
/*
      <pen:GetGroupsAtmIds>
         <!--Optional:-->
         <pen:groups>120521074</pen:groups>
      </pen:GetGroupsAtmIds>
   </soap:Body>


<GetGroupsAtmIdsResult>120452707,120433889,120436496,120429360,120420670,16281584,204844429,215168734,215168737,234157205,120375657,215168740,215177843,440707198,440767011,</GetGroupsAtmIdsResult>

 */
/*
   <soap:Body>
      <pen:GetAtmDetail>
         <pen:atmId>120436496</pen:atmId>
      </pen:GetAtmDetail>
   </soap:Body>

 */

/*

<Description>Superama Fuentes del Pedregal</Description>
<Area>Lomas Del Pedregal</Area>
<Ip>11.50.2.24</Ip>
<Name>CI01GT0007</Name>
<IsOnline>true</IsOnline>
<State>Distrito Federal</State>
<ZipCode>14220</ZipCode>
<LastIOnlineTimestamp>
<AddressStreet>Unión</AddressStreet>
<AddressNumber>3</AddressNumber>
<Locality>Tlalpan</Locality>
<CreationDate>2018/08/03</CreationDate>
<Id>120436496</Id>

      <GetAtmDetailResponse xmlns="http://Pentomino.mx/">
         <GetAtmDetailResult>
            <Area>Lomas Del Pedregal</Area>
            <Brand>GRG</Brand>
            <CassetteAmount>LOW</CassetteAmount>
            <City>Tlalpan</City>
            <CriticalPeriod>3</CriticalPeriod>
            <Description>Superama Fuentes del Pedregal</Description>
            <DeviceStatus>OK</DeviceStatus>
            <HopperAmount>null</HopperAmount>
            <Id>120436496</Id>
            <Ip>11.50.2.24</Ip>
            <IsOnline>true</IsOnline>
            <IsoAddress>1234567890123456789012345678901234567890</IsoAddress>
            <IsoLocation>123456789012345678901234567890123</IsoLocation>
            <Model>H68NL Recycler</Model>
            <Name>CI01GT0007</Name>
            <OfflineDevices/>
            <OnlineDevices>
               <string>TIO</string>
               <string>PTR</string>
               <string>VDM</string>
               <string>ICM</string>
               <string>EPP</string>
               <string>AFD</string>
               <string>DEP</string>
            </OnlineDevices>
            <OperatingSystem>Windows 7</OperatingSystem>
            <PaperStatus>OK</PaperStatus>
            <SerialNumber>323244</SerialNumber>
            <ServiceDate>1595221200000</ServiceDate>
            <State>Distrito Federal</State>
            <ZipCode>14220</ZipCode>
            <LastDetails/>
            <CassettesStatus>
               <string>OK</string>
               <string>OK</string>
               <string>OK</string>
               <string>OK</string>
            </CassettesStatus>
            <HoppersStatus/>
            <IsInMaintenanceMode>false</IsInMaintenanceMode>
            <LastDetailsTimestamps/>
            <CassettesStatusTimestamp>1543216154594</CassettesStatusTimestamp>
            <HoppersStatusTimestamp>0</HoppersStatusTimestamp>
            <MaintenanceModeTimestamp>0</MaintenanceModeTimestamp>
            <SafeOpen>false</SafeOpen>
            <CabinetOpen>false</CabinetOpen>
            <SafeOpenTs>1542826314813</SafeOpenTs>
            <CabinetOpenTs>1542825894242</CabinetOpenTs>
            <RetractStatus>
               <string>OK</string>
            </RetractStatus>
            <RetractStatusTimestamp>1543215302522</RetractStatusTimestamp>
            <RejectStatus>
               <string>OK</string>
            </RejectStatus>
            <RejectStatusTimestamp>1543215302522</RejectStatusTimestamp>
            <Money>1</Money>
            <AtmStartHour>0</AtmStartHour>
            <AtmStartMinute>0</AtmStartMinute>
            <AtmEndHour>0</AtmEndHour>
            <AtmEndMinute>0</AtmEndMinute>
            <WorkingDays>127</WorkingDays>
            <LastIOnlineTimestamp>1543216187343</LastIOnlineTimestamp>
            <AddressStreet>Unión</AddressStreet>
            <AddressNumber>3</AddressNumber>
            <Latitude>19.304817</Latitude>
            <Longitude>-99.22093</Longitude>
            <Locality>Tlalpan</Locality>
            <LocalityKey>0001</LocalityKey>
            <CityKey>012</CityKey>
            <StateKey>09</StateKey>
            <CreationDate>2018/08/03</CreationDate>
         </GetAtmDetailResult>
      </GetAtmDetailResponse>

 */