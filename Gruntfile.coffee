path = require( "path" )


module.exports = (grunt) ->

	banner =
	
	# Project configuration.
	grunt.initConfig
		pkg: grunt.file.readJSON('package.json')
		banner: """
/*
 * IGGY <%= pkg.version %> ( <%= grunt.template.today( 'yyyy-mm-dd' )%> )
 * http://mpneuried.github.io/iggy/
 *
 * Released under the MIT license
 * https://github.com/mpneuried/iggy/blob/master/LICENSE
*/

"""
		watch:
			css:
				files: ["_src/css/**/*.styl"]
				tasks: [ "build-core-css"]
		stylus:
			options:
				"include css": true
				banner: "<%= banner %>"
			base:
				files:
					"css/iggy.css": ["_src/css/main.styl"]

		clean:
			base:
				src: [ "js", "test" ]

		browserify:
			base:
				options:
					transform: ["jadeify", "coffeeify"]
					browserifyOptions:
						extensions: ".coffee"
						standalone: "IGGY"
						external: true
				files:
					'js/iggy.js': "_src/js/main.coffee"

			basedebug:
				options:
					transform: ["jadeify", "coffeeify"]
					browserifyOptions:
						debug: true
						extensions: ".coffee"
						standalone: "IGGY"
						external: true
				files:
					'js/iggy.debug.js': "_src/js/main.coffee"
			
			dev:
				options:
					watch: true
					keepAlive: true
					transform: ["jadeify", "coffeeify"]
					watchifyOptions:
						poll: 500
					browserifyOptions:
						debug: true
						extensions: ".coffee"
						standalone: "IGGY"
						external: true
				files:
					'js/iggy.debug.js': "_src/js/main.coffee"

		compress:
			options:
				mode: "tgz"
				archive: '_release/release_<%= pkg.version %>.tar.gz'
				pretty: true
			release:
				src: [ "package.json", "README.md", "LICENSE", "dist/**" ]
				dest: "iggy_<%= pkg.version %>/"
				
		copy:
			release:
				src: ['css/iggy.css']
				dest: 'dist/css/iggy.css'
			
			no_uglify:
				files:
					'dist/js/iggy.js': "js/iggy.js"

		# karma:
		# 	local:
		# 		configFile: 'karma.conf.coffee'

		uglify:
			options:
				compress: true
				banner: "<%= banner %>"

			release:
				files:
					'dist/js/iggy.js': "js/iggy.js"
		

	# Load npm modules
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-copy"
	grunt.loadNpmTasks "grunt-contrib-stylus"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-contrib-uglify"
	grunt.loadNpmTasks "grunt-contrib-compress"
	grunt.loadNpmTasks "grunt-browserify"
	#grunt.loadNpmTasks "grunt-karma"

	# just a hack until this issue has been fixed: https://github.com/yeoman/grunt-regarde/issues/3
	grunt.option('force', not grunt.option('force'))
	
	# ALIAS TASKS
	grunt.registerTask "watcher", ["browserify:dev"]
	grunt.registerTask "default", "build"
	grunt.registerTask "clear", [ "clean:base" ]
	#grunt.registerTask "test-local", "karma:local"

	# build the project
	grunt.registerTask "build-core-js", [ "browserify:base" ]
	grunt.registerTask "build-core-js-debug", [ "browserify:basedebug", "browserify:base" ]
	grunt.registerTask "build-core-css", [ "stylus:base"]
	grunt.registerTask "build-core", [ "build-core-js", "build-core-js-debug", "build-core-css"]


	grunt.registerTask "build", [ "clear", "build-core"]
	grunt.registerTask "release", [ "build", "uglify:release", "copy:release", "compress:release" ]
	grunt.registerTask "release-nouglify", [ "build", "copy:no_uglify", "copy:release", "compress:release" ]
	
	# shortcuts
	grunt.registerTask "w", "watcher"
	grunt.registerTask "b", "build"
