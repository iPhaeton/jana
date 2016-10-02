module.exports = function (grunt) {
    //Configuration
    grunt.initConfig({
        uglify: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'public/javascripts/babel',
                    src: ['**/*.js'],
                    dest: 'public/javascripts',
                    ext: '.min.js'
                }]
            }
        },

        babel: {
            dist: {
                options: {
                    presets: ['es2015']
                },
                files: [{
                    expand: true,
                    cwd: 'public/javascripts',
                    src: ['**/*.js'],
                    dest: 'public/javascripts/babel',
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

    //Running tasks
    grunt.registerTask('uglify-js', ['babel', 'uglify', 'clean']);
};