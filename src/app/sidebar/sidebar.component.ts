import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path : string;
    title: string;
    icon : string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'atms',             title: 'ATMs',                      icon: 'pe-7s-monitor',      class: '' },
    /*{ path: 'resumen',          title: 'Resumem',                   icon: 'pe-7s-cash',         class: '' },*/
    { path: 'operaciones',      title: 'Operaciones',               icon: 'pe-7s-cash',         class: '' },
    { path: 'journal',          title: 'Journal',                   icon: 'pe-7s-note2',        class: '' },
    { path: 'aclaraciones',     title: 'Aclaraciones',              icon: 'pe-7s-search',       class: '' },
    { path: 'loghma',           title: 'Log HMA',                   icon: 'pe-7s-notebook',     class: '' },
    { path: 'totaltienda',      title: 'Totales por Tienda',        icon: 'pe-7s-notebook',     class: '' },
    { path: 'resumenefectivo',  title: 'Resumen de Efectivo',       icon: 'pe-7s-notebook',     class: '' },
    { path: 'detalletienda',    title: 'Detalle por Tienda',        icon: 'pe-7s-notebook',     class: '' },
    { path: 'retirosetv',       title: 'Cortes ETV',                icon: 'pe-7s-cash',     class: '' },

    { path: 'retiroshma',       title: 'Retiros HMA',               icon: 'pe-7s-cash',     class: '' },
    { path: 'efectdisp',       title: 'Efectivo Disponible',               icon: 'pe-7s-cash',     class: '' },
    { path: 'opersfinan',       title: 'Opers. Financieras',               icon: 'pe-7s-cash',     class: '' },

    { path: 'promopers',       title: 'Tiempo Promedio',                icon: 'pe-7s-cash',     class: '' },


    //{ path: 'rechazoshma',       title: 'Rechazos',                icon: 'pe-7s-cash',     class: '' },
    //{ path: 'DemoComponent',       title: 'Super Table',                icon: 'pe-7s-cash',     class: '' },

    //{ path: 'HorzVertScrolling',  title: 'HorzVertScrolling',          icon: 'pe-7s-notebook',     class: '' },
    //{ path: 'SmartTable',  title: 'SmartTableComponent',          icon: 'pe-7s-notebook',     class: '' },

    { path: 'HorzVertScrolling',  title: 'HorzVertScrolling',          icon: 'pe-7s-notebook',     class: '' },
    { path: 'manualgrg',  title: 'Sensores H68N GRG',          icon: 'pe-7s-notebook',     class: '' },
    ];

//

/*
export const ROUTES: RouteInfo[] = [
    { path: 'dashboard', title: 'Dashboard',  icon: 'pe-7s-graph', class: '' },
    { path: 'user', title: 'User Profile',  icon:'pe-7s-user', class: '' },
    { path: 'table', title: 'Table List',  icon:'pe-7s-note2', class: '' },
    { path: 'typography', title: 'Typography',  icon:'pe-7s-news-paper', class: '' },
    { path: 'icons', title: 'Icons',  icon:'pe-7s-science', class: '' },
    { path: 'maps', title: 'Maps',  icon:'pe-7s-map-marker', class: '' },
    { path: 'notifications', title: 'Notifications',  icon:'pe-7s-bell', class: '' },
    { path: 'upgrade', title: 'Upgrade to PRO',  icon:'pe-7s-rocket', class: 'active-pro' },
];
*/

var nomComponente:string = "SidebarComponent";

@Component({
  selector   : 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  public ambiente:string = "QA";

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    console.log(nomComponente+".ngOnInit:: Inicio puerto["+window.location.port+"]");
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
