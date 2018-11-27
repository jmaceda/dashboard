import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path : string;
    title: string;
    icon : string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: 'atms',              title: 'ATMs',                      icon: 'pe-7s-monitor',      class: '' },
    { path: 'operaciones',       title: 'Operaciones',               icon: 'pe-7s-cash',         class: '' },
    { path: 'journal',           title: 'Journal',                   icon: 'pe-7s-note2',        class: '' },
    { path: 'aclaraciones',      title: 'Aclaraciones',              icon: 'pe-7s-search',       class: '' },
    //{ path: 'loghma',           title: 'Log HMA',                   icon: 'pe-7s-notebook',     class: '' },
    { path: 'loghardware',       title: 'Log Hardware',              icon: 'pe-7s-search',       class: '' },
    { path: 'retirosetv',        title: 'Cortes ETV',                icon: 'pe-7s-cash',         class: '' },
<<<<<<< HEAD
    //{ path: 'retiroshma',        title: 'Retiros HMA',             icon: 'pe-7s-cash',         class: '' },
    { path: 'efectdisp',         title: 'Efectivo Disponible',       icon: 'pe-7s-cash',         class: '' },
    { path: 'efectdispgpo',      title: 'Efectivo por Grupo',       icon: 'pe-7s-cash',         class: '' },
    { path: 'opersfinan',        title: 'Opers. Financieras',        icon: 'pe-7s-cash',         class: '' },
    { path: 'opersfinanxcajero', title: 'Opers. por Cajero',         icon: 'pe-7s-cash',         class: '' },
    //{ path: 'opersfinanacumula2',title: 'Acumulado de Opers.',       icon: 'pe-7s-cash',         class: '' },
    { path: 'reportebanxico',    title: 'Reporte Banxico',           icon: 'pe-7s-cash',         class: '' },
    { path: 'manualgrg',         title: 'Sensores H68N GRG',         icon: 'pe-7s-notebook',     class: '' },
    //{ path: 'impresiones',       title: 'Impresiones',               icon: 'pe-7s-news-paper',   class: '' },
    { path: 'versionesapp',      title: 'Version Core-Flujo',        icon: 'pe-7s-news-paper',   class: '' },
    { path: 'gruposcajeros',      title: 'Grupos - Cajeros',         icon: 'pe-7s-news-paper',   class: '' },

    //{ path: 'loghardware',  title: 'Log Hardware',                  icon: 'pe-7s-search',     class: '' },
    //{ path: 'opersfinanacumula',title: 'Acumulado de Opers. 2',      icon: 'pe-7s-cash',         class: '' },
=======
    { path: 'retiroshma',        title: 'Retiros HMA',               icon: 'pe-7s-cash',         class: '' },
    { path: 'efectdisp',         title: 'Efectivo Disponible',       icon: 'pe-7s-cash',         class: '' },
    { path: 'opersfinan',        title: 'Opers. Financieras',        icon: 'pe-7s-cash',         class: '' },
    { path: 'opersfinanxcajero', title: 'Opers. por Cajero',         icon: 'pe-7s-cash',         class: '' },
    { path: 'opersfinanacumula2',title: 'Acumulado de Opers.',       icon: 'pe-7s-cash',         class: '' },
    { path: 'reportebanxico',    title: 'Reporte Banxico',           icon: 'pe-7s-cash',         class: '' },
    { path: 'manualgrg',         title: 'Sensores H68N GRG',         icon: 'pe-7s-notebook',     class: '' },
    { path: 'impresiones',       title: 'Impresiones',               icon: 'pe-7s-news-paper',   class: '' },
    { path: 'versionesapp',      title: 'Version Core-Flujo',        icon: 'pe-7s-news-paper',   class: '' },
    //{ path: 'loghardware',  title: 'Log Hardware',                  icon: 'pe-7s-search',     class: '' },
    { path: 'opersfinanacumula',title: 'Acumulado de Opers. 2',      icon: 'pe-7s-cash',         class: '' },
>>>>>>> e88b8c5ff0e68abde08e02726d27bb563f6fb5fd
    ];


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
  }

  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
