module.exports = {
    Readme: `
        Save-CLI is a command-line-tool that let your encrypt 
        and save yours web passwords on a local MongoDb Database 
        and retrieve them easily.
        App was develop with less dependencies as possible 
        but node.js (and mongoDb Driver for node.js obviously)`,
    options: ['--save', '--list', '--get', '--delete', '--help'],
    shorthands: {
        save: '-s',
        list: '-L',
        get: '-G',
        delete: '-D',
        help: '-h'
    },
    arg_schema: {
        '--save': {
            pattern: ['service', 'username', 'password'],
            length: 3,
            emitter: 'save',
            description: "save a new service",
            example: "--save <service name> <username> <password>"
        },
        '--get': {
            pattern: ['service'],
            length: 1,
            description: "get credentials of a registered service"
        },
        '--list': {
            pattern: [],
            length: 0,
            description: 'list of al services registered'
        },
        '--delete': {
            pattern: ['service'],
            length: 1,
            description: "delete a registered service",
            example: "--delete <service name>"
        },
        '--help': {
            pattern: [],
            length: 0,
            description: "display list of commands",
            example: "--help"
        }
    }
}