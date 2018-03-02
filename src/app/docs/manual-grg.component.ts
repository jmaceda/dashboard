import { Component } from '@angular/core';

@Component({
    selector: 'example-app',
    template: `
          <div>
              <label>PDF src</label>
              <input type="text" placeholder="PDF src" [(ngModel)]="pdfSrc">
          </div>
          <pdf-viewer [src]="pdfSrc" 
                      [render-text]="true"
                      [stick-to-page]="true"
                      [show-all]="true"
                      [page]="1"
                      style="display: block;"
          ></pdf-viewer>
  `
})
export class ManualGrgComponent {
    pdfSrc: string = '/assets/docs/H68N Series _CRM9250 Sensor.pdf';
}
