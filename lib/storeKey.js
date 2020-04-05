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
                        fs.writeFile(err.path, '{"K_list":[' + JSON.stringify(keeper) + ']}', 'utf8', (error) => {
                            if (error) console.log(error)
                        }) :
                        console.log(err)
                }
                let start_index = stats.size > 2 ? stats.size - 2 : 0

                let writeStream = fs.createWriteStream(`${path}${file}`, { flags: 'a+', encoding: 'utf8', start: start_index })
                !start_index ?
                    writeStream.write('{"K_list":[' + JSON.stringify(keeper) + ']}') :
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
                let res = data.toString('utf8')
                const iref = res.indexOf(id)
                if (iref == -1) { reject(new Error('id not found in DB file')) }

                let istart = res.lastIndexOf('{', iref),
                    iend = res.indexOf('}', iref) + 1;
                console.log(res[istart - 1] + ' ' + res[iend]);
                if (res[istart - 1] == '[' && res[iend] == ']') {

                    fs.unlink(path + file, (err) => {
                        if (err) reject(err);
                        process.stdout.write('pwd key deleted successfully\n');
                        process.exit(1)
                    });
                }
                if (res[iend] == ']') { istart--; iend-- }
                let str = ''
                for (let i = istart; i <= iend; i++) str += res[i]
                res = res.split(str).join('').toString()
                fs.writeFile(path + file, res, (err) => {
                    if (err) throw err;
                    resolve('done')
                })
            })
        })
    }
}