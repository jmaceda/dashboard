import { Component, OnInit } from '@angular/core';


declare var $:any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  showNotification(from, align, tipo?){
      const type = ['','info','success','warning','danger'];

      var color = Math.floor((Math.random() * 4) + 1);
      tipo = (tipo == null || tipo == undefined) ? 'info' : tipo;
      switch (tipo){
          case 'info': color = 1; break;
          case 'success': color = 2; break;
          case 'warning': color = 3; break;
          case 'danger': color = 4; break;
      }
      //color = (tipo == 'info') ? 1: (tipo == 2)
      $.notify({
          icon: "pe-7s-attention",
          message: "Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for every web developer."
      },{
          type: type[color],
          //type: type[tipo],
          timer: 1000,
          placement: {
              from: from,
              align: align
          }
      });
  }
}
