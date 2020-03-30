const fs = require('fs');

const root_dir = process.cwd()
const targ_dir = '/keeper/'
const file = 'keyKeeper.txt'

module.exports = {
    store: (id, key) => {
        const keeper = { id, key }
        const path = root_dir + targ_dir

        fs.opendir(path, (err, dir) => {
            if (err) {
                err.code == 'ENOENT' ?
                    fs.mkdir(path, (err) => {
                        if (err) console.log(err)
                    }) :
                    console.log(err)
            }

            // must check if file exist 
            // if yes => check if file is not empty 
            //  --------  then append Data
            // if not => create and write : {{data}}
            fs.stat(path + file, (err, stats) => {
                if (err) {
                    return err.code == 'ENOENT' ?
                        fs.writeFile(err.path, keeper, (error) => {
                            if (error) console.log(error)
                        }) :
                        console.log(err)
                }
                let start_index = stats.size > 2 ? stats.size - 2 : 0

                let writeStream = fs.createWriteStream(`${path}${file}`, { flags: 'a+', encoding: 'latin1', start: start_index })
                !start_index ?
                    writeStream.write('{"K_list": [' + JSON.stringify(keeper) + ']}') :
                    writeStream.write(',' + JSON.stringify(keeper) + ']}')
                writeStream.close()
            })
        })

    },
    get: (id) => {

        const path = root_dir + targ_dir
        return new Promise((resolve, reject) => {
            fs.readFile(path + file, (err, data) => {
                if (err) console.log(err)
                let res = JSON.parse(data)
                const target = res.K_list.filter(el => el.id == id)
                if (!target) reject();
                resolve(target[0].key)
            })
        })
    }
}