const { EventEmitter } = require('events')
const emitter = new EventEmitter()

const { displayHelp } = require('./utils')
const { save_new_web_service_from_optionsArgs,
    get_all_services_recorded, getServicefromOptionArgs,
    delete_service } = require('./dbUtils')

const style = require('./colors')

const bye = () => {
    setTimeout(() => {
        console.log(style.colors.red + 'Ending processus');
        process.exit(0)
    }, 500);
}

const askBinaryQuestion = (obj) => {
    process.stdout.write('service already exist ! do you wanna modifiy ? y/n\n');
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk = process.stdin.read()
        let userInput = chunk.toLowerCase().trim()
        if (userInput == 'y' || userInput == 'yes') {
            let { service, name, password, _id } = obj.modifiedService;
            let db = obj.collection
            db.updateOne({
                _id: _id
            }, {
                $set: {
                    name: name,
                    password: password
                }
            })
                .then(res => {
                    console.log(res.result);
                    res.result.nModified === 1
                        && process.stdout.write('service informations updated successfully\n')
                    emitter.emit('close')
                })
                .catch(err => {
                    console.log(err);
                })
        }
        else if (userInput == 'no' || userInput == 'n') {
            process.stdout.write('data were not modified \n')
            emitter.emit('close')
        }
        else {
            process.stdout.write(style.colors.red
                + 'did not get that, sorry\n'
                + style.reset)
            process.stdout.write(style.backgroundColors.green
                + style.colors.red
                + 'modify existing data, y/n ?'
                + style.reset + '\n')
            process.stdin.read()
        }
    })
}

emitter.on('save', save_new_web_service_from_optionsArgs)
emitter.on('list', get_all_services_recorded)
emitter.on('get', getServicefromOptionArgs)
emitter.on('delete', delete_service)
emitter.on('Y/N', askBinaryQuestion)
emitter.on('help', displayHelp)
emitter.on('close', bye)

module.exports = { emitter }
