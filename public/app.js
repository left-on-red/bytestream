let app = new Vue({
    el: '#app',

    data: {
        path: window.location.pathname
    },

    methods: {
        set_path(path) {
            this.path = path

            window.history.pushState({}, path.slice(3), encodeURI(this.path));
            //window.history.replaceState({}, this.path, encodeURI(`/f/${this.file_path}`));
        }
    },

    created: function() {
        window.onpopstate = () => {
            let split = this.path.split('/');
            split.pop();

            let final = split.join('/');
            if (split.length == 1) { final = `${final}/` }

            this.path = final;
        }
    },

    mounted() {}
});