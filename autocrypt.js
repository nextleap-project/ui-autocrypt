// javascript implementation of essential Autocrypt UI

provider = localStorageProvider;

user = 'User';

// setup during initialization
ui = {};



replying_to = undefined;

setup_page = function() {
    ui = userInterface();
    ui.setup();

    switchuser(Object.keys(storage)[0]);
    ui.pane('list');
    ui.update_description();
};

autocrypt_switch = function(enabled) {
    autocrypt['enabled'] = enabled;
    if (enabled) {
        if (autocrypt['key'] === undefined)
            autocrypt['key'] = String(Math.random());
    }
    self_sync_autocrypt_state();
};

self_sync_autocrypt_state = function() {
    if (autocrypt['enabled']) {
        autocrypt['state'][user] = {
            'date': new Date(),
            'key': autocrypt['key'],
            'prefer-encrypted': autocrypt['prefer-encrypted']
        };
    } else {
        autocrypt['state'][user] = {
            'date': new Date()
        };
    }
};


changeuser = function() {
    names = Object.keys(storage);
    index = -1;
    for (var x in names) {
        if (names[x] == user) {
            index = x;
        }
    }
    newindex = (Number(index) + 1) % (names.length);
    switchuser(names[newindex]);
    return false;
};

switchuser = function(name) {
    user = name;
    autocrypt = storage[name]['autocrypt']
    messages = [];
    provider.reload(name)
    ui.switchuser(name)
};

adduser = function(username, color) {
    lc = username.toLowerCase();
    if (storage[lc] == undefined) {
        storage[lc] = {
            'name': username,
            'color': color,
            'autocrypt': {
                'enabled': false,
                'state': {}
            }
        };
    }
};

autocryptheader = function() {
    if (autocrypt['enabled'] == false)
        return undefined;
    return { 'key': autocrypt['key'],
             'prefer-encrypted': autocrypt['prefer-encrypted']
           };
};

indent = function(str) {
    return str.split('\n').map(function(y) { return "> " + y; }).join('\n');
};

addmail = function(to, subj, body, encrypted) {
    var msg = { 'from': storage[user]['name'],
            'to': to,
            'subject': subj,
            'body': body,
            'encrypted': encrypted,
            'autocrypt': autocryptheader(),
            'date': new Date()
              };
    provider.send(msg);
    return true;
};

provider.receive = function(msg) {
    acupdate(msg)
    messages.push(msg);
};

getacforpeer = function(peer) {
    var ac = autocrypt['state'][peer.toLowerCase()];

    if (ac === undefined)
        ac = { 'date': new Date("1970") };
    return ac;
};

acupdate = function(msg) {
    var peer = msg['from'];
    var ac = getacforpeer(peer);
    var newac = {
        'date': msg['date']
    };
    if (msg['autocrypt'] === undefined) {
    } else {
        newac['prefer-encrypted'] = msg['autocrypt']['prefer-encrypted'];
        newac['key'] =  msg['autocrypt']['key'];
    };
    if (ac['date'].getTime() < newac['date'].getTime()) {
        autocrypt['state'][peer.toLowerCase()] = newac;
    }
};

function resetClient() {
    // client state for all clients is stored here:
    storage = {};

    // messages for the current user
    messages = [];

    // autocrypt state for the current user
    autocrypt = {};
    adduser('Alice', 'green');
    adduser('Bob', 'darkorange');
};

resetClient();

