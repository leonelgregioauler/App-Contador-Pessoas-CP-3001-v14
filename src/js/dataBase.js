define([],
    function () {
  
      function createDataBase () { 
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              db.transaction(function(tx) {
                  tx.executeSql(`CREATE TABLE IF NOT EXISTS CONTROLADORAS (idControladora INTEGER PRIMARY KEY AUTOINCREMENT, 
                                                                           descricaoControladora VARCHAR2(100) NOT NULL, 
                                                                           IP VARCHAR2(100) NOT NULL, 
                                                                           horaInicioTurno1 INTEGER NOT NULL, 
                                                                           horaFimTurno1 INTEGER NOT NULL, 
                                                                           horaInicioTurno2 INTEGER NOT NULL, 
                                                                           horaFimTurno2 INTEGER NOT NULL, 
                                                                           exibeDashBoard NUMBER)`);
  
                  tx.executeSql(`CREATE TABLE IF NOT EXISTS RELATORIO_MENSAL (mes INTEGER,
                                                                              mesDescricao VARCHAR2(20), 
                                                                              totalVisitantesMes INTEGER, 
                                                                              ano INTEGER,
                                                                              constraint UK_MES_ANO UNIQUE (mes, ano))`);
  
                  tx.executeSql(`CREATE TABLE IF NOT EXISTS RELATORIO_MENSAL_DETALHES (dia INTEGER,
                                                                                       totalVisitantesDia INTEGER,
                                                                                       mes INTEGER,
                                                                                       ano INTEGER,
                                                                                       constraint UK_DIA_MES_ANO UNIQUE (dia, mes, ano)) `);
                  console.warn("Banco de Dados criado");
              });
          } catch (err) {
            alert ('Erro ao criar tabelas '+ err);
          }
      }
  
      function dropDataBase ()  {
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              db.transaction(function(tx) {
                  tx.executeSql('DROP TABLE CONTROLADORAS');
                  tx.executeSql('DROP TABLE RELATORIO_MENSAL');
                  tx.executeSql('DROP TABLE RELATORIO_MENSAL_DETALHES');
              });
          } catch (err) {
          alert ('Erro ao remover tabelas '+ err);
          }
      }
  
      function insertController (controller) {
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              const exibeDashBoard = controller.exibeDashBoard ? 1 : 0; 
              
              db.transaction(function(tx) {
                  tx.executeSql(`INSERT INTO CONTROLADORAS (descricaoControladora, IP, horaInicioTurno1, horaFimTurno1, horaInicioTurno2, horaFimTurno2, exibeDashBoard) VALUES (\'${controller.descricaoControladora}\', \'${controller.IP}\', ${controller.horaInicioTurno1}, ${controller.horaFimTurno1}, ${controller.horaInicioTurno2}, ${controller.horaFimTurno2}, ${exibeDashBoard})`
                  , [], function(tx, result) {
                      if (exibeDashBoard == 1)
                        tx.executeSql(`UPDATE CONTROLADORAS SET exibeDashBoard = 0 WHERE idControladora != ${result.insertId}`);
                  }, null);
              });
          } catch (err) {
              alert ('Erro ao cadastrar a controladora'+ err);
          }
      }
  
      function updateController (controller) {
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              const exibeDashBoard = controller.exibeDashBoard ? 1 : 0; 
              
              db.transaction(function(tx) {
                  tx.executeSql(`UPDATE CONTROLADORAS set descricaoControladora = \'${controller.descricaoControladora}\', IP = \'${controller.IP}\', horaInicioTurno1 = ${controller.horaInicioTurno1}, horaFimTurno1 = ${controller.horaFimTurno1}, horaInicioTurno2 = ${controller.horaInicioTurno2}, horaFimTurno2 = ${controller.horaFimTurno2}, exibeDashBoard = ${exibeDashBoard} WHERE idControladora = ${controller.idControladora}`
                  , [], function(tx, result) {
                      if (exibeDashBoard == 1)
                        tx.executeSql(`UPDATE CONTROLADORAS SET exibeDashBoard = 0 WHERE idControladora != ${controller.idControladora}`);
                  }, null);
              });
          } catch (err) {
              alert ('Erro ao cadastrar a controladora'+ err);
          }
      }
  
      function queryController (query) {
          var configuration = [];
          var configurationMap = [];
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              return new Promise( (resolve, reject) => {
                  db.transaction(function(tx) {
                      tx.executeSql(query, [], function(tx, result) {
                          
                          for (let i = 0; i < result.rows.length; i++) {
                              configuration.push(result.rows.item(i));
                          }
  
                          configurationMap = configuration.map((item) => {
                              return {
                                  value: item.idControladora,
                                  label: item.descricaoControladora, 
                                  idControladora: item.idControladora,
                                  descricaoControladora: item.descricaoControladora,
                                  IP: item.IP,
                                  horaInicioTurno1: item.horaInicioTurno1,
                                  horaFimTurno1: item.horaFimTurno1,
                                  horaInicioTurno2: item.horaInicioTurno2,
                                  horaFimTurno2: item.horaFimTurno2, 
                                  exibeDashBoard: item.exibeDashBoard === 1 ? true : false
                              }
                          })
                          resolve(configurationMap);
                      }, reject)
                  })
              });
          } catch (err) {
            alert ('Erro ao consultar a controladora ' + err);
          }
          return configuration;
      }
  
      function deleteController (idControladora) {
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas'});
  
              db.transaction(function(tx) {
                  tx.executeSql(`DELETE FROM CONTROLADORAS WHERE idControladora = ${idControladora}`);
              });
          } catch (err) {
          alert ('Erro ao remover a controladora '+ err);
          }
      }
  
      function insertUpdateVisitorsMonth (month, totalVisitantesMes, year) {
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              db.transaction(function(tx) {
                  tx.executeSql(`INSERT OR REPLACE INTO RELATORIO_MENSAL (mes, mesDescricao, totalVisitantesMes, ano) VALUES (${month.mes}, \'${month.mesDescricao}\', ${totalVisitantesMes}, ${year})`);
              });
          } catch (err) {
              alert ('Erro ao inserir ou atualizar visitantes '+ err);
          }
      }
  
      function queryVisitorsMonth (query) {
          var visitors = [];
          var visitorsMap = [];
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              return new Promise( (resolve, reject) => {
                  db.transaction(function(tx) {
                      tx.executeSql(query, [], function(tx, result) {
                          
                          for (let i = 0; i < result.rows.length; i++) {
                              visitors.push(result.rows.item(i));
                          }
  
                          visitorsMap = visitors.map((item) => {
                              return {
                                  mes: item.mes,
                                  mesDescricao: item.mesDescricao,
                                  totalVisitantesMes: item.totalVisitantesMes,
                                  ano: item.ano
                              }
                          })
                          
                          resolve(visitorsMap);
                      }, reject)
                  })
              });
          } catch (err) {
            alert ('Erro ao consultar os dados mensais de visitantes ' + err);
          }
          return visitors;
      }
  
      function insertUpdateVisitorsMonthDetails (historicMonth, month, year) {
  
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
              db.transaction(function(tx) {
                  tx.executeSql(`INSERT OR REPLACE INTO RELATORIO_MENSAL_DETALHES (dia, totalVisitantesDia, mes, ano) 
                                 VALUES (${historicMonth.d}, ${parseInt(historicMonth.v)}, ${month.mes}, ${year})`);
              });
          } catch (err) {
              alert ('Erro ao inserir ou atualizar o total de visitantes detalhado '+ err);
          }
      }
  
      function queryVisitorsMonthDetails (query) {
          var visitors = [];
          var visitorsMap = [];
          try {
              db = openDatabase ('App-Contador-Pessoas', 1.0, 'App Contador de Pessoas', 2 * 1024 * 1024);
              // Migração SQLite
              //db = window.sqlitePlugin.openDatabase ({name: 'App-Contador-Pessoas', location: 'default'});
  
              return new Promise( (resolve, reject) => {
                  db.transaction(function(tx) {
                      tx.executeSql(query, [], function(tx, result) {
                          
                          for (let i = 0; i < result.rows.length; i++) {
                              visitors.push(result.rows.item(i));
                          }
  
                          visitorsMap = visitors.map((item) => {
                              return {
                                  dia: parseInt(item.dia),
                                  totalVisitantesDia: item.totalVisitantesDia,
                                  mes: item.mes,
                                  mesDescricao: item.mesDescricao,
                                  ano: item.ano
                              }
                          })
                          
                          resolve(visitorsMap);
                      }, reject)
                  })
              });
          } catch (err) {
            alert ('Erro ao consultar os dados mensais de visitantes ' + err);
          }
          return visitors;
      }
  
      return { 
               createDataBase: createDataBase,
               dropDataBase: dropDataBase,
               insertController: insertController,
               updateController: updateController,
               queryController: queryController,
               deleteController: deleteController,
               insertUpdateVisitorsMonth: insertUpdateVisitorsMonth,
               queryVisitorsMonth: queryVisitorsMonth,
               insertUpdateVisitorsMonthDetails: insertUpdateVisitorsMonthDetails,
               queryVisitorsMonthDetails: queryVisitorsMonthDetails
             };
    }
  );
  