import { Component, OnInit } from '@angular/core';


declare var $:any;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  showNotification(from, align, tipo?, msg?){
      const type = ['','info','success','warning','danger'];

      let msg2:string = "";

      if (typeof(msg) == "object"){
          msg.forEach( reg => {
              msg2 += "* "+reg + "<br>";
          })
      } else {
          msg2 = msg;
      }

      var color = Math.floor((Math.random() * 4) + 1);
      tipo = (tipo == null || tipo == undefined) ? 'info' : tipo;
      switch (tipo){
          case 'info': color = 1; break;
          case 'success': color = 2; break;
          case 'warning': color = 3; break;
          case 'danger': color = 4; break;
      }

      $.notify({
          icon: "pe-7s-attention",
          message: msg2
      },{
          type: type[color],
          timer: 1000,
          placement: {
              from: from,
              align: align
          },
          animate: {
              enter: 'animated bounceInDown',
              exit: 'animated bounceOutUp'
          },
          offset: 20,
          allow_dismiss: false,
          //showProgressbar: true
      });
  }
}
