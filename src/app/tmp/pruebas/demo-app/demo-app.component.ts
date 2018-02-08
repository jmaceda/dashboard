import { Component, OnInit, AfterContentInit, ElementRef } from '@angular/core';
import {
    SuperTableModule,
    ISuperTableColumn,
    ISuperTableOptions,
    superTableSorters,
    superTableFilters,
    ColumnState
} from 'ngx-super-table';
import { InstrumentComponent } from './instrument.component';

type INSTRUMENT_TYPE = 'sax' | 'trumpet' | 'trombone' | 'piano' | 'keys' | 'drums';
const INSTRUMENTS: string[] = [
    'sax',
    'trumpet',
    'trombone',
    'piano',
    'keys',
    'drums'
];

/*
@Component({
    selector: 'app-demo-app',
    template: `
        <p class="mt-3 mb-2">
            The following table has {{NUM_ROWS}} rows, and uses row-virtualization so
            the DOM is not overloaded. All sorting and filtering occurs on the client
            side.
        </p>
        <super-table id="abcdef"
                [rows]="rows"
                [columns]="columns"
                [options]="options"
                [tableClasses]="tableClasses">
        </super-table>
    `,
    styles: [`
        :host {
            width: 80%;
            display: block;
            margin: 0 auto;
            height: 400px;
        }
        #abcdef table tbody tr td {
            padding-bottom: 0px;
            padding-top: 0px;
            height: 16px;
        }
    `]
})
*/
@Component({
    selector: 'app-demo-app',
    templateUrl: './demo-app.component.html',
    styleUrls: ['./demo-app.component.css'],
})
export class DemoComponent implements OnInit, AfterContentInit {
    tableClasses: string[] = ['table', 'table-bordered', 'clasesTable'];
    rows: MyRow[] = [];
    NUM_ROWS = 10000;

    // properties
    isReady = false;
    hasError = false;
private rowHeight = 25;

    columns: ISuperTableColumn[] = [
        {
            id: 'firstName',
            key: 'firstName',
            label: 'First',
            width: 100,
            sort: superTableSorters.STRING,
            filter: superTableFilters.STRING
        },
        {
            id: 'lastName',
            key: 'lastName',
            label: 'Last',
            sort: superTableSorters.STRING,
            filter: superTableFilters.STRING
        },
        {
            id: 'instrument',
            key: 'instrument',
            label: 'Instrument',
            sort: superTableSorters.STRING,
            component: InstrumentComponent,
            filter: superTableFilters.ENUM,
            filterChoices: INSTRUMENTS
        },
        {
            id: 'height',
            key: 'height',
            label: 'Height',
            sort: superTableSorters.NUMBER,
            filter: superTableFilters.NUMBER,
            format: function(value: any, row: Object, colState: ColumnState): string {
                const numValue: number = value as number;
                const feet: number = Math.floor(numValue / 12);
                const inches: number = numValue % 12;
                return `${feet}'${inches}"`;
            }
        },
        {
            id: 'dob',
            key: 'dob',
            label: 'Birthday',
            sort: superTableSorters.NUMBER,
            filter: superTableFilters.DATE
        }
    ];
    options: ISuperTableOptions = {
        autoHeight: true // auto size the table to the parent element
    };

    private lastNames: string[] = [
        'Davis',
        'Monk',
        'Gordon',
        'Coltrane',
        'Henderson',
        'Rollins'
    ];

    private firstNames: string[] = [
        'Miles',
        'Thelonious',
        'Dexter',
        'John',
        'Joe',
        'Sonny'
    ];

    private instruments: string[] = INSTRUMENTS;

    constructor (private el: ElementRef) {}

    ngOnInit() {
        this.rows = this.generateRows(this.NUM_ROWS);
    }

    ngAfterContentInit() {
        if (this.options.autoHeight) {
            const parentHeight: number = this.el.nativeElement.parentElement.clientHeight;
            //this.setTableHeight(parentHeight);
        }
        this.isReady = true;
    }

    private generateRows (count: number): MyRow[] {
        const result: MyRow[] = [];
        for (let i = 0; i < count; i++) {
            result.push({
                firstName: this.chooseRandom(this.firstNames),
                lastName: this.chooseRandom(this.lastNames),
                height: Math.floor(Math.random() * 30) + 60,
                dob: new Date(Date.now() - (Math.random() * 30 + 15) * 365 * 24 * 60 * 60 * 1000),
                instrument: this.chooseRandom(this.instruments)
            });
        }
        return result;
    }

    private chooseRandom (choices: string[]): string {
        const randomIndex: number = Math.floor(Math.random() * choices.length);
        return choices[randomIndex];
    }
}

export interface MyRow {
    firstName: string;
    lastName: string;
    height: number;
    dob: Date;
    instrument: string;
}
