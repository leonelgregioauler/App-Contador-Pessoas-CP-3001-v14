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
        'ojs/ojslider',
        'ojs/ojselectsingle'],
  function (ko, app, moduleUtils, accUtils, Util, DataBase, ArrayDataProvider, Dash) {

    function DashboardMensalViewModel(params) {
      var self = this;

      self.stackValue = Dash.config.stackValue;
      self.orientationValue = Dash.config.orientationValue;
      self.lineTypeValue = Dash.config.lineTypeValue;
      self.labelPosition = Dash.config.labelPosition;
      
      self.showGraphicMonth = Dash.config.showGraphicMonth;

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
        self.createIntervalMonthly();
      };
      
      self.buttonDisplay = Dash.config.buttonDisplay;

      self.total = Dash.config.total;
      self.totalList = Dash.config.total;
      self.controllerData = Dash.config.controllerData;
      
      let historicMonth = Dash.config.histMonth;
      let historicMonthList = Dash.config.histMonth;
      self.colorMonth = Dash.config.colorMonth;
      self.dataSourceDataMonth = Dash.config.dataSourceDataMonth;
      
      networkInformation = Dash.config.networkInformation;
      getNetworkInformation = Dash.config.getNetworkInformation;

      const controller = Dash.config.controller;

      self.historicMonthsList = ko.observableArray([]);
      
      const valueSelected = {
        "key": 0,
        "data": {
          "key": 0,
          "value": 0,
          "label": "Visualizar dados em tempo real"
        }
      }
      self.valueSelectedHistoricMonthsList = ko.observable(valueSelected);
      self.initialValueListMonths = ko.observable(0);

      self.isMonthSelected = ko.computed(function () {
        if (self.valueSelectedHistoricMonthsList()) {
          if (self.valueSelectedHistoricMonthsList().data) {
            return (self.valueSelectedHistoricMonthsList().data.value == 0)
          } else {
            return true;
          }
        } 
      }, self);

      // Header Config
      self.headerConfig = ko.observable({'view':[], 'viewModel':null});
      moduleUtils.createView({'viewPath':'views/header.html'}).then(function(view) {
        self.headerConfig({'view':view, 'viewModel': app.getHeaderModel()})
      })

      self.queryController = async () => {

        let resultControl = await DataBase.queryController('SELECT * FROM CONTROLADORAS WHERE exibeDashBoard = 1');

        resultControl.forEach( (itemControl, idx) => {

          self.showRequestRegister(false);

          self.controllerData.descricaoControladora(itemControl.descricaoControladora);
          self.controllerData.IP(itemControl.IP);

          const date = new Date();
          const hour = date.getHours();
          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          const fullDate = date.toLocaleDateString('pt-br');
          const monthYear = date.toLocaleDateString('pt-br', {
            month : 'long',
            year : 'numeric'
          });

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
              controller.dataMonth().splice(-controller.dataMonth().length);

              (day <= 12) ? await Promise.all([endpoint1()]) : null;
              (day >= 13) && (day <= 24) ? await Promise.all([endpoint1(), endpoint2()]) : null;
              (day >= 25) ? await Promise.all([endpoint1(), endpoint2(), endpoint3()]) : null;
            }
  
            endpointData().then( () => {

              let orderData = controller.dataMonth().sort( (a, b) => {
                return a.d - b.d;
              });
  
              historicMonth = orderData.slice(0, day);
  
              const details = historicMonth.map((item) => {
                return {
                  id: item.d,
                  series: `${monthYear} - ${self.total.totalDay()} visitas.`,
                  quarter: item.d,
                  group: 'Contador',
                  value: parseInt(item.v)
                }
              });

              let totalDiasMovimento = new Array;
              historicMonth.forEach((item) => {
                if ( parseInt(item.v) > 0 ) {
                  totalDiasMovimento.push(idx);
                  return;
                }
              })

              self.total.avgMonth(`Visitas/Dia: ${parseInt(self.total.totalDay() / (totalDiasMovimento.length))}`);
  
              self.dataSourceDataMonth[0].histMonth.data = details;

              let totalVisitantesMes = historicMonth.reduce( (accumulator, object) => {
                return accumulator + parseInt(object.v);
              }, 0)
              
              const meses = new Array(12);
              meses[1]  = {mes:  1, mesDescricao: 'Janeiro'};
              meses[2]  = {mes:  2, mesDescricao: 'Fevereiro'};
              meses[3]  = {mes:  3, mesDescricao: 'Marco'};
              meses[4]  = {mes:  4, mesDescricao: 'Abril'};
              meses[5]  = {mes:  5, mesDescricao: 'Maio'};
              meses[6]  = {mes:  6, mesDescricao: 'Junho'};
              meses[7]  = {mes:  7, mesDescricao: 'Julho'};
              meses[8]  = {mes:  8, mesDescricao: 'Agosto'};
              meses[9]  = {mes:  9, mesDescricao: 'Setembro'};
              meses[10] = {mes: 10, mesDescricao: 'Outubro'};
              meses[11] = {mes: 11, mesDescricao: 'Novembro'};
              meses[12] = {mes: 12, mesDescricao: 'Dezembro'};

              const historicMonthDetails = historicMonth;

              DataBase.insertUpdateVisitorsMonth(meses[month], totalVisitantesMes, year);
              historicMonthDetails.forEach( (item) => {
                DataBase.insertUpdateVisitorsMonthDetails(item, meses[month], year);
              }); 
  
              self.showGraphicMonth(false);
  
              if ( (resultControl.length - 1) == idx) {
                self.showGraphicMonth(true);
                self.showLoadingIndicator(false);
                self.showSlider(true);
                self.queryHistoricMonthsList();
              }
            })
          })
          .catch( (error) => {
            self.clearIntervalMonthly();
            self.indeterminate(0);
            self.progressValue(Math.floor(Math.random() * 100));
            getNetworkInformation(error);
          })

          endpoint1 = async () => {
            let endpoint1 = await Util.callGetService(itemControl.IP, controller.parameter1to12).then( (response) => {
              response.historico.forEach( (item) => {
                controller.dataMonth.push(item);
              })
            })
          }

          endpoint2 = async () => {
            let endpoint2 = await Util.callGetService(itemControl.IP, controller.parameter13to24).then( (response) => {
              response.historico.forEach( (item) => {
                controller.dataMonth.push(item);
              })
            })
          }

          endpoint3 = async () => {
            let endpoint3 = await Util.callGetService(itemControl.IP, controller.parameter25to36).then( (response) => {
              response.historico.forEach( (item) => {
                controller.dataMonth.push(item);
              })
            })
          }
        })
      }
      
      self.queryHistoricMonthsList = async () => {
        let resultControl = await DataBase.queryVisitorsMonth(`SELECT mes, mesDescricao, ano FROM RELATORIO_MENSAL order by mes`);
        
        const list = resultControl.reduce( (accumulator, currentValue) =>
          accumulator
          .concat({
            key: 1,
            value: currentValue.mes, 
            label: `${currentValue.mesDescricao}/${currentValue.ano}`
          }), [] )
          .concat({
            key: 0, 
            value: 0, 
            label: 'Visualizar dados em tempo real'
          })
        self.historicMonthsList(list);
        self.dataProviderMonthsList = new ArrayDataProvider(self.historicMonthsList, { keyAttributes: "value" } );
      }
      self.dataProviderMonthsList = new ArrayDataProvider(self.historicMonthsList, { keyAttributes: "value" } );

      self.queryHistoricalData = () => {

        if (self.valueSelectedHistoricMonthsList().data) {
          if (self.valueSelectedHistoricMonthsList().data.value) {
            self.clearIntervalMonthly();
            self.generateHistoricalData();
          } else {
            self.queryController();
            self.createIntervalMonthly();
          }
        }
        
        self.generateHistoricalData = async () => {
          
          const date = new Date();
          const day = date.getDate();
          
          let resultControlList = await DataBase.queryVisitorsMonthDetails(`SELECT RM.mes, RM.mesDescricao, RM.ano,
                                                                                   RMD.dia, RMD.totalVisitantesDia  
                                                                            FROM RELATORIO_MENSAL_DETALHES RMD 
                                                                               , RELATORIO_MENSAL RM
                                                                            WHERE RMD.mes = RM.mes 
                                                                            AND RM.mes = ${self.valueSelectedHistoricMonthsList().data.value}`);
  
          let orderDataList = resultControlList.sort( (a, b) => {
            return a.dia - b.dia;
          });
  
          historicMonthList = orderDataList.slice(0, 31);

          let totalVisitantesMes = historicMonthList.reduce( (accumulator, object) => {
            return accumulator + parseInt(object.totalVisitantesDia);
          }, 0)
  
          self.totalList.totalActual(parseInt(totalVisitantesMes));
          self.totalList.totalDay('Total de Visitas no Mês');
          
          const detailsList = historicMonthList.map((item) => {
            return {
              id: item.dia,
              series: `${item.mesDescricao.toLowerCase()} de ${item.ano}  - ${totalVisitantesMes} visitas.`,
              quarter: item.dia,
              group: 'Contador',
              value: parseInt(item.totalVisitantesDia)
            }
          });

          self.dataSourceDataMonth[0].histMonth.data = detailsList;
          
          self.showGraphicMonth(false);
          self.showGraphicMonth(true);
          self.showLoadingIndicator(false);
          self.showSlider(true);
        }
      }

      self.clearIntervalMonthly = function () { 
        clearInterval(Dash.config.intervalMonthly());
        Dash.config.intervalMonthly('');
      }

      self.createIntervalMonthly = function () {

        if (!Dash.config.intervalMonthly()) {

          const intervalMonthly = setInterval( () => {

            if (params.router._activeState.path === 'dashboard-mensal') {

              self.showLoadingIndicator(true);
              
              controller.dataTotal().splice(-controller.dataTotal().length);
              controller.dataMonth().splice(-controller.dataMonth().length);
              
              self.queryController();

              networkInformation.flagOnline = true;
              networkInformation.flagOffline = true;
  
            }
          }, 30000);

          Dash.config.intervalMonthly(intervalMonthly);
        }
      }

      self.close = function(event) {
        document.getElementById("modalDialogArquivoGerado").close();
      }
      self.open = function(event) {
        document.getElementById("modalDialogArquivoGerado").open();
      }

      self.closeAviso = function(event) {
        document.getElementById("modalDialogSemDadosHistorico").close();
      }
      self.openAviso = function(event) {
        document.getElementById("modalDialogSemDadosHistorico").open();
      }

      self.openGerarExcelLista = function(event) {
        document.getElementById("modalDialogGerarExcelLista").open();
      }

      self.closeGerarExcelLista = function(event) {
        document.getElementById("modalDialogGerarExcelLista").close();
      }

      self.abrirListaOpcoes = function(event) {

      }

      self.gerarExcel = async () => {

        let resultVisitors = await DataBase.queryVisitorsMonth('SELECT mes, mesDescricao, totalVisitantesMes FROM RELATORIO_MENSAL');

        let orderData = resultVisitors.sort( (a, b) => {
          return a.mes - b.mes;
        });

        let CSVData = `Mes;Visitantes\n` + orderData.map( (item) => {
          return `${item.mesDescricao};${item.totalVisitantesMes}`;
        }).join('\n');

        //application/vnd.ms-excel
        //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        let excel = new Blob([CSVData], { type: 'text/csv'});

        if (resultVisitors.length == 0) {
          self.openAviso();
        } else {
          /* Util.ReadWriteFilesDevice(`CP 3001 - Relatório Mensal`, `Relatório Mensal.csv`, excel).then( (result) => {
            if (result === 'WRITE') {
              self.open();
            }
          }) */

          Util.ReadWriteFilesDeviceMediaStore(CSVData, `Relatório Mensal.csv`, `CP 3001 - Relatório Mensal`).then( (result) => {
            if (result) {
              self.open();
            }
          })
        }
        self.closeGerarExcelLista();
      };
      
      self.gerarExcelDetalhes = async () => {

        let resultVisitorsDetails = await DataBase.queryVisitorsMonthDetails(`SELECT RM.mes, RM.mesDescricao, RM.ano,
                                                                                     RMD.dia, RMD.totalVisitantesDia 
                                                                              FROM RELATORIO_MENSAL_DETALHES RMD
                                                                                 , RELATORIO_MENSAL RM 
                                                                              WHERE RMD.mes = RM.mes 
                                                                              AND RM.mes = ${self.valueSelectedHistoricMonthsList().data.value}`);

        let orderDataDetails = resultVisitorsDetails.sort( (a, b) => {
          return a.dia - b.dia;
        });

        let iterator = orderDataDetails[Symbol.iterator]();

        let CSVData = `${self.valueSelectedHistoricMonthsList().data.label};Visitantes`;

        for (const line of iterator) {
          line ? CSVData = `${CSVData}\n${line.dia};${line.totalVisitantesDia}` : null;
        }

        CSVData = `${CSVData}\n ;${self.totalList.totalActual()}`;

        let excel = new Blob([CSVData], { type: 'text/csv' });

        if (resultVisitorsDetails.length == 0) {
          self.openAviso();
        } else {
          /* Util.ReadWriteFilesDevice(`CP 3001 - Relatório Mensal Detalhado`, `Relatório Mensal Detalhado.csv`, excel).then( (result) => {
            if (result === 'WRITE') {
              self.open();
            }
          }) */

          Util.ReadWriteFilesDeviceMediaStore(CSVData, `Relatório Mensal Detalhado.csv`, `CP 3001 - Relatório Mensal Detalhado`).then( (result) => {
            if (result) {
              self.open();
            }
          })
        }
        self.closeGerarExcelLista();
      };

      self.connected = function() {
        accUtils.announce('Dashboard Mensal page loaded.');
        document.title = "Dashboard Mensal";
        window.addEventListener('orientationchange', self.identifyScreenSize);
        self.queryController();
        self.createIntervalMonthly();
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

    return DashboardMensalViewModel;
  }
);
