/**
 * Build process for CKEditor AutoSave Plugin
 * This file contributed by Timm Stokke <timm@stokke.me>
 *
 * Don't know where to start?
 * Try: http://24ways.org/2013/grunt-is-not-weird-and-hard/
 */
module.exports = function(grunt) {

    // CONFIGURATION
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        // Minimize JS
        uglify: {
            src: {
                options: {
                    sourceMap: false,
                    output: { beautify: true },
                    mangle: false,
                    compress: false
                },
                src: [
                    "src/bootstrap-suggest.js"
                ],
                dest: "dist/bootstrap-suggest.js"
            },
            minify: {
                files: {
                    "dist/bootstrap-suggest.min.js": "dist/bootstrap-suggest.js"

                }
            }
        },

        // Compile and minify SCSS
        sass: {
            src: {
                files: {
                    "dist/bootstrap-suggest.css": "src/bootstrap-suggest.scss"
                }
            }
        },

        postcss: {
            options: {
                map: false,
                processors: [
                    require("autoprefixer")({ overrideBrowserslist: "last 2 versions" })
                ]
            },
            src: {
                src: "dist/bootstrap-suggest.css"
            }
        },

        // CSS Minify
        cssmin: {
            combine: {
                files: {
                    "dist/bootstrap-suggest.min.css": "dist/bootstrap-suggest.css",
                }
            }
        },
        devUpdate: {
            main: {
                options: {
                    reportUpdated: true,
                    updateType: "force",
                    semver: false
                }
            }
        },
        headerText: ['/*!\n',
            ' * bootstrap-suggest - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
            ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
            ' * Licensed under <%= pkg.license %> (https://github.com/lodev09/<%= pkg.name %>/blob/master/LICENSE)\n',
            ' */\n'
        ].join(''),
        header: {
            dist: {
                options: {
                    text: '<%= headerText %>'
                },
                files: {
                    'dist/bootstrap-suggest.js': 'dist/bootstrap-suggest.js',
                    'dist/bootstrap-suggest.css': 'dist/bootstrap-suggest.css'
                }
            }
        }
    });

    // PLUGINS
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("@lodder/grunt-postcss");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("@w8tcha/grunt-dev-update");
    grunt.loadNpmTasks("grunt-header");


    grunt.registerTask("watch",
        [
            "uglify",
            "cssmin"
        ]);

    grunt.registerTask("default",
        [
            "devUpdate", "uglify:src", "sass", "postcss", "header", "uglify:minify", "cssmin"
        ]);

};
