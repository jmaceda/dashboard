/**
 * Created by jmacruz on 03/02/2018.
 */
import { Component, AfterViewInit } from '@angular/core';
import { SuperTableCell } from 'ngx-super-table';

@Component({
    selector: 'app-instrument-cell',
    template: `<span class="badge badge-primary">{{ value }}</span>`
})
export class InstrumentComponent extends SuperTableCell {
    value: any;
}
