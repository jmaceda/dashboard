// app/reportes/journal3/journal3.component.ts
import { Component } from '@angular/core';
import { ConfigService } from './configuration.service';
import { dataRedBlu } from './dataRedBlu';
import { sprintf }    from "sprintf-js";
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import * as XLSX from 'xlsx';

import { saveAs } from 'file-saver/FileSaver';


@Component({
    selector: 'my-app',
    templateUrl: './journal3.component.html',
    styleUrls: [ './journal3.component.css' ],
    providers: [ConfigService],
})
export class Journal3Component  {

    fchUltimaActualizacion: string = "";
    regsJournal:number = 0;


    /* Salva archivo de texto */
    private saveToFileSystem(texto) {
        const filename = "prueba.txt";
        let texto2 = "Bodega Santa Lucia\nDOWNTIME: 0\n\nDEPÓSITOS: 72\nIMPORTE DEPÓSITOS: $712,200.00\nPRIMERO: 11:55:00  ULTIMO: 23:31:00\nRETIROS: 128\nIMPORTE RETIROS: $256,750.00";
        texto2 += "\nPRIMERO: 00:06:00  ULTIMO: 21:56:00\nCONSULTAS: 58\nPRIMERA: 07:50:00  ULTIMA: 21:05:00";
        const blob = new Blob([texto2], { type: 'text/plain' });
        saveAs(blob, filename);
    }

    obtenFchUltimaActualizacion(): void {

        let fchSys   = new Date();
        let _anioSys = fchSys.getFullYear();
        let _mesSys  = fchSys.getMonth()+1;   //hoy es 0!
        let _diaSys  = fchSys.getDate();
        let _hraSys  = fchSys.getHours();
        let _minSys  = fchSys.getMinutes();
        let _segSys  = fchSys.getSeconds();

        this.fchUltimaActualizacion = sprintf('%02d:%02d:%02d', _hraSys, _minSys, _segSys);
    }
    columns = [
        { key: 'TimeStamp',         title: 'Fecha/Hora'},
        /*{ key: 'AtmName',        	title: 'ATM' },*/
        { key: 'CardNumber',        title: 'Núm. Tarjeta' },
        { key: 'Event',             title: 'Evento' },
        { key: 'OperationType',     title: 'Tipo de Oper' },
        { key: 'Amount',            title: 'Monto' },
        { key: 'Available',         title: 'Saldo' },
        { key: 'Surcharge',        	title: 'Surcharge' },
        { key: 'Aquirer',           title: 'Emisor' },
        { key: 'Data',              title: 'Datos' },
        { key: 'SwitchResponseCode',title: 'Respuesta Switch' },
        { key: 'HWErrorCode',       title: 'Descripción Error' },
        { key: 'TransactionCount',  title: 'Contador Transacción' },
        { key: 'Denomination',      title: 'Denominación' },
        { key: 'AccountId',        	title: 'Cuenta'},
        { key: 'AccountType',       title: 'Tipo Cuenta'},
        { key: 'AtmId',        		title: 'Id Atm', },
        { key: 'FlagCode',        	title: 'Flag Code' },
        { key: 'Arqc',        		title: 'Arqc' },
        { key: 'Arpc',        		title: 'Arpc' },
        { key: 'TerminalCaps',      title: 'Cap. Terminal' },
        { key: 'PosMode',        	title: 'Tipo POS' },
        { key: 'SwitchAtmId',       title: 'Id Switch Atm' },
        { key: 'Reference1',        title: 'Referencia 1' },
        { key: 'Reference2',        title: 'Referencia 2' },
        { key: 'Reference3',        title: 'Referencia 3' },
        { key: 'SerializedId',      title: 'Id Serial' },
        { key: 'Ip',        		title: 'Ip' },
        { key: 'Id',        		title: 'Id' },
        { key: 'Location',        	title: 'Ubicación'}
    ];
    dataJournalRedBlu = [];
    configuration;
    constructor() {
        this.configuration = ConfigService.config;
        this.dataJournalRedBlu = dataRedBlu;
        this.dataJournalRedBlu.forEach((reg)=> {
            let date = new Date(reg.TimeStamp);
            let fch=sprintf("%04d-%02d-%02d %02d:%02d:%02d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            reg.TimeStamp = fch;
        });
        //this.dataJournalRedBlu = dataRedBlu;
        this.obtenFchUltimaActualizacion();
        this.regsJournal = this.dataJournalRedBlu.length;
        console.log("constructor:: data["+this.dataJournalRedBlu.length+"]");
    }
    ngOnInit() {

        //$("#search_TimeStamp").attr("placeholder", "variable");
        //$("#search_TimeStamp").attr('placeholder','Some New Text');
        $('#search_TimeStamp').attr('placeholder','');
        //document.getElementById ('search_TimeStamp').placeholder='new text for email';
    }

    exportaJournal2Excel(){

        let arrX:any[] = [];
        this.dataJournalRedBlu.forEach((reg)=> {
            //let date = new Date(reg.TimeStamp);
            //let fch=sprintf("%04d-%02d-%02d %02d:%02d:%02d", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            //reg.TimeStamp = fch;
            arrX.push(
                {
                    TimeStamp:          reg.TimeStamp,
                    AtmName:            reg.AtmName,
                    AtmId:              reg.AtmId,
                    CardNumber:         reg.CardNumber,
                    Event:              reg.Event,
                    OperationType:      reg.OperationType,
                    SwitchResponseCode: reg.SwitchResponseCode,
                    Amount:             reg.Amount,
                    Denomination:       reg.Denomination,
                    Available:          reg.Available,
                    Data:               reg.Data,
                    Aquirer:            reg.Aquirer,
                    HWErrorCode:        reg.HWErrorCode,
                    TransactionCount:   reg.TransactionCount,
                    FlagCode:           reg.FlagCode,
                    Surcharge:          reg.Surcharge,
                    AccountId:          reg.AccountId,
                    AccountType:        reg.AccountType,
                    Arqc:               reg.Arqc,
                    Arpc:               reg.Arpc,
                    TerminalCaps:       reg.TerminalCaps,
                    PosMode:            reg.PosMode,
                    SwitchAtmId:        reg.SwitchAtmId,
                    Reference1:         reg.Reference1,
                    Reference2:         reg.Reference2,
                    Reference3:         reg.Reference3,
                    SerializedId:       reg.SerializedId,
                    Ip:                 reg.Ip,
                    Id:                 reg.Id,
                    Location:           reg.Location
                }
            )
        });

        var options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: true
        };

        new Angular2Csv(arrX, 'Journal', options);

        /* generate worksheet */
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(arrX);

        /* generate workbook and add the worksheet */
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */
        const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        //saveAs(new Blob([s2ab(wbout)]), 'SheetJS.xlsx');
        saveAs(new Blob([(wbout)]), 'SheetJS.xlsx');
    }
}