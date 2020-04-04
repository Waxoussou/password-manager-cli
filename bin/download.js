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
            fs.stat(__dirname + '/test.json', (err, stat) => {
                if (err) rl.write(err)
                console.log(stat.size)
                let byte = 0
                let file_size = stat.size
                const stream = fs.createReadStream(__dirname + '/test.json')
                stream.on('data', (chunck) => {
                    if (chunck.lastIndexOf('name')) console.log(chunck.lastIndexOf('name'))
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
        case 'test':
            const args = process.argv && process.argv[2]
            fs.open(__dirname + '/test.json', 'a+', (err, fd) => {
                if (err) { throw new Error('no file found') }
                let content = { name: 'name', word: 'word' }
                var buffr = Buffer.from(JSON.stringify(content));
                console.log(buffr);
                fs.write(fd, buffr, 0, 'utf8', (err) => {
                    if (err) throw err;
                    console.log('succes');

                    // Close the opened file.
                    fs.close(fd, (err) => {
                        if (err) throw err;
                    });
                })
            })
            break;
        case 'buffer':
            const bufferText = Buffer.from('\b' + ' hello world', 'ascii'); // or Buffer.from('hello world')
            console.log(bufferText); // <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>

            const text = bufferText.toString('hex');
            // To get hex
            console.log(text); // 68656c6c6f20776f726c64

            console.log(bufferText.toString()); // or toString('utf8')
            // hello world

            //one single line
            Buffer.from('hello world').toString('hex')

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


