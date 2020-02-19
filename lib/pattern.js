module.exports = {
    options: ['--save', '--list', '--get', '--delete'],
    shorthands: {
        save: '-s',
        list: '-L',
        get: '-G',
        delete: '-D'
    },
    arg_schema: {
        '--save': {
            pattern: ['service', 'username', 'password'],
            length: 3,
            emitter : 'save' 
            // return: null
        },
        '--get': {
            pattern: ['service'],
            length: 1,
            // return: ['username', 'password']
        },
        '--list': {
            pattern: [],
            length: 0,
            return: ['array_Of_All_Service_name']
        }
    }
}