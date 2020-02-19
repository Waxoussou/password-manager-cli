const { save_new_web_service,
    get_service_credentials,
    get_all_services_recorded } = require('./lib/dbUtils')
const { colors, reset } = require('./lib/colors')

exports.start_program = (rl) => {
    rl.prompt();
    rl.on('line', line => {
        line = line.trim().toLowerCase()
        switch (line) {
            case 'save':
                save_new_web_service(rl)
                break;
            case 'read':
                console.log(colors.blue + line + reset);
                get_service_credentials(rl)
                break;
            case 'list':
                console.log(colors.blue + line + reset);
                get_all_services_recorded(rl)
                break;
            case 'delete':
                console.log(colors.red + line + reset);

                break;
            case 'update':
                console.log(colors.green + line + reset);
                break;
            case 'help':
                process.stdout.write('options : \n save, \n read, \n delete, \n update')
                rl.prompt()
                break;
            case 'exit':
                let count = 0;
                setInterval(() => {
                    count++
                    process.stdout.write('.')
                    if (count === 30) {
                        process.stdout.write('\n \x1B[31mbye \n')
                        process.exit(0)
                    }
                }, 50);
                break;
            default:
                process.stdout.write('\x1B[31mtry again ! \n' + reset)
                rl.prompt()
                break;
        }
    })
}