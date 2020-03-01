#!/usr/bin/env node
'use strict'
const readline = require('readline');
const { start_program } = require('../controller')
const { analyse_args } = require('../lib/utils');
const { emitter } = require('../lib/EmitterHandler')
const style = require('../lib/colors')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '< show can I help ? >'
});
const args = process.argv.slice(2)

if (args.length === 0) {
    start_program(rl)
}
else {
    analyse_args(args)
        .then(res => {
            if (typeof res == 'object') {
                let argEvent = Object.keys(res)[0].split('--')[1];
                console.log(argEvent);
                
                emitter.emit(argEvent, {
                    argument: Object.keys(res),
                    option: res[Object.keys(res)],
                    event: emitter
                })
            } 
            // else if (res == undefined) {
            //     throw ('need to indicate an option to use before declaring arguments')
            // }
        })
        .then(rl.close())
        .catch(err => process.stdout.write('\n'
            + style.backgroundColors.red
            + err
            + style.reset
            + '\n\n'))
}

