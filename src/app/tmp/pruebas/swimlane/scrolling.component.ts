import { Component } from '@angular/core';

@Component({
  selector: 'horz-vert-scrolling-demo',
  template: `
    <div>
      <h3>
        Horizontal and Vertical Scrolling
        <small>
          <a href="https://github.com/swimlane/ngx-datatable/blob/master/demo/basic/scrolling.component.ts" target="_blank">
            Source
          </a>
        </small>
      </h3>
      <ngx-datatable
        class="material striped"
        [rows]="rows"
        columnMode="force"
        [headerHeight]="30"
        [footerHeight]="0"
		[loadingIndicator]="loadingIndicator"
        [rowHeight]="30"
        [scrollbarV]="true"
		[selected]="selected"
		[selectionType]="'single'"
        [scrollbarH]="true">
		
		
		<ngx-datatable-column name="#" [width]="60" [resizeable]="false" id="idx">
			<ng-template let-rowIndex="rowIndex" ngx-datatable-cell-template>
				<div style="text-align: right;">
					<strong>{{rowIndex+1}}</strong>
				</div>
			</ng-template>
		</ngx-datatable-column>
        <ngx-datatable-column name="Name" [width]="300"></ngx-datatable-column>
        <ngx-datatable-column name="Gender"></ngx-datatable-column>
        <ngx-datatable-column name="Age"></ngx-datatable-column>
        <ngx-datatable-column name="City" [width]="300" prop="address.city"></ngx-datatable-column>
        <ngx-datatable-column name="State" [width]="300" prop="address.state"></ngx-datatable-column>
      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./scrolling.component.css'],
})
export class HorzVertScrolling {
  rows = [];
  selected = [];
  barIndicador = true;
  loadingIndicator: boolean = true;

  constructor() {
    this.fetch((data) => {
	  this.selected = [data[2]];
      this.rows = data;
	  setTimeout(() => { this.loadingIndicator = false; }, 1500);
    });
  }

  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/100k.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

}
