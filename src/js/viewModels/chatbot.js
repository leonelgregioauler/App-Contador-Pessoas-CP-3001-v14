/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define([
  "knockout",
  "appController",
  "ojs/ojmodule-element-utils", 
  "accUtils",
  "ojs/ojcontext"
], function (ko, app, moduleUtils, accUtils, Context) {
  function ChatBotViewModel() {
    var self = this;

    // Header Config
    self.headerConfig = ko.observable({'view':[], 'viewModel':null});
    moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
      self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
    })

    const URL = 'https://console.dialogflow.com/api-client/demo/embedded/6f2da095-6fa0-429e-92cb-cdca04b7fbac';
    window.location.replace(URL);

    self.connected = function () {
      accUtils.announce("Chatbot page loaded.", "assertive");
      document.title = "Chatbot";
    };
    
    self.disconnected = function () {};

    self.transitionCompleted = function () {};
  }
  return ChatBotViewModel;
});