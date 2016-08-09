/// <reference path="../typings/tsd.d.ts" />

// Models
import {Tab} from "../model/tab.ts";
import {Widget} from "../model/widget.ts";
import {WidgetInstance} from "../model/widget_instance.ts";

// Super classes
import {Names} from "./names.ts";
import {Trigger} from "./trigger.ts";
import {db} from "./db.ts";

declare var MyApp: any;

interface TypeDef {
  examples: string[],
  fieldarraylen: number[],
  fieldnames: string[],
  fieldtypes: string[],
  type: string
}

export class Frontend {

  public tabContainerId: string;
  public tabContentContainerId: string;

  private Names: Names;
  public Trigger: Trigger;

  private ActiveTabId: number;

  constructor() {
    this.tabContainerId = "header2";
    this.tabContentContainerId = "tabs";

    this.Names = new Names();
    this.Trigger = new Trigger();
  }

  public LoadingLink(element: Element, disabled: Boolean = true) {
    if (disabled) {
      $(element).addClass("disabled");
    } else {
      $(element).removeClass("disabled");
    }
  }
  public ReleaseLink(element: Element) {
    this.LoadingLink(element, false);
  }

  public formTab(tab?: Tab): Tab {
    if (tab) {
      tab.name = "tab #" + tab.id;
      return tab;
    }
    return new Tab();
  }

  public newTab(tab: Tab): void {
    var tabHtml = MyApp.templates.tab(tab);
    var tabContentHtml = MyApp.templates.tabContent(tab);
    // insert tab
    $(tabHtml).insertBefore("#" + this.tabContainerId + " > .clearfix");
    //document.getElementById(this.tabContainerId).innerHTML += tabHtml;
    // insert tab content
    document.getElementById(this.tabContentContainerId).innerHTML += tabContentHtml;
  }

  public closeTab(tab_id: number): void {
    $(".jsTab[data-tab-id='" + tab_id + "']").remove();
    $(".jsTabContent[data-tab-id='" + tab_id + "']").remove();
  }

  public selectTab(tab: Tab): void {
    let parentClassName = this.Names.classTabParent;
    $("." + parentClassName).removeClass("jsActive");
    $("." + parentClassName + "[data-tab-id=" + tab.id + "]").addClass("jsActive");
    let className = this.Names.eventsClassPrefix + "Tab";
    $("." + className).removeClass("jsActive");
    $("." + className + "[data-tab-id=" + tab.id + "]").addClass("jsActive");
    let tabClassName = this.Names.classTabContent;
    $("." + tabClassName).removeClass("jsShow").addClass("jsHide");
    $("." + tabClassName + "[data-tab-id=" + tab.id + "]").removeClass("jsHide").addClass("jsShow");
    this.ActiveTabId = tab.id;
  }

  public showWidgetsMenu(): void {
    this.widgetsList(db.Widgets);
    $("." + this.Names.classWidgetsContainer).animate({ width: 'toggle' });
  }
  public widgetsList(list: Array<Widget>): void {
    var html = MyApp.templates.widgetList(list);
    $("." + this.Names.classWidgetsList).html(html);
  }
  private _loadWidgetContentAndInsert(widgetInstance: WidgetInstance): void {
    let currentTabId: number = this._getForcedCurrentTabId();
    let fn = this._insertWidget;
    $.ajax({
      url: "widgets/" + widgetInstance.Widget.alias + "/index.hbs",
      beforeSend: function () {

      },
      success: function (data: string) {
        MyApp.templates._widgetsTemplates[widgetInstance.Widget.alias] = Handlebars.compile(data);
        fn(widgetInstance, currentTabId);
      },
      error: function (e1: any, e2: any) {
        throw "Widget file not found!";
      }
    });
  }

  public insertWidgetInstance(widgetInstance: WidgetInstance): void {
    if (MyApp.templates._widgetsTemplates === undefined) {
      MyApp.templates._widgetsTemplates = [];
    }
    if (MyApp.templates._widgetsTemplates[widgetInstance.Widget.alias] === undefined) {
      this._loadWidgetContentAndInsert(widgetInstance);
    } else {
      let currentTabId: number = this._getForcedCurrentTabId();
      this._insertWidget(widgetInstance, currentTabId);
    }
  }

  private _insertWidget(widgetInstance: WidgetInstance, currentTabId: number): void {
    let content: string, html: string;
    content = MyApp.templates._widgetsTemplates[widgetInstance.Widget.alias]();
    let width: string = $(content).attr("data-min-width") + "px";
    let height: string = $(content).attr("data-min-height") + "px";
    let left: string, top: string;
    left = ($(".jsTabContent.jsShow").width() / 2).toString() + "px";
    top = ($(".jsTabContent.jsShow").height() / 2).toString() + "px";
    html = MyApp.templates.widget({ WidgetInstance: widgetInstance, content: content, left: left, top: top, width: width, height: height });
    $("div.jsTabContent[data-tab-id=" + currentTabId + "]").append(html);
    let trigger = new Trigger();
    trigger.widgetSettings(widgetInstance.id);
  }

  private _getForcedCurrentTabId(): number {
    let currentTabId: number = this._getCurrentTabId();
    if (currentTabId === 0) {
      this.Trigger.newTab();
    }
    return this._getCurrentTabId();
  }
  private _getCurrentTabId(): number {
    let tabIdStr: string = $("div.jsTab.jsActive").attr("data-tab-id");
    if (tabIdStr === undefined) {
      return 0;
    }
    let tabId: number = parseInt(tabIdStr);
    return tabId;
  }

  public ShowWidgetSettings(): void {
    $(".jsMenuWidgetsSettings").animate({ right: 0 });
  }
  public HideWidgetSettings(): void {
    $(".jsMenuWidgetsSettings").animate({ right: -300 });
  }

  public UpdateRosTopicSelectors(response: { topics: string[], types: string[], details: TypeDef[] }): void {
    console.log(response);
    $(".jsRosTopicSelector").html("");
    $(".jsRosTopicSelector").append($("<option>", {
      value: 0,
      text: "-- Select a topic to subscribe --"
    }));
    $(".jsRosTopicSelector").each((i: number, element: Element) => {
      let types = $(element).attr("data-ros-topic-type").split("|");
      response.topics.forEach((value: string, index: number) => {
        if(types.indexOf(response.types[index]) > -1) {
          this._AddOption(element, value, value);
        }
      })
    });
  }
  private _AddOption(element: Element, value: string, text: string): void {
    $(element).append($("<option>", {
      value: value,
      text: value
    }));
  }

}
