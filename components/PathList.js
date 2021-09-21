(() => {
    Vue.component('path-list', {
        props: [ 'path', 'set_path' ],

        data: () => {
            return {
                map: null
            }
        },

        computed: {
            file_path() { return this.path.slice(3) }
        },

        watch: {
            path: function() {
                this.populate()
            }
        },

        methods: {
            async populate() {
                this.map = null;

                let paths = await (await fetch(`/a/directory/${encodeURI(this.file_path)}`)).json();
                paths.sort((a, b) => {
                    // a and b are of the same type
                    if ((a.type == 'DIRECTORY' && b.type == 'DIRECTORY') || (a.type == 'FILE' && b.type == 'FILE')) {
                        if (a.name < b.name) { return -1 }
                        if (a.name > b.name) { return 1 }
                        return 0;
                    }
    
                    else {
                        if (a.type == 'FILE' && b.type == 'DIRECTORY') { return -1 }
                        if (a.type == 'DIRECTORY' && b.type == 'FILE') { return 1 }
                        return 0;
                    }
                });
    
                this.map = paths;
            }
        },

        mounted: function() {
            this.populate();
        },

        template: `
            <div class="path-list">
                <template v-if="map != null">
                    <path-list-item v-if="file_path != ''" :data="{ type: 'DIRECTORY', name: '.. (back)' }" :path="path" :set_path="set_path"></path-list-item>
                    <path-list-item v-for="(p, i) in map" :key="i" :data="p" :path="path" :set_path="set_path"></path-list-item>
                </template>
            </div>
        `
    });
})();