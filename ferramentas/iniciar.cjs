const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const modo = process.argv[2] || 'celular';
const opcoes = {
  login: ['--no-browser'],
  conta: [],
  celular: ['--tunnel', 'ngrok', '--clear'],
  web: ['--web', '--localhost', '--clear'],
  android: ['--android', '--localhost', '--clear'],
  rede: ['--lan', '--clear'],
};

if (!opcoes[modo]) {
  console.error('Use: iniciar.cmd celular, web, android, rede, login ou conta.');
  process.exit(1);
}

const [principal, secundaria] = process.versions.node.split('.').map(Number);
if (!((principal === 22 && secundaria >= 13) || (principal === 24 && secundaria >= 3) || principal >= 26)) {
  console.error('Use Node.js 22.13 ou superior da linha 22, ou uma versão LTS mais recente compatível.');
  process.exit(1);
}

if (modo === 'android') {
  const pastaAndroid = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT ||
    join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
  if (!existsSync(join(pastaAndroid, 'platform-tools', 'adb.exe')) ||
      !existsSync(join(pastaAndroid, 'emulator', 'emulator.exe'))) {
    console.error('SDK Android não encontrado. Instale pelo Android Studio e crie um aparelho no Device Manager.');
    console.error('Consulte a seção Emulador Android do README.');
    process.exit(1);
  }
  process.env.ANDROID_HOME = pastaAndroid;
  process.env.PATH = [join(pastaAndroid, 'platform-tools'), join(pastaAndroid, 'emulator'), process.env.PATH].join(';');
}

let entradaExpo;
try {
  entradaExpo = require.resolve('expo/bin/cli');
} catch {
  console.error('Dependências não encontradas. Execute npm install na pasta do projeto.');
  process.exit(1);
}

const comando = modo === 'login' ? 'login' : modo === 'conta' ? 'whoami' : 'start';
const resultado = spawnSync(process.execPath, [entradaExpo, comando, ...opcoes[modo], ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: process.env,
});
if (resultado.error) console.error(resultado.error.message);
process.exit(resultado.status ?? 1);
