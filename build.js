let fs = require('fs');
let child_process = require('child_process');

let minify = require('minify');
let nexe = require('nexe');

let args = process.argv;
args.shift(); // node.exe
args.shift(); // build.js

let build_directory = './build';

if (!args[0].startsWith('--')) { build_directory = args[0].split('\\').join('/') }

child_process.execSync('npm run _compile_sass');

let minified = args.includes('--minify');
let overwrite = args.includes('--overwrite');
let exe = args.includes('--exe');

let target = args.filter(a => a.startsWith('--target='));
if (target.length > 0) { target = target[0].split('--target=')[1] }
else { target = null }

if (fs.existsSync(build_directory)) {
    if (build_directory == './build' || overwrite) { fs.rmSync(build_directory, { recursive: true }) }
    else { return console.log(`a folder with that path already exists! please remove it or specify a different path!`) }
}

fs.mkdirSync(build_directory);

fs.cpSync(`./public`, `${build_directory}/public`, { recursive: true });

// css
let css_files = () => {
    fs.rmSync(`${build_directory}/public/css`, { recursive: true });

    let css = fs.readdirSync('./public/css').map(c => {
        // excludes css map files
        if (!c.endsWith('.css.map')) { return fs.readFileSync(`./public/css/${c}`).toString() }
    });
    
    fs.writeFileSync(`${build_directory}/public/styles.css`, css.join('\n'));
}

// js
let js_files = () => {
    let js = fs.readdirSync('./components').map(j => fs.readFileSync(`./components/${j}`).toString());
    fs.writeFileSync(`${build_directory}/public/components.js`, js.join('\n'));
}

// html
let html_files = () => {
    let html = fs.readFileSync('./index.html').toString()
        .replace('[[styles]]', '<link rel="stylesheet" type="text/css" href="/public/styles.css">')
        .replace('[[scripts]]', '<script src="/public/components.js"></script>');

    fs.writeFileSync(`${build_directory}/index.html`, html);
}

// config, entrypoint, package.json
let package_utils = () => {

    let config_path = 'config.example.json';

    if (fs.existsSync('./config.json')) { config_path = 'config.json' }
    fs.copyFileSync(`./${config_path}`, `${build_directory}/config.json`);

    let index = fs.readFileSync('./index.js').toString().replace('let DEV = true;', 'let DEV = false;');

    if (exe) { index = index.replace('let DIRNAME = __dirname;', 'let DIRNAME = path.dirname(process.execPath);') }

    fs.writeFileSync(`${build_directory}/index.js`, index);

    fs.copyFileSync('./package.json', `${build_directory}/package.json`);
}

// minify
let minify_files = async () => {
    if (minified) {
        fs.writeFileSync(`${build_directory}/public/styles.css`, await minify(`${build_directory}/public/styles.css`));
        fs.writeFileSync(`${build_directory}/public/components.js`, await minify(`${build_directory}/public/components.js`));
        fs.writeFileSync(`${build_directory}/index.html`, await minify(`${build_directory}/index.html`));
        fs.writeFileSync(`${build_directory}/index.js`, await minify(`${build_directory}/index.js`, { js: { parse: { bare_returns: true } } }));
    }
}

let npm = () => {
    child_process.execSync(`cd ${build_directory} & npm install --production`);
}

let compile_exe = async () => {
    if (exe) {
        let exe_config = {
            input: `${build_directory}/index.js`,
            output: `${build_directory}/bytestream`,
            verbose: true,
            target: 'windows-x64-12.16.2'
        }

        if (target) { exe_config.target = target }
        await nexe.compile(exe_config);
    }
}

(async () => {
    console.log('compiling files');
    css_files();
    js_files();
    html_files();

    package_utils();
    
    if (minified) {
        console.log('minifying');
        await minify_files();
    }

    console.log('installing dependencies...');
    npm();

    if (exe) {
        console.log('compiling executable');
        await compile_exe();

        let paths = [
            'node_modules',
            'package.json',
            'package-lock.json',
            'index.js'
        ]

        for (let p = 0; p < paths.length; p++) {
            try {
                fs.rmSync(`${build_directory}/${paths[p]}`, { recursive: true })
            }

            catch(e) { console.log('warning:'); console.log(e) }
        }
    }
})();