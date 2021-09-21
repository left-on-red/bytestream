# bytestream
***
### what is it?
bytestream is a simple and lightweight web server that serves clients files and directory contents from a specified root directory. bytestream is a node.js application written using Express.js for the back-end as well as Vue.js, Bootstrap, and MaterialDesignIcons for the front-end.

### what's currently included?
- directory navigation
- breadcrumb style backwards navigation
- stylish css styling
- backend (currently) undocumented API
- downloading raw files

### what's planned?
- JWT user authentication and authorization
- SSL support
- file management features (renaming, moving, uploading, etc)
- live content refreshing by way of websockets
- custom themes
- preview pages for certain file formats

### getting started
the easiest way to get your hands on this project for production use is to navigate to the published releases on this GitHub repostory. all you really need to do is download that and run the executable. there's a `config.json` file that handles simple configuration. the default `config.json` is as follows:
```
{
    "root": "./root",
    "port": 8080
}
```
- `root` - the path to the directory that you want to use as the root
- `port` - the port that the web server will be hosted under

### development
to get started with development, the only thing you really need is Node.js (and npm) installed. then you can just clone this repository, and run `npm install` in the root of the project to download all of the dependencies. after doing so, you can run `npm run dev` in the root of the project to have it automatically restart with any changes as well as automatically compile scss into css.

### building
for building this project, there's a couple npm scripts that you can run.
- `npm run build [path]` OR `npm run build [path] -- <arguments>`
  - `[path]` - path of the directory you want to build the project to (defaults to `/build`)
  - `<arguments>` - arguments related to the build process. due to how npm scripts work, if you want to use arguments, you need to have a ` -- ` after the command
    - `--minify` - minifies the code
    - `--overwrite` - overwrites the `[path]` if it already exists (the script will give you an error if otherwise)
    - `--exe` - compiles the application into an executable
    - `--target=<target>` - specifies the target architecture if you're trying to compile an executable. defaults to `windows-x64-12.16.2`. ([full list](https://github.com/nexe/nexe/releases?after=v3.3.4))
- `npm run build-all` - will attempt to build the application for major architecture, and archive the builds to make publishing releases easier.