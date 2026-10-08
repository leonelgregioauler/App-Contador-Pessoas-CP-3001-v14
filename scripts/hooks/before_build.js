/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

const { execSync } = require('child_process');

const fs = require('fs');
const path = require('path');


module.exports = function (configObj) {
  return new Promise((resolve, reject) => {

    console.log('🔧 Running before_build hook');

    const buildType = configObj.buildType;  // dev | release
    const destination = (configObj && configObj.opts && configObj.opts.destination) || [];

    console.log(buildType);

    const run = (cmd) => {
      try {
        console.log('➡️ ', cmd);
        execSync(cmd, { stdio: 'inherit' });
      } catch (e) {
        // evita falhar se o plugin não existir
        console.log('⚠️ Ignorado:', e.message);
      }
    };

    if (destination.includes('browser')) {
      console.log('🌐 Configurando plugins para BROWSER');
      console.log('Comando executado: ojet serve android --destination=browser');
      console.log('Comando executado: ojet serve android --destination=browser --release');
      console.log('Comando executado: ojet serve android --destination=browser --release --optimize=advanced');
      
      run('ojet remove plugin cordova-plugin-sqlite-2');
      
      run('ojet add plugin cordova-sqlite-storage');
    }
    
    if (destination.includes('device') || destination.includes('emulator')) {
      console.log('🤖 Configurando plugins para ANDROID');
      console.log('Comando executado: ojet build android --device');
      console.log('Comando executado: ojet build android --release --build-config="/publicar/neocp3001/build-android.json"');
      
      run('ojet remove plugin cordova-sqlite-storage');

      run('ojet add plugin cordova-plugin-sqlite-2');
    }

    const isBuild = buildType === 'build' || buildType === 'release';

    const indexPath = path.join('src', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const toggle = (content, enable) => {
      if (enable) {
        return content
          .replace(/<!--\s*/g, '')
          .replace(/\s*-->/g, '');
      } else {
        return `<!-- ${content.trim()} -->`;
      }
    };

    html = html.replace(
      /(<!-- DEV_ENTRY_START -->)([\s\S]*?)(<!-- DEV_ENTRY_END -->)/,
      (_, start, content, end) =>
        `${start}\n${toggle(content, !isBuild)}\n${end}`
    );

    html = html.replace(
      /(<!-- PROD_ENTRY_START -->)([\s\S]*?)(<!-- PROD_ENTRY_END -->)/,
      (_, start, content, end) =>
        `${start}\n${toggle(content, isBuild)}\n${end}`
    );

    fs.writeFileSync(indexPath, html, 'utf8');

    console.log(isBuild
      ? '📦 BUILD → bundle.js ativo'
      : '🧪 SERVE → main.js ativo'
    );

    resolve(configObj);

  });
};
