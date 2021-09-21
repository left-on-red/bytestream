(() => {
    Vue.component('path-crumbs', {
        props: [ 'path', 'set_path' ],

        computed: {
            file_path() { return this.path.slice(3) },
            segments() { return this.file_path.split('/') }
        },

        mounted: function() {
            
        },

        template: `
            <div class="path-crumbs">
            <span class="crumb-text" @click="set_path('/f/')">root</span><template v-for="(s, i) in segments">
                    <span class="crumb-slash">/</span><span class="crumb-text" :key="i" @click="set_path('/f/' + segments.slice(0, i+1).join('/'))">{{decodeURI(s)}}</span>
                </template>
            </div>
        `
    });
})();