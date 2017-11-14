const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
    constructor(opts) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        // fs.mkdirSync(userDataPath+'\\tasks');
        this.path = path.join(userDataPath, 'tasks\\'+ opts.configName + '.json');
        this.data = parseDateFile(this.path, opts.defaults);
    }
    get(key) {
        return this.data[key];
    }
    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
}

function parseDateFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    }
}

//expose the class
module.exports = Store;