let DEV = true;

let fs = require('fs');
let http = require('http');
let path = require('path');

let DIRNAME = __dirname;

let express = require('express');

let app = express();

if (!fs.existsSync('./config.json')) {
    if (fs.existsSync('./config.example.json')) { fs.copyFileSync('./config.example.json', './config.json') }
    else { return console.log(`config.json and config.example.json do not exist! exiting...`) }
}

let config = require('./config.json');

let root = config.root;
let port = config.port;

let clean = (path) => {
    path = path.split('\\').join('/');
    while (path.startsWith('/')) { path = path.slice(1) }
    while (path.endsWith('/')) { path = path.slice(0, -1) }

    return path;
}

let handle = (raw) => {
    let path = clean(unescape(raw));
    if (exists(path)) { return path }
    else { return null }
}

// all of these functions will assume that path has already been cleansed by clean()

let exists = (path) => {
    let split = path.split('/');
    if (split[0] == '$RECYCLE.BIN' || split[0] == 'System Volume Information') { return false }
    
    return fs.existsSync(`${root}/${path}`);
}

let type = (path) => {
    let stats = fs.statSync(`${root}/${path}`);
    
    if (stats.isFile()) { return 'FILE' }
    if (stats.isDirectory()) { return 'DIRECTORY' }

    return null;
}

let directory = (path) => {
    let dir = fs.readdirSync(`${root}/${path}`);
    if (path == '') { dir = dir.filter(d => !['$RECYCLE.BIN', 'System Volume Information'].includes(d)) }
    return dir;
}

let size = (path) => {
    let isDir = type(path) == 'DIRECTORY';

    if (isDir) {
        let total = 0;
        let dir = directory(path);
        for (let d = 0; d < dir.length; d++) {
            if (exists(`${path}/${dir[d]}`)) { total += size(`${path}/${dir[d]}`) }
        }

        return total;
    }

    else {
        let stats = fs.statSync(`${root}/${path}`);
        return stats.size;
    }
}

// cleans the root path
root = clean(root);
if (!fs.existsSync(root)) { fs.mkdirSync(root) }

// sends pathless requests to the root of the filepath handling
app.get('/', (request, response) => {
    response.redirect('/f/');
    //console.log(getInfo('dolphin/Nintendo Wii'));
    //response.send(fs.readFileSync(`./index.html`).toString());
});

// handling filepaths
app.get('/f/*', (request, response) => {
    let path = handle(request.params[0]);

    if (path != null) {
        let index = fs.readFileSync(`${DIRNAME}/index.html`).toString();

        if (DEV) {
            let components = fs.readdirSync(`${DIRNAME}/components`);
            let scripts = components.map(c => `<script src="/c/${c}"></script>`);
            
            let css = fs.readdirSync(`${DIRNAME}/public/css`);
            let filtered = css.filter(c => !c.endsWith('.css.map'));
            let links = filtered.map(c => `<link rel="stylesheet" type="text/css" href="/public/css/${c}">`);

            index = index
                .replace('[[scripts]]', scripts.join('\n'))
                .replace('[[styles]]', links.join('\n'));
        }

        response.send(index);
    }

    else { response.sendStatus(404) }
});

// raw
app.get('/r/*', (request, response) => {
    let path = handle(request.params[0]);

    if (path != null) { response.sendFile(`${root}/${path}`) }
    else { response.sendStatus(404) }
});

// api
app.get('/a/size/*', (request, response) => {
    let path = handle(request.params[0]);
    
    if (path != null) { response.json({ result: size(path) }) }
    else { response.sendStatus(404) }
});

app.get('/a/directory/*', (request, response) => {
    let path = handle(request.params[0]);

    if (path != null) {
        if (type(path) == 'DIRECTORY') {
            response.json(
                directory(path).map(d => {
                    return {
                        type: type(`${path}/${d}`),
                        name: d
                    }
                })
            );
        }
        else { response.sendStatus(400) }
    }

    else { response.sendStatus(404) }
})

app.get('/public/*', (request, response) => {
    let path = `${DIRNAME}/public/${unescape(request.params[0])}`;
    if (fs.existsSync(path) && fs.statSync(path).isFile()) { response.sendFile(path) }
});

// for dev purposes only
// [disabled during production]
if (DEV) {
    // handling components
    app.get('/c/*', (request, response) => {
        if (fs.existsSync(`${DIRNAME}/components/${request.params[0]}`)) {
            let stats = fs.statSync(`${DIRNAME}/components/${request.params[0]}`);
            if (stats.isFile()) { response.sendFile(`${DIRNAME}/components/${request.params[0]}`) }

            else { response.sendStatus(404) }
        }
    });

    // handling sass (for debugging css)
    app.get('/sass/*', (request, response) => {
        let path = `${DIRNAME}/sass/${unescape(request.params[0])}`;
        if (fs.existsSync(path) && fs.statSync(path).isFile()) { return response.sendFile(path) }
        response.sendStatus(404);
    });
}

http.createServer(app).listen(port, () => { console.log(`server hosted at http://localhost:${port}`) });