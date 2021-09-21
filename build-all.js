let fs = require('fs');
let child_process = require('child_process');
let archiver = require('archiver');

let { version, name } = require('./package.json');

if (fs.existsSync('./builds')) { fs.rmSync('./builds', { recursive: true }) }
fs.mkdirSync('./builds');

//node build.js builds --minify --overwrite --exe --target=windows-x64-6.11.2
let targets = {
    windows: 'windows-x64-12.16.2',
    linux: 'linux-x64-12.16.2',
    mac: 'mac-x64-12.16.2'
}

async function arc(src, out, name, ext) {
    let archive = archiver(ext);
    archive.pipe(fs.createWriteStream(`${out}/${name}.${ext}`));
    archive.directory(`${src}/${name}`, name);
    await archive.finalize();
}

(async () => {
    for (let t in targets) {
        console.log(`building for ${t} @ ${targets[t]}...`);
        child_process.execSync(`node build.js builds/${name}-${t}-v${version} --minify --overwrite --exe --target=${targets[t]}`, { stdio: [ null, null, null ] });
    
        await arc('builds', 'builds', `${name}-${t}-v${version}`, t == 'linux' ? 'tar' : 'zip');
        fs.rmSync(`./builds/${name}-${t}-v${version}`, { recursive: true });
    }
    
    console.log('\ndone!');
})();