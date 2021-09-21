(() => {
    Vue.component('byte-container', {
        props: [ 'path', 'set_path' ],

        template: `
            <div class="byte-container">
                <path-crumbs :path="path" :set_path="set_path"></path-crumbs>
                <path-list :path="path" :set_path="set_path"></path-list>
            </div>
        `
    });
})();