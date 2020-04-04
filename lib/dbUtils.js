const MongoClient = require('mongodb').MongoClient;
const { url, dbName, collection, saltRounds } = require('../config/config')
const keyStorer = require('./storeKey');
const { encrypt, decrypt } = require('./crypto')
const style = require('./colors')

const checkIfServiceExist = (contacts, service) => {
    return contacts.findOne({ service: service })
        .then(res => res ? res : null)
        .catch(err => console.log(err))
}

exports.save_new_web_service_from_optionsArgs = (argsOpt) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const { service, username, password } = argsOpt.option
        console.log(argsOpt);

        const { iv, encryptedData, key } = encrypt(password)
        const pwd = iv + '_' + encryptedData;

        // Store hash in your password DB.
        const contacts = db.collection(collection)
        checkIfServiceExist(contacts, service, username)
            .then(res => {
                // if already exist ask user if wants to update actual user
                return res ? argsOpt.event.emit('Y/N', {
                    collection: contacts,
                    modifiedService: {
                        _id: res._id,
                        service: service,
                        name: username,
                        password: pwd
                    }
                })
                    : contacts.insertOne({ //if does not exist we save it 
                        service: service,
                        name: username,
                        password: pwd
                    }, (err, doc) => {
                        if (err) console.log(err)
                        // STORE KEY ON A FILE WITH Doc_id
                        const { _id, service, name } = doc.ops[0]
                        keyStorer.store(_id, key)
                        console.log(' Success, new service registered :: ', service, name)
                        argsOpt.event.emit('close')
                    })
            })
            .catch(err => console.log('emitter error ???', err))
    })
}

exports.getServicefromOptionArgs = (argsOpt) => {
    const { service } = argsOpt.option
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server\n");
        const db = client.db(dbName);
        db.collection(collection).findOne({ service: service } /*, { projection: { _id: 0 } }*/)
            .then(res => {
                if (!res) {
                    throw new Error('no service found\n')
                }
                const [iv, encryptedData] = res.password.split('_')
                keyStorer.get(res._id)
                    .then(key => {
                        let obj = { iv, encryptedData, key };
                        console.log('Password is : ' + style.colors.yellow + decrypt(obj) + style.reset)
                        argsOpt.event.emit('close')
                    })
            })
            .catch(err => {
                console.log(style.colors.red + err + style.reset);
                argsOpt.event.emit('close')
            })
    })
}

exports.get_all_services_recorded = (rl) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server\n");
        const db = client.db(dbName);
        db.collection(collection).find({}, { projection: { _id: 0, service: 1 } }).toArray()
            .then(res => res.map((result, index) => {
                if (result.service) {
                    process.stdout.write(`${style.colors.yellow}${result.service}${style.move.forward(10)}${style.reset}`);
                    (index + 1) % 3 == 0 && process.stdout.write('\n')
                }
            }) &
                process.stdout.write('\n\n Total of ' + res.length + ' results \n\n')
            )
            .then(res => {
                client.close();
                !rl.event ? rl.prompt() : rl.event.emit('close')
            })
            .catch(err => console.log(err))
    })
}

exports.delete_service = argsOpt => {
    const { service } = argsOpt.option
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server\n");
        const db = client.db(dbName);

        db.collection(collection).findOneAndDelete({ service: service }, (err, ref) => {
            if (err || !ref.value) {
                throw new Error('no service found\n', err)
            }
            const { _id } = ref.value
            keyStorer.remove(_id)
                .then(() => {
                    console.log('Password for ' + style.colors.yellow + service + ' ' + style.reset + 'DELETED SUCCESSFULY')
                    argsOpt.event.emit('close')
                })
                .catch(err => console.log(err))

            // const [iv, encryptedData] = res.password.split('_')
        })
    })
} 