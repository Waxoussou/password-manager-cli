#!/usr/bin/env node
'use strict'
const readline = require('readline');
const { start_program } = require('../controller')
const { analyse_args } = require('../lib/utils');
const { emitter } = require('../lib/EmitterHandler')

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
            console.log(res);

            let argEvent = Object.keys(res)[0].split('--')[1];
            emitter.emit(argEvent, {
                argument: Object.keys(res),
                option: res[Object.keys(res)],
                event: emitter
            })
        })
        .then(rl.close())
        .catch(err => console.log(err))
}

