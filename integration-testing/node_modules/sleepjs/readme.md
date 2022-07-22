# SleepJS

[![Build Status](https://travis-ci.org/simsieg/sleepjs.svg?branch=master)](https://travis-ci.org/simsieg/sleepjs) [![Coverage Status](https://coveralls.io/repos/github/simsieg/sleepjs/badge.svg?branch=master)](https://coveralls.io/github/simsieg/sleepjs?branch=master) [![Downloads](https://img.shields.io/npm/dm/sleepjs.svg)](https://img.shields.io/npm/dm/sleepjs.svg)  <br />

Asynchronus sleep functions with typescript support.

## Installation

Install sleepjs with npm:

```bash
npm install sleepjs
```

Or with yarn:

```bash
yarn add sleepjs
```

## Usage

The default function sleeps for a time given in milliseconds.
But also different sleep functions can be required.

### Async / Await

The sleep timer can be awaited with async / await.

```javascript
const { sleep } = require('sleepjs')

const myFunction = async () => {
  await sleep(500)
  console.info('It is 500 ms later now')
}

myFunction()
```

### Promise

The Promise returns the value of slept milliseconds when it resolves.

```javascript
const { sleepMinutes } = require('sleepjs')

function myFunction () {
  return sleepMinutes(5)
    .then(time => {console.info(`${time} ms later`)})
}

myFunction() // Will print: '300000 ms later'
```

### Concurrent

Different sleep instances can be run and awaited concurrently with `Promise.all`.

```javascript
const { sleep } = require('sleepjs')

async function myFunction () {
  await Promise.all([sleep(100), sleep(100), sleep(200)])
}

myFunction() // Will take only slightly more than 200 ms
```

## Functions

Sleepjs includes several functions to wrap common sleep times:

```javascript
const { sleep } = require('sleepjs')
const { sleepMilliseconds } = require('sleepjs') // Same as sleep
const { sleepSeconds } = require('sleepjs')
const { sleepMinutes } = require('sleepjs')
const { sleepHours } = require('sleepjs')
const { sleepDays } = require('sleepjs')
```

Import with typescript is also possible.

```typescript
import {
  sleep,
  sleepMilliseconds,
  sleepSeconds,
  sleepMinutes,
  sleepHours,
  sleepDays,
} from 'sleepjs'
```
