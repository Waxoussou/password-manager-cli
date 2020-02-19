const schema = require('./pattern')

exports.analyse_args = (args) => {
    return new Promise((resolve, reject) => {
        !Array.isArray(args) ?
            new Error('not an array ?') :
            resolve(bindOptionsArgs(args))

    })
}

const bindOptionsArgs = (args) => {
    let option, argument = [];
    args.map(arg => {
        (arg.includes('--') || arg.includes('-')) ?
            !option && (option = arg) :
            argument.push(arg)
        return { option, argument }
    })
    if (option) {
        const optionPattern = schema.options.includes(option) && schema.arg_schema[option]
        return argument.length != optionPattern.length ?
            process.stderr.write('missing arguments , try help to know more\n') :
            rangeOptionAndArguments(option, argument, optionPattern)
    }
}
const rangeOptionAndArguments = (option, argument, optionPattern) => {
    const pattern = optionPattern.pattern
    // option = option.split('--')[1]
    let list = {};
    for (let i = 0; i < pattern.length; i++) {
        list[pattern[i]] = argument[i]
    }
    return { [option]: list }
}

const isNotgoodOption = word => { return Promise.reject(new Error(word + ' not an available option')) }



