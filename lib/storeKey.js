const fs = require('fs');

const root_dir = process.cwd(),
    targ_dir = '/keeper/',
    file = 'keyKeeper.txt'

const path = root_dir + targ_dir

// LIST  ALL FILES WITHIN A DIR With readdir 
// const rd = () => fs.readdir(targ_dir, function (err, items) {
//     for (var i = 0; i < items.length; i++) {
//         console.log(items[i]);
//     }
// });

module.exports = {
    store: (id, key) => {
        const keeper = { id, key }
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
        return new Promise((resolve, reject) => {
            fs.readFile(path + file, (err, data) => {
                if (err) console.log(err)
                let res = JSON.parse(data)
                const target = res.K_list.filter(el => el.id == id)
                if (!target) reject();
                resolve(target[0].key)
            })
        })
    },
    remove: (id) => {
        console.log(id);
        return new Promise((resolve, reject) => {
            fs.readFile(path + file, (err, data) => {
                if (err) console.log(err)
                let res = data.toString('latin1')

                const iref = res.indexOf(id)
                let istart = res.lastIndexOf('{', iref),
                    iend = res.indexOf('}', iref) + 1;

                if (res[iend] == ']' && res[istart] !== '[') {
                    fs.unlink(path + file, (err) => {
                        if (err) throw err;
                        console.log('pwd key deleted successfully');
                    });
                }
                if (res[iend] == ']') { istart--; iend-- }

                let str = ''
                for (let i = istart; i <= iend; i++) str += res[i]
                res = res.split(str).join('')
                fs.writeFile(path + file, res, 'latin1', (err) => {
                    if (err) throw err;
                    resolve()
                })
            })
        })
    }
}