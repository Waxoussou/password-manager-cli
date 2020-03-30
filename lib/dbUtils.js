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
                console.log(style.colors.red + err);
                argsOpt.event.emit('close')
            })
    })
}
exports.save_new_web_service = (rl) => {
    // Use connect method to connect to the server
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        return new Promise((success, reject) => {
            let resp = {}
            rl.question('service ?', (answer) => {
                resp.service = answer
                rl.question('usr_name ?', (usr_name) => {
                    resp.username = usr_name
                    rl.question('password ?', (pwd) => {
                        resp.pwd = pwd
                        success(resp)
                    })
                })
            })
        })
            .then(res => {
                let { service, username, pwd } = res
                pwd = encrypt(pwd)
                // Store hash in your password DB.
                db.collection(collection).insertOne({
                    service: service,
                    name: username,
                    password: pwd
                })
                    .then(res => {
                        client.close(console.log(style.colors.blue + 'Saved : Db connection closed' + style.reset))
                        rl.prompt()
                    })
                    .catch(error => console.log(error))
            })
            .catch(err => console.log(err))
    })
}

exports.get_all_services_recorded = (rl) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server\n");
        const db = client.db(dbName);
        db.collection(collection).find({}, { projection: { _id: 0, service: 1 } }).toArray()
            .then(res => res.map(result => {
                if (result.service) {
                    process.stdout.write(`${style.colors.yellow}--<${style.move.forward(5)}${result.service}${style.reset}\n`)
                }
            }))
            .then(res => {
                client.close();
                !rl.event ? rl.prompt() : rl.event.emit('close')
            })
            .catch(err => console.log(err))
    })
}

exports.get_service_credentials = (rl) => new Promise((resolve, reject) => {
    rl.question('what service credentials do you require to consult ?', answer => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
            if (err) console.log(err)
            console.log("Connected successfully to server\n");
            const db = client.db(dbName);
            db.collection(collection).findOne({ service: answer }, { projection: { _id: 0 } })
                .then(res =>
                    // decrypt(res.pwd)
                    console.log(decrypt(res.pwd))
                )
                .then(res => {
                    client.close();
                    rl.prompt()
                })
        })
    })
})