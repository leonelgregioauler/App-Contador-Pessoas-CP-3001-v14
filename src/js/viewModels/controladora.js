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
  "ojs/ojcontext",
  "../dataBase",
  "ojs/ojarraydataprovider",
  "ojs/ojknockout-keyset",
  "ojs/ojkeyset",
  "ojs/ojasyncvalidator-regexp",
  "viewModels/dashboard",
  "ojs/ojknockout",
  "ojs/ojinputtext",
  "ojs/ojinputnumber",
  "ojs/ojlabel",
  "ojs/ojbutton",
  "ojs/ojformlayout",
  "ojs/ojmessaging",
  "ojs/ojlistview",
  "ojs/ojlistitemlayout",
  "ojs/ojdialog",
  "ojs/ojselectsingle",
  "ojs/ojswitch"
], function (ko, app, moduleUtils, accUtils, Context, DataBase, ArrayDataProvider, keySet, KeySetImpl, AsyncRegExpValidator, Dash) {
  function ControladoraViewModel() {
    var self = this;

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.currentIndex;
    
      const date = new Date();
      const day = (date.getDate()).toLocaleString('pt-BR', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      const month = (date.getMonth() + 1).toLocaleString('pt-BR', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
      const year = date.getFullYear();
      
      //const appVersion = `Neo CP 3001 - v ${year}${month}${day}.1`;
      const appVersion = `Neo CP 3001 - v 2024.0122.1`;
      
      self.appVersion = ko.observable(appVersion);

      self.networkInformation = Dash.config.networkInformation;

      self.controllerRegistration = {
        idControladora : ko.observable(),
        descricaoControladora : ko.observable(''),
        IP : ko.observable(''),
        horaInicioTurno1 : ko.observable(),
        horaFimTurno1 : ko.observable(),
        horaInicioTurno2 : ko.observable(),
        horaFimTurno2 : ko.observable(),
        exibeDashBoard : ko.observable(true),
      }

      self.idControladoraToSelected = ko.observable();
      
      self.dataController = ko.observableArray([]);
      self.showListView = ko.observable(false);

      self.queryController = async function () {
        
        DataBase.queryController('SELECT * FROM CONTROLADORAS').then( (result) => {

          self.dataController(result);
          self.showListView(true);
          
          var items = self.dataController();
          var array = items.map(function(e) {
            return e.idControladora;
          });
          self.lastItemId = Math.max.apply(null, array);
          self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );

          let data = result.map( (item) => {
            if (item.exibeDashBoard == true) {
              return item 
            }
          })

          return data.filter( (item) => {
            return item;
          })
        })
        .then ((data) => {
          if (data.length > 0) {
            setListItemSelected(data[0].value);
          } else {
            self.controllerRegistration.exibeDashBoard(false);
            setListItemSelected(self.idControladoraToSelected());
          }
        })
      }
      self.dataProviderController = new ArrayDataProvider(self.dataController, { keyAttributes: "idControladora" } );
      
      self.selectedItems = new keySet.ObservableKeySet();
      
      function setListItemSelected (key) {
        let keySI = new Set();
        keySI.add(key);
        keySI = new KeySetImpl.KeySetImpl(keySI);
        document.getElementById("listview").setProperty("selected", keySI);
      };
      
      self.isTextEmpty = ko.observable(true);
      
      // usar parametro disabled="[[isTextAndSelecionFilled]]" no oj-button
      self.isTextAndSelecionFilled = ko.computed(function(){
        return  ( !self.isTextEmpty() && !self.isSelectionEmpty()) || self.isTextEmpty();
      }, self);

      self.isSelectionEmpty = ko.computed(function () {
        return self.selectedItems().values().size === 0;
      }, self);
      self.isTextOrSelectionEmpty = ko.computed(function () {
        return self.isTextEmpty() || self.isSelectionEmpty();
      }, self);
    
      self.addItem = function () {
        var itemToAdd = self.controllerRegistration.IP();

        const controller = {
          idControladora : self.controllerRegistration.idControladora() || 1,
          descricaoControladora : self.controllerRegistration.descricaoControladora(),
          IP : self.controllerRegistration.IP(), 
          horaInicioTurno1 : self.controllerRegistration.horaInicioTurno1(), 
          horaFimTurno1 : self.controllerRegistration.horaFimTurno1(), 
          horaInicioTurno2 : self.controllerRegistration.horaInicioTurno2(), 
          horaFimTurno2 : self.controllerRegistration.horaFimTurno2(),
          exibeDashBoard : self.controllerRegistration.exibeDashBoard(true)
        }

        if ((itemToAdd !== '')) {
          DataBase.insertController(controller);
          self.showListView(false);
          self.queryController();
          self.controllerRegistration.descricaoControladora();
          self.controllerRegistration.IP();
          self.controllerRegistration.horaInicioTurno1();
          self.controllerRegistration.horaFimTurno1();
          self.controllerRegistration.horaInicioTurno2();
          self.controllerRegistration.horaFimTurno2();
        }
      }.bind(self);
    
      self.updateSelected = async function () {

        var itemToReplace = self.dataController()[self.currentIndex];
        
        const controller = { 
          value: itemToReplace.value, 
          label: self.controllerRegistration.descricaoControladora(), 
          idControladora: itemToReplace.idControladora, 
          descricaoControladora : self.controllerRegistration.descricaoControladora(),
          IP : self.controllerRegistration.IP(), 
          horaInicioTurno1 : self.controllerRegistration.horaInicioTurno1(), 
          horaFimTurno1 : self.controllerRegistration.horaFimTurno1(), 
          horaInicioTurno2 : self.controllerRegistration.horaInicioTurno2(), 
          horaFimTurno2 : self.controllerRegistration.horaFimTurno2(),
          exibeDashBoard : self.controllerRegistration.exibeDashBoard(true)
        }
        DataBase.updateController(controller);
        self.queryController();
      
      }.bind(self);
    
      self.close = function(event) {
        document.getElementById("modalDialogExcluirCadastro").close();
      }
      self.open = function(event) {
        document.getElementById("modalDialogExcluirCadastro").open();
      }

      self.removeSelected = function () {
        const items = self.dataController();
        var itemToRemove = self.dataController()[self.currentIndex];
        ControllerLeft = items.filter( (config, index) => {
          return config.idControladora !== itemToRemove.idControladora
        })
        self.close();
        DataBase.deleteController(itemToRemove.idControladora);
        self.showListView(false);
        self.queryController();
        self.controllerRegistration.descricaoControladora('');
        self.controllerRegistration.IP('');
        self.idControladoraToSelected(ControllerLeft[0].value);
      }.bind(self);
  
      
      // usar parametro on-current-item-changed="[[handleCurrentItemChanged]]" no oj-list-view
      self.handleCurrentItemChanged = function (event) {
        var key = event.detail.value;
        populateFields(key);
      }.bind(self);

      // usar parametro on-selected-changed="[[handleSelectedChanged]]" no oj-list-view
      self.handleSelectedChanged = function (event) {
        var key = Array.from(event.detail.value.values())[0];
        populateFields(key);
      }.bind(self);

      populateFields = (key) => {
        var items = self.dataController();
        var indice = items.map(function(e) {
          return e.idControladora;
        }).indexOf(key);

        for (var i = 0; i < items.length; i++) { 
          if (i === indice) {
            self.currentIndex = i;
            self.controllerRegistration.idControladora(items[i].idControladora);
            self.controllerRegistration.descricaoControladora(items[i].descricaoControladora);
            self.controllerRegistration.IP(items[i].IP);
            self.controllerRegistration.horaInicioTurno1(items[i].horaInicioTurno1);
            self.controllerRegistration.horaFimTurno1(items[i].horaFimTurno1);
            self.controllerRegistration.horaInicioTurno2(items[i].horaInicioTurno2);
            self.controllerRegistration.horaFimTurno2(items[i].horaFimTurno2);
            self.controllerRegistration.exibeDashBoard(items[i].exibeDashBoard);
            break;
          }
        }
      }

      self.selectedIds = ko.observable();
      
      self.handleRawValueChanged = function (event) {
        var value = event.detail.value;
        self.isTextEmpty(value.trim().length === 0);
      }.bind(self);

      // usar parametro on-raw-value-changed="[[handleRawValueChangedFormatIP]] no oj-input-text
      self.handleRawValueChangedFormatIP = function (event) {
        var value = event.detail.value;
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})/, "$1.$2.$3.$4");
        self.controllerRegistration.IP(value);
      }.bind(self);
      
      let options = new Object();

      /* options = {
        pattern: "[a-zA-Z0-9:/.-]+",
        hint: "Informe um valor de IP válido",
        messageDetail: "Informe um valor de IP válido",
      } */
      
      options = {
        pattern: "\\d{1,3}\\.{1}\\d{1,3}\\.{1}\\d{1,3}\\.{1}\\d{1,3}",
        hint: "Informe um valor de IP válido",
        messageDetail: "Informe um valor de IP válido",
      }

      self.validators = [
        new AsyncRegExpValidator(options)
      ];

      function onError( error ) {
        self.networkInformation.ipInformation('');
        self.networkInformation.subnetInformation('');
      }

      self.consultarIPRede = function () {
        self.controllerRegistration.IP(self.networkInformation.IP());
      }

      function onSuccess( ipInformation ) {
        let IP = (ipInformation.ip) ? ipInformation.ip : ipInformation;
        IP = IP.split('.').slice(0, 3);
        IP.push("10");
        IP = IP.join('.');
        const ipInfo = (ipInformation.ip) ? `\nIP : ${ipInformation.ip}` : `\nIP : ${ipInformation}`;
        const subNet = (ipInformation.subnet) ? `\nGateway : ${ipInformation.subnet}` : `Gateway : Desconhecido.`;
        if (ipInformation) {
          self.networkInformation.IP(IP);
          self.networkInformation.ipInformation(ipInfo);
          self.networkInformation.subnetInformation(subNet);
        } else {
          self.controllerRegistration.IP('');
          self.networkInformation.IP('');
          self.networkInformation.ipInformation('');
          self.networkInformation.subnetInformation('');
        }
      }

      networkinterface.getWiFiIPAddress(onSuccess, onError);
      
      self.connected = function () {
        accUtils.announce("Controladora page loaded.", "assertive");
        document.title = "Controladora";
        //DataBase.dropDataBase();
        DataBase.createDataBase();
        self.queryController();
      };

      self.disconnected = function () {};

      self.transitionCompleted = function () {};
    }

    return ControladoraViewModel;
  }
);
