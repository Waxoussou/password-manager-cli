const { EventEmitter } = require('events')
const emitter = new EventEmitter()
const { save_new_web_service_from_optionsArgs, get_all_services_recorded } = require('./dbUtils')

const bye = ( )=> {
    console.log('bye');
    process.exit(0)
    
}

emitter.on('save', save_new_web_service_from_optionsArgs)
emitter.on('list', get_all_services_recorded)
emitter.on('close', bye)

module.exports = { emitter }
