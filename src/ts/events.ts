/// <reference path="d/jquery.d.ts" />

import {Frontend} from "./frontend.ts";
import {Tab} from "./tab.ts";
import {Db} from "./db.ts";

export class Events {
  
  private eventsClassPrefix : string = "jsEvent";
  private Frontend: Frontend;
  private Db: Db;
  
  constructor() {
    this.Db = new Db();
    this.Frontend = new Frontend();
    
    this.DelegateClassEvent("WidgetsMenu", "click", this.widgetMenu);
    
    this.DelegateClassEvent("Nothing", "click", this.nothing);
    this.DelegateClassEvent("NewTab", "click", this.newTab);
    this.DelegateClassEvent("Tab", "click", this.tab);
    this.DelegateClassEvent("CloseTab", "click", this.closeTab);
  }
  
  private DelegateClassEvent(className: string, eventType: string, method: () => void) {
    $(document).delegate("." + this.eventsClassPrefix + className, eventType, method);
  }
  private DelegateIdEvent(id: string, eventType: string, method: () => void) {
    $(document).delegate("#" + id, eventType, method);
  }
  
  public nothing = (e?: MouseEvent) => {
    e.preventDefault();
  }
  public newTab = (e?: MouseEvent) => {
    this._newTab();
    e.preventDefault();
  }
  private _newTab() {
    var tab: Tab = this.Db.newTab();
    tab = this.Frontend.formTab(tab);
    this.Frontend.newTab(tab);
    this._tab(tab);
  }
  public tab = (e?: MouseEvent) => {
    let tab_id: number = parseInt($(e.toElement).attr("data-tab-id"));
    let tab: Tab = this.Db.getTab(tab_id);
    this._tab(tab);
    e.preventDefault();
  }
  private _tab(tab: Tab): void {
    this.Frontend.selectTab(tab);
  }
  public closeTab = (e?: MouseEvent) => {
    let tab_id: number = parseInt($(e.toElement).attr("data-tab-id"));
    if(confirm("Are you sure you want to close tab #" + tab_id + " ?")) {
      this._closeTab(tab_id);
    }
    e.preventDefault();
  }
  private _closeTab(tab_id: number): void {
    this.Db.removeTab(tab_id);
    this.Frontend.closeTab(tab_id);
  }
  public widgetMenu = (e?: MouseEvent) => {
    this._widgetMenu();
    e.preventDefault();
  }
  private _widgetMenu() {
    this.Frontend.widgetsMenu();
  }
  
}
