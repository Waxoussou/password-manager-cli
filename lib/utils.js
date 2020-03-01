const schema = require('./pattern')
const style = require('./colors')

exports.analyse_args = (args) => {
    return new Promise((resolve, reject) => {
        !Array.isArray(args) ?
            reject(new Error('not an array ?')) :
            resolve(bindOptionsArgs(args))
    })
}

exports.displayHelp = () => {
    process.stdout.write(`${style.colors.blue}${style.backgroundColors.green}${schema.Readme}${style.reset}\n\n`)
    process.stdout.write(`${style.colors.green}options :${style.reset}\n`)
    for (const option in schema.arg_schema) {
        let { description, example } = schema.arg_schema[option]
        description && process.stdout.write(style.move.forward(3) + option + style.move.forward(10) + description + '\n')
        example && process.stdout.write(
            `${style.backgroundColors.blue}${style.move.forward(3)}utilisation${style.move.forward(3)}  ${example}  ${style.reset}`
            + '\n');
        process.stdout.write('\n')
    }
}

const bindOptionsArgs = (args) => {
    let option, argument = [];
    // Check if args contains options and separate options from arguments
    args.map(arg => {
        (arg.includes('--') || arg.includes('-')) ?
            !option && (option = arg) :
            argument.push(arg)
        return { option, argument }
    })
    if (!option) {
        // if no option declared, inform user that it is mandatory if arguments are declared
        throw new Error(`need to indicate an option to use before arguments,${style.reset}
Options declaration start with  '--'  or shorthanded '-'.
You can try the command --help for further informations`)
    } else {
        const isOptionShort = option.match(/^-[a-zA-Z]$/) ? true : false
        if (isOptionShort) {
            for (const shortOption in schema.shorthands) {
                const short_command = schema.shorthands[shortOption]
                if (option == short_command) { option = '--' + shortOption }
            }
        }
        // check if option/argument pattern is correct according to pattern lib file <pattern.js>
        const optionPattern = schema.options.includes(option) && schema.arg_schema[option]
        // if does not correspond to any pattern, throw error
        if (!optionPattern) {
            throw new Error(`option does not exist, refer to --help if needed`)
        }
        return argument.length != optionPattern.length ?
            // check if nb of arguments required for its pattern is ok or write an error 
            process.stderr.write('missing arguments , try help to know more\n') :
            rangeOptionAndArguments(option, argument, optionPattern)
    }
}
const rangeOptionAndArguments = (option, argument, optionPattern) => {
    /**
     * prepare format data in order to be used emit event according to corresponding pattern
     * return object {option : [arguments]} 
     */
    const pattern = optionPattern.pattern
    let list = {};
    for (let i = 0; i < pattern.length; i++) {
        list[pattern[i]] = argument[i]
    }
    return { [option]: list }
}

const isNotgoodOption = word => { return Promise.reject(new Error(word + ' not an available option')) }



