const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '< show can I help ? >'
});

const { getContentToSave, serviceRequested } = require('./lib/utils');
const { colors, reset } = require('./lib/colors');
const schema = require('./lib/pattern');

exports.start_program = (argv) => {
    if (argv.length > 0) { return Promise.resolve(argv) };
    return new Promise((resolve, reject) => {
        rl.prompt();
        rl.on('line', line => {
            line = line.trim().toLowerCase();
            dispatcher(line)
                .then(res => {
                    let args = Array.isArray(res) ? ['--' + line, ...res] : ['--' + line]
                    resolve(args)
                })
                .catch(err => {
                    console.log(err)
                    process.stdout.write('\x1B[31mtry again ! \n' + reset)
                })
        });
    });
}

const dispatcher = (line) => {
    if (!schema.arg_schema['--' + line]) {
        return Promise.resolve({ err: 'not a valid command ...\n', readline: rl })
    };
    const { pattern } = schema.arg_schema['--' + line];
    if (pattern.length == 0) { return Promise.resolve(line) };
    if (line == 'save') { return getContentToSave(rl) };
    if (line == 'get' || line == 'delete') { return serviceRequested(rl) };
}

