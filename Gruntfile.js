module.exports = function () {
    //Configuration
    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    expand: true,
                    cwd: 'public/javascript',
                    src: '**/*.js',
                    dest: 'public/javascript'
                }
            }
        }
    });

    //Plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //Running tasks
};