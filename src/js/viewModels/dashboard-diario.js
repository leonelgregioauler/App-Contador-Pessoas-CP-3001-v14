/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(['knockout', 
        'appController', 
        'ojs/ojmodule-element-utils', 
        'accUtils', 
        '../httpUtil',
        '../dataBase',
        'ojs/ojarraydataprovider',
        'viewModels/dashboard',
        'ojs/ojchart',
        'ojs/ojactioncard',
        'ojs/ojlabel',
        'ojs/ojdialog',
        'ojs/ojtoolbar',
        'ojs/ojbutton',
        'ojs/ojprogress-circle',
        'ojs/ojslider'],
  function (ko, app, moduleUtils, accUtils, Util, DataBase, ArrayDataProvider, Dash) {

    function DashboardDiarioViewModel(params) {
      var self = this;

      self.stackValue = Dash.config.stackValue;
      self.orientationValue = Dash.config.orientationValue;
      self.lineTypeValue = Dash.config.lineTypeValue;
      self.labelPosition = Dash.config.labelPosition;
      
      self.showGraphicHour = Dash.config.showGraphicHour;
      
      self.showLoadingIndicator = Dash.config.showLoadingIndicator;
      self.showRequestRegister = Dash.config.showRequestRegister;
      self.showSlider = Dash.config.showSlider;

      self.indeterminate = Dash.config.indeterminate;
      self.progressValue = Dash.config.progressValue;

      self.maxValue = Dash.config.maxValue;
      self.minValue = Dash.config.minValue;
      self.actualValue = Dash.config.actualValue;
      self.transientValue = Dash.config.transientValue;
      self.stepValue = Dash.config.stepValue;

      self.identifyScreenSize = Dash.config.identifyScreenSize;
      
      self.restartButton = () => {
        self.indeterminate(-1);
        self.progressValue(0);
        self.createIntervalDaily();
      };
      
      self.buttonDisplay = Dash.config.buttonDisplay;
    
      self.total = Dash.config.total;
      self.controllerData = Dash.config.controllerData;

      let historicOfficeHourMorning = Dash.config.historicOfficeHourMorning;
      let historicOfficeHourAfternoon = Dash.config.historicOfficeHourAfternoon;
      self.colorOfficeHourMorning = Dash.config.colorOfficeHourMorning;
      self.colorOfficeHourAfternoon = Dash.config.colorOfficeHourAfternoon;
      self.dataSourceDataHour = Dash.config.dataSourceDataHour; 

      networkInformation = Dash.config.networkInformation;
      getNetworkInformation = Dash.config.getNetworkInformation;

      const controller = Dash.config.controller;

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.queryController = async function () {

        let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS WHERE exibeDashBoard = 1');

        resultControl.forEach( (itemControl, idx) => {

          self.showRequestRegister(false);
          
          self.controllerData.descricaoControladora(itemControl.descricaoControladora);
          self.controllerData.IP(itemControl.IP);

          const date = new Date();
          const hour = date.getHours();
          const minutes = date.getMinutes();
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const fullDate = date.toLocaleDateString('pt-br');

          Util.callGetService(itemControl.IP, controller.parameterTotal).then( (response) => {
            controller.dataTotal().splice(-controller.dataTotal().length);

            response.historico.forEach( (item) => {
              controller.dataTotal.push(item);
            }) 
            const totalActual = controller.dataTotal().find((item) => {
              return item.h === 34
            })
            const totalDay = controller.dataTotal().find((item) => {
              return item.h === 35
            })
            self.total.totalActual(parseInt(totalActual.v));
            self.total.totalDay(parseInt(totalDay.v));
            self.total.dayMonthYear(fullDate);
          })
          .then( () => {
            
            endpointData = async () => {
              controller.dataHour().splice(-controller.dataHour().length);

              (hour <= 11) ? await Promise.all([localData(), endpoint4()]) : null;
              (hour >= 12) ? await Promise.all([localData(), endpoint4(), endpoint5()]) : null;
            }
            
            endpointData().then( () => {

              let orderData = controller.dataHour().sort( (a, b) => {
                return a.seq - b.seq;
              })

              let indexInitialMorning = orderData.map(item => item.h).indexOf(itemControl.horaInicioTurno1);
              let indexInitialAfternoon = orderData.map(item => item.h).indexOf(itemControl.horaInicioTurno2);
              
              let quarter = orderData.filter((item) => {
                return item.h == hour;
              });
              let quarterFinalMoning = orderData.filter((item) => {
                return item.h == itemControl.horaFimTurno1;
              });
              let quarterFinalAfternoon = orderData.filter((item) => {
                return item.h == itemControl.horaFimTurno2;
              });
              
              let indexHour = orderData.map(item => item.h).indexOf(hour) + quarter.length;
              let indexFinalMorning = orderData.map(item => item.h).indexOf(itemControl.horaFimTurno1) + quarterFinalMoning.length;
              let indexFinalAfternoon = orderData.map(item => item.h).indexOf(itemControl.horaFimTurno2) + quarterFinalAfternoon.length;
            
              historicOfficeHourMorning   = orderData.slice(indexInitialMorning, (itemControl.horaFimTurno1 < hour) ? indexFinalMorning : indexHour);
              historicOfficeHourAfternoon = orderData.slice(indexInitialAfternoon, (itemControl.horaFimTurno2 < hour) ? indexFinalAfternoon : indexHour);
            
              const detailsMorning = historicOfficeHourMorning.map((item) => {
                let hour = item.h
                let minute = item.m.toString().padEnd(2, 0);

                return {
                  id: `${hour}:${minute}`,
                  series: 'Turno 1',
                  quarter: `${hour}:${minute}`,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });
              
              const detailsAfternoon = historicOfficeHourAfternoon.map((item) => {
                let hour = item.h
                let minute = item.m.toString().padEnd(2, 0);
;                return {
                  id: `${hour}:${minute}`,
                  series: 'Turno 2',
                  quarter: `${hour}:${minute}`,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });
              
              const detailsMorningAfternoon = [...detailsMorning, ...detailsAfternoon];

              self.total.avgDay(`Visitas/Hora: ${parseInt(self.total.totalActual() / detailsMorningAfternoon.length == 0 ? 1 : detailsMorningAfternoon.length)}`);
              
              self.dataSourceDataHour[0].histHour.data = detailsMorningAfternoon;
              
              self.showGraphicHour(false);
              
              if ( (resultControl.length - 1) == idx) {
                self.showGraphicHour(true);
                self.showLoadingIndicator(false);
                self.showSlider(true);
              }
            })
          })
          .catch( (error) => {
            self.clearIntervalDaily();
            self.indeterminate(0);
            self.progressValue(Math.floor(Math.random() * 100));
            getNetworkInformation(error);
          })

          localData = async () => {
            let localData = await DataBase.queryVisitorsDayDetails(`SELECT hora, minuto, totalVisitantesHoraMinuto FROM RELATORIO_DIARIO order by hora`).then( (responseLocal) => {    
                responseLocal.forEach( (item) => {
                  controller.dataHour.push({
                    seq: parseInt(`${item.h}${item.m}`),
                    h: item.h,
                    m: item.m,
                    v: item.v
                  });
                })
            })
          }
          
          endpoint4 = async () => {
            let endpoint4 = await Util.callGetService(itemControl.IP, controller.parameter12h).then( (response) => {
                response.historico.forEach( (item) => {
                  controller.dataHour.push({
                    seq: parseInt(`${item.h}`) * 100,
                    h: item.h,
                    m: 0,
                    v: item.v
                  });

                  let minute;
  
                  minutes < 15 ? minute = 0 : null;
                  minutes >= 15 ? minute = 15 : null;
                  minutes >= 30 ? minute = 30 : null;
                  minutes >= 45 ? minute = 45 : null;
  
                  DataBase.insertUpdateVisitorsDayDetails(hour, item, minute, fullDate);                
                })
            })
          }
          
          endpoint5 = async () => {
            let endpoint5 = await Util.callGetService(itemControl.IP, controller.parameter24h).then( (response) => {
                response.historico.forEach( (item) => {
                  controller.dataHour.push({
                    seq: parseInt(`${item.h}`) * 100,
                    h: item.h,
                    m: 0,
                    v: item.v
                  });

                  let minute;
  
                  minutes < 15 ? minute = 0 : null;
                  minutes >= 15 ? minute = 15 : null;
                  minutes >= 30 ? minute = 30 : null;
                  minutes >= 45 ? minute = 45 : null;
  
                  DataBase.insertUpdateVisitorsDayDetails(hour, item, minute, fullDate);
                })
            })
          }
        })
      }
      

      self.clearIntervalDaily = function () { 
        clearInterval(Dash.config.intervalDaily());
        Dash.config.intervalDaily('');
      }

      self.createIntervalDaily = function () {

        if (!Dash.config.intervalDaily()) {
          
          const intervalDaily = setInterval( () => {

            if (params.router._activeState.path === 'dashboard-diario') {

              self.showLoadingIndicator(true);

              controller.dataTotal().splice(-controller.dataTotal().length);
              controller.dataHour().splice(-controller.dataHour().length);

              self.queryController();

              networkInformation.flagOnline = true;
              networkInformation.flagOffline = true;
  
            }
          }, 30000);

          Dash.config.intervalDaily(intervalDaily);
        }
      }
      
      self.connected = function() {
        accUtils.announce('Dashboard Diário page loaded.');
        document.title = "Dashboard Diário";

        window.addEventListener('orientationchange', self.identifyScreenSize);

        self.queryController();
        self.createIntervalDaily();
        self.identifyScreenSize();
        DataBase.createDataBase();
      };

      self.disconnected = function() {
        // Implement if needed
      };

      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    return DashboardDiarioViewModel;
  }
);
