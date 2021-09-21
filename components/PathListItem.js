(() => {
    Vue.component('path-list-item', {
        props: [ 'data', 'path', 'set_path' ],

        computed: {
            file_path() { return this.path.slice(3) }
        },

        methods: {
            navigate: function() {
                if (this.data.type == 'DIRECTORY') {
                    let path = `${this.file_path}/${this.data.name}`;
                    if (this.data.name == '.. (back)') { path = path.split('/').slice(0, -2).join('/') }
                    if (path.startsWith('/')) { path = path.slice(1) }
                    this.set_path(`/f/${path}`);
                }

                else if (this.data.type == 'FILE') {
                    let path = `${this.file_path}/${this.data.name}`;
                    
                    let a = document.createElement("a");
                    a.href = `/r/${encodeURI(path)}`;
                    a.setAttribute("download", this.data.name);
                    a.click();
                }
            }
        },

        mounted: function() {
            
        },

        template: `
            <div class="path-item">
                <div class="path-icon">
                    <div class="icon">
                        <i v-if="data.type == 'DIRECTORY'" class="mdi mdi-folder"></i>
                        <i v-else class="mdi mdi-file"></i>
                    </div>
                </div>
                <div class="path-container" @click="navigate()">
                    <p class="path-label">{{data.name}}</p>
                </div>
            </div>
        `
    });
})();