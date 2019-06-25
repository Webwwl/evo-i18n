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

let source = fs.readFileSync(path.join(__dirname, './i18n.csv'), {
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
      const res = parseStrWithComma(str)
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
  if(/["]/.test(str)) return 3
  const length = str.split(',').length
  if (length !== CONFIG.LENGHT) {
    console.log(chalk.yellow(`line ${currentLine} format error, lenght = ${length}`))
    return 1
  }
  return 0
}

function formatResObj(obj) {
  obj = JSON.stringify(obj)
  const objStr =  obj.replace(/","/g, '",\n  "').replace(/^{/, '{\n  ').replace(/}$/, '  \n}').replace(/\\\\/g, '\\')
  return objStr
}

// "xx,xx"这种
function parseStrWithComma(str) {
  const res = []
  const key = str.split(',')[0]
  res.push(key)
  str = str.slice(key.length + 1)
  // str = str.slice(1, str.length - 1)
  let startIndex = 0;
  let currentIndex = 0;
  while(currentIndex < str.length && currentIndex !== -1) {
    let start = 0;
    let end = 0;
    currentIndex = str.indexOf('"', currentIndex)
    if (currentIndex !== -1) {
      start = currentIndex
    }
    currentIndex = str.indexOf('"', start + 1)
    if (currentIndex !== -1)
    end = currentIndex
    currentIndex++
    let item = str.slice(start, end + 1)
    res.push(item.slice(1, item.length - 1))
  }
  return res
}