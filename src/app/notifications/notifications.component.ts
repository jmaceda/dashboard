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
          allow_dismiss: true,
          icon_type: 'class',
          template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                    '   <button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                    '   <span data-notify="icon"></span> ' +
                    '   <span data-notify="title">{1}</span> ' +
                    '   <span data-notify="message">{2}</span>' +
                    '   <div class="progress" data-notify="progressbar">' +
                    '       <div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                    '   </div>' +
                    '   <a href="{3}" target="{4}" data-notify="url"></a>' +
                    '</div>'
          //showProgressbar: true
      });
  }
}
