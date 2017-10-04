import { Component } from '@angular/core';
import { DataTableResource } from 'angular-2-data-table';
import persons from './data-table-depositos-data';


@Component({
    selector   : 'data-table-depositos',
    providers  : [],
    templateUrl: './data-table-depositos.html',
    styleUrls  : ['./data-table-depositos.css']
})
export class DataTableDepositos {

    itemResource = new DataTableResource(persons);
    items        = [];
    itemCount    = 0;

    constructor() {
        this.itemResource.count().then(count => this.itemCount = count);
    }

    reloadItems(params) {
        this.itemResource.query(params).then(items => this.items = items);
    }

    // special properties:

    rowClick(rowEvent) {
        console.log('Clicked: ' + rowEvent.row.item.name);
    }

    rowDoubleClick(rowEvent) {
        alert('Double clicked: ' + rowEvent.row.item.name);
    }

    rowTooltip(item) { return item.jobTitle; }
}
