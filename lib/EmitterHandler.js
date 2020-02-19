const { EventEmitter } = require('events')
const emitter = new EventEmitter()
const { save_new_web_service_from_optionsArgs,
    get_all_services_recorded,
    getServicefromOptionArgs } = require('./dbUtils')
const style = require('./colors')

const bye = () => {
    setTimeout(() => {
        console.log(style.colors.red + 'bye');
        process.exit(0)
    }, 500);
}

const askBinaryQuestion = (obj) => {
    return new Promise((resolve, reject) => {
        let { service, name, password, _id } = obj.modifiedService;
        process.stdout.write('service already exist ! do you wanna modifiy ?\n')
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            let chunk = process.stdin.read()
            let userInput = chunk.toLowerCase().trim()
            if (userInput == 'y' || userInput == 'yes') {
                let db = obj.collection
                db.findOneAndUpdate({
                    _id: _id
                }, {
                    $set: {
                        name: name,
                        password: password
                    }
                })
                    .then(res => {
                        console.log(res);

                        emitter.emit('close')
                    })
                    .catch(err => console.log(err))
            }
            else {
                emitter.emit('close')
            }
        })
    })
}

emitter.on('save', save_new_web_service_from_optionsArgs)
emitter.on('list', get_all_services_recorded)
emitter.on('get', getServicefromOptionArgs)
emitter.on('Y/N', askBinaryQuestion)

emitter.on('close', bye)

module.exports = { emitter }
