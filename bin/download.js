'use strict'

// const http = require('http')
const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'INPUT>'
});

rl.prompt()
rl.on('line', (line) => {
    switch (line) {
        case 'DLD':
            fs.stat(__dirname + '/test.html', (err, stat) => {
                if (err) rl.write(err)
                let byte = 0
                let file_size = stat.size
                const stream = fs.createReadStream(__dirname + '/test.html')
                stream.on('data', (chunck) => {
                    let cmd = byte > 1 ? '\x1B[1F' : ''
                    byte += chunck.length
                    let percent = ((byte / file_size) * 100).toFixed(2)
                    let color = percent > 50 ? '\x1B[32m' : '\x1B[31m'
                    process.stdout.write(`${cmd}${color}${percent}%\n`)

                })
                stream.on('end', () => {
                    process.stdout.write('\x1B[32\x1B[30;43m ################ end of program ############## \x1B[0m' + '\n')
                    rl.prompt()
                })
            })
            break;
        case 'exit':
            rl.setPrompt('')
            let count = 0;
            setInterval(() => {
                count++
                process.stdout.write('.')
                if (count === 30) {
                    process.stdout.write('\n \x1B[31mbye \n')
                    process.exit(0)
                }
            }, 100);
        default:
            process.stdout.write('didnt get that ? ')
            rl.prompt()
            break;
    }
})


