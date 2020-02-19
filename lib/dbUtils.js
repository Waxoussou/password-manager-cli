const MongoClient = require('mongodb').MongoClient;
const { url, dbName, collection, saltRounds } = require('../config/config')
const { encrypt, decrypt } = require('./crypto')

exports.save_new_web_service_from_optionsArgs = (argsOpt) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) console.log(err)
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        const { service, username, password } = argsOpt.option
        const pwd = encrypt(password)
        // Store hash in your password DB.
        db.collection(collection).insertOne({
            service: service,
            name: username,
            password: pwd
        })
            .then(argsOpt.event.emit('close'))
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
                const { service, username, pwd } = res
                const password = encrypt(pwd)
                // Store hash in your password DB.
                db.collection(collection).insertOne({
                    service: service,
                    name: username,
                    pwd: password
                })
                    .then(res => {
                        client.close(console.log('Saved : Db connection closed'))
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
            .then(res => res.map(result => { if (result.service) { console.log(result.service) } }))
            .then(res => { client.close(); rl.prompt() })
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