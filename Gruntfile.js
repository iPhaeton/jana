module.exports = function (grunt) {
    //Configuration
    grunt.initConfig({
        concat: {
            basic: {
                src: ["public/javascripts/axillaries.js",
                    "public/javascripts/modals.js",
                    "public/javascripts/ajaxClient.js",
                    "public/javascripts/headMenu.js"],
                dest: "public/javascripts/build/index.js"
            },
            extras: {
                src: ["public/javascripts/SockConnection.js",
                    "public/javascripts/modals.js",
                    "public/javascripts/axillaries.js",
                    "public/javascripts/ajaxClient.js",
                    "public/javascripts/sockJSClient.js",
                    "public/javascripts/headMenu.js",
                    "public/javascripts/sideMenu.js",
                    "public/javascripts/shopClient.js",
                    "public/javascripts/searchPanel.js"],
                dest: "public/javascripts/build/shop.js"
            }
        },

        babel: {
            dist: {
                options: {
                    presets: ['es2015']
                },
                files: [{
                    expand: true,
                    cwd: 'public/javascripts/build',
                    src: ['**/*.js'],
                    dest: 'public/javascripts/babel',
                }]
            }
        },

        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'public/javascripts/babel',
                    src: ['**/*.js'],
                    dest: 'public/javascripts/build',
                    ext: '.min.js'
                }]
            }
        },

        clean: {
            folder: ['public/javascripts/babel']
        }
    });

    //Plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');

    //Running tasks
    grunt.registerTask('build', ['concat', 'babel', 'uglify', 'clean']);
};