#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const shelljs = require('shelljs')

const { exec, ls, exit } = shelljs

const CONFIG = {
  LENGHT: 3  // key + lang个数
}
let enObj = {}
let zhObj = {}
let currentLine = 0

console.log('start')

console.log('path:', path.join(__dirname, './i18n.csv'))
let source = fs.readFileSync('./i18n.csv', {
  encoding: 'utf-8'
})

if(source.includes('#')) currentLine++

source = source.split('\n').filter(line => !line.includes('#'))
source.forEach((line, index) => {
  parseLine(line, index+1)
})

fs.writeFileSync('./en-US.json', formatResObj(enObj), {
  encoding: 'utf-8'
})
fs.writeFileSync('./zh-CN.json', formatResObj(zhObj), {
  encoding: 'utf-8'
})

function parseLine(str, line) {
  currentLine++
  switch (checkLine(str, line)) {
    case 1: {
      exit(1)
      break;
    }
    case 0: {
      let [key, zh, en] = str.split(',')
      enObj[key] = en
      zhObj[key] = zh
      break;
    }
    case 2: {
      let [key, zh, en] = str.split(',')
      enObj[key] = '---------------------------------' 
      zhObj[key] = '---------------------------------'
      break;
    }
    case 3: {
      const res = parseStrWithComma(str, line)
      let [key, zh, en] = res
      enObj[key] = en
      zhObj[key] = zh
      break;
    }
    default:
      break;
  }
}

function checkLine(str, line) {
  // 说明line
  if(str.includes('---------')) {
    return 2
  }
  // 包含"line
  if(/["'],["']/.test(str)) return 3
  const length = str.split(',').length
  if (length !== CONFIG.LENGHT) {
    console.log(chalk.yellow(`line ${currentLine} format error, lenght = ${length}`))
    return 1
  }
  return 0
}

function formatResObj(obj) {
  obj = JSON.stringify(obj)
  let objStr = ''
  if (isWin()) {
    objStr =  obj.replace(/","/g, '",\n  "').replace(/^{/, '{\n  ').replace(/}$/, '  \n}').replace(/\\\\/g, '\\')
  } else {
    objStr =  obj.replace(/","/g, '",\r\n  "').replace(/^{/, '{\r\n  ').replace(/}$/, '  \r\n}').replace(/\\\\/g, '\\')
  }
  return objStr
}

function parseStrWithComma(str, line) {
  try{
    let tmpArr = []
    if (str.includes('"')) {
      tmpArr = str.split('","')
    } else {
      tmpArr = str.split("','")
    }
    let [key, zh, en] = tmpArr
    key = key.slice(1)
    en = en.slice(0, en.length-1)
    return [key, zh, en]
  } catch(error) {
    console.log(chalk.red('error line: str', line + ':\n' + str))
  }
}

function isWin() {
  return  /win\d{2,}/.test(process.platform.toLocaleLowerCase())
}