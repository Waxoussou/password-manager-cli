#!/usr/bin/env node
'use strict'

const { start_program, dispatcher } = require('../controller');
const { analyse_args } = require('../lib/utils');
const { emitter } = require('../lib/EmitterHandler')
const style = require('../lib/colors')
const args = process.argv.slice(2)

start_program(args)
    .then(res => {
        analyse_args(res)
            .then(res => {
                if (typeof res == 'object') {
                    let argEvent = Object.keys(res)[0].split('--')[1];
                    emitter.emit(argEvent, {
                        argument: Object.keys(res),
                        option: res[Object.keys(res)],
                        event: emitter
                    })
                }
            })
        .catch(err => {
            emitter.emit('help')
            err.readline.close()
        })
    })
    .catch(err => process.stdout.write('\n'
        + style.backgroundColors.red
        + err
        + style.reset
        + '\n\n'))

