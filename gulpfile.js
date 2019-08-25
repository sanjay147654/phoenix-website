const gulp = require('gulp'),
	webpack = require('webpack'),
	path = require('path'),
	fs = require('fs'),
	webpack_dev_server = require('webpack-dev-server'),
	gutil = require("gulp-util"),
	nodemon = require('nodemon'),
	gulp_jest = require('gulp-jest').default,
	watch = require('gulp-watch'),
	runSequence = require('run-sequence'),
	rimraf = require('rimraf'),
	string_replace = require('gulp-string-replace'),
	htmlmin = require('gulp-htmlmin'),
	rename = require('gulp-rename'),
	sri = require('gulp-sri'),
	hash = require('gulp-hash'),
	pjson = require('./package.json');

const clean = require('gulp-clean');
const babel = require('gulp-babel');
const stripDebug = require('gulp-strip-debug');			
const uglify = require('gulp-uglify');

// Set variables through Node Environment variable
const build_mode = process.env.NODE_ENV || 'development';
// const build_mode = 'production';
const build_type = process.env.BUILD_TYPE || 'local';
// const build_type = 'stage';
// const build_type = 'deploy';

//cdn base
const cdn_base = (build_type === 'deploy' ? 'https://prstatic.phoenixrobotix.com/datoms/flood-monitoring/' + (pjson.version ? ('v' + pjson.version + '/') : '') : 'https://dev.datoms.io/datoms/flood_monitoring/cdn/');

let onBuild = (done) => {
	return (err, stats) => {
		if (err) {
			console.log('Error', err);
		} else {
			console.log(stats.toString());
		}
	
		if (done) {
			done();
		}
	};
};

// front end task

gulp.task('frontend', (done) => {
	let webpack_config_app = require('./webpack.configs/app.config.js');
	// console.log(webpack_config_app);

	if (build_mode === 'production') {
		webpack(webpack_config_app).run(onBuild(done));
	} else if (build_mode === 'development') {
		new webpack_dev_server(webpack(webpack_config_app), {
			publicPath: webpack_config_app.output.publicPath,
			contentBase:'./build/app',
			stats: {
				colors: true
			}
		}).listen(9090,'localhost', (err) => {
			if (err) throw new gutil.PluginError("webpack-dev-server", err);
			gutil.log('[webpack-dev-server]', 'http://127.0.0.1:9090/webpack-dev-server/index.html');
		});
	}
});

//php file
gulp.task('php_file', () => {
	setTimeout(() => {
		let src = 'src/app/index.html';
		let files_sri = JSON.parse(fs.readFileSync('./build/app/cdn/sri.json', 'utf8'));
		let hashed_file_names = JSON.parse(fs.readFileSync('./build/app/cdn/hash_manifest.json', 'utf8'));
		let js_preload_link = '<link as="script" href="'+ cdn_base + hashed_file_names['bundle.js'] +'" rel="preload" />';
		let js_file_link = '<script src="'+ cdn_base + hashed_file_names['bundle.js'] +'" integrity="'+ files_sri['build/app/bundle.js'] +'" crossorigin="anonymous"></script>';
		// let js_file_link = '<script src="'+ cdn_base + hashed_file_names['bundle.js'] +'"></script>';
		let backend_content_inside_head = js_preload_link;
		let backend_content_at_end_of_body = (build_type === 'deploy') ? fs.readFileSync('./src/app/php_content.php', 'utf8') : '';
		backend_content_at_end_of_body += js_file_link;

		gulp
			.src(src)
			.pipe(
				string_replace('<!-- ##PR_REPLACE_BY_BACKEND_CONTENT_INSIDE_HEAD## -->', backend_content_inside_head)
			)
			.pipe(
				string_replace('<!-- ##PR_REPLACE_BY_BACKEND_CONTENT_BEFORE_BODY_END## -->', backend_content_at_end_of_body)
			)
			.pipe(
				htmlmin({
					removeComments: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					// removeTagWhitespace: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					removeEmptyAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true/*,
					minifyJS: true,
					processScripts: ['text/javascript'],
					minifyCSS: true,*/
					// ignoreCustomFragments: true/* use this to conserve php */
				})
			)
			.pipe(
				rename('index.php')
			)
			.pipe(
				gulp.dest('./build/app')
			);
	}, 2000);
});

//static assets
//generate hash
gulp.task('generate_hashes_for_js_file', () => {
	rimraf('./build/app/cdn/', [], () => {
		return gulp
			.src([
				'./build/app/bundle.js'
			])
			.pipe(
				hash({
					algorithm: 'sha512',
					hashLength: 64
				})
			)
			.pipe(
				gulp.dest('./build/app/cdn/')
			)
			.pipe(
				hash.manifest('hash_manifest.json')
			)
			.pipe(
				gulp.dest('./build/app/cdn/')
			);
	});
});
//generate sri
gulp.task('generate_sri_for_js_file', () => {
	return gulp
		.src([
			'./build/app/bundle.js'
		])
		.pipe(
			sri({
				algorithms: ['sha384']
			})
		)
		.pipe(
			gulp.dest('./build/app/cdn/')
		)
});

// Change the React Router
gulp.task('react_browser_router', () => {
	return gulp
		.src(['./src/app/js/App.js'])
		.pipe(string_replace('HashRouter', 'BrowserRouter'))
		.pipe(gulp.dest('./src/app/js/'))
});
gulp.task('react_hash_router', () => {
	return gulp
		.src(['./src/app/js/App.js'])
		.pipe(string_replace('BrowserRouter', 'HashRouter'))
		.pipe(gulp.dest('./src/app/js/'))
});

gulp.task('clean-api',()=>{
	return gulp.src('build/api').pipe(clean());
});

gulp.task('build-api',[/*'clean-api'*/],function(){
	if(build_mode === 'production'){
		return gulp.src(['./src/api/**/*.js', './src/api/deploy.library_paths', './src/api/stage.library_paths'])
			.pipe(babel({
				'presets': [
					'@babel/env', '@babel/flow'
				],
				'plugins': [
					'@babel/plugin-transform-runtime'
				]
			}))
			.on('error', (err)=>{
				console.log('babel > ', err);
			})
			.pipe(stripDebug())
			.pipe(uglify())
			.pipe(
				gulp.dest('build/api')
			);
	}else{
		return gulp.src(['./src/api/**/*.js', './src/api/local.library_paths'])
			.pipe(babel({
				'presets': [
					'@babel/env', '@babel/flow'
				],
				'plugins': [
					'@babel/plugin-transform-runtime'
				]
			}))
			.on('error', (err)=>{
				console.log('babel > ', err);
			})
			.pipe(
				gulp.dest('build/api')
			);
	}
});

gulp.task('build-backend',['build-api'],function(){
	if (build_mode === 'development') {
		nodemon.restart();		
	}
});
// watch tasks

gulp.task('backend-watch', () => {
	return watch('./src/api/*/**', () => {
		gulp.run('build-backend');
	});
});


// final build

gulp.task('backend',['build-backend'],function(){
	if (build_mode === 'development') {
		setTimeout(()=>{
			nodemon({
				execMap: {
					js: 'node'
				},
				script: path.join(__dirname, 'build/api/index.js'),
				ignore: ['*'],
				ext: 'noop'
			}).on('restart', () => {
				console.log('Backend Restarted!');
			}).on('error', (error) => {
				console.log(error);
				nodemon.restart();
			});
		},1000);
		runSequence('backend-watch');
	}
	if(build_mode == 'development'){
		gulp
			.src(['./src/api/package.json', './src/api/local.library_paths'])
			.pipe(gulp.dest('./build/api/'));
	}else{
		gulp
			.src(['./src/api/package.json', './src/api/*.library_paths', './src/api/*.env', './src/api/.env'])
			.pipe(gulp.dest('./build/api/'));
	}
});

/* Upload files through FTP Connection */
// Primary Server FTP Connection
function getPrimaryServerFtpConnection() {
	return ftp.create({
		host: ftpKey.primary.host,
		port: ftpKey.primary.port,
		user: ftpKey.primary.user,
		password: ftpKey.primary.pass,
		parallel: 5,
		log: gutil.log
	});
}
// Secondary Server FTP Connection
function getSecondaryServerFtpConnection() {
	return ftp.create({
		host: ftpKey.secondary.host,
		port: ftpKey.secondary.port,
		user: ftpKey.secondary.user,
		password: ftpKey.secondary.pass,
		parallel: 5,
		log: gutil.log
	});
}
// Testing Server FTP Connection
function getTestingServerFtpConnection() {
	return ftp.create({
		host: ftpKey.staging.host,
		port: ftpKey.staging.port,
		user: ftpKey.staging.user,
		password: ftpKey.staging.pass,
		parallel: 5,
		log: gutil.log
	});
}

// Upload the JS files to primary server
gulp.task('upload_js_files_to_primary_server', () => {
	let conn = getPrimaryServerFtpConnection(),
		localFiles = ['./build/app/cdn/*.js'],
		serverPath = '/phoenixrobotix/prstatic/datoms/flood-monitoring' + (pjson.version ? ('/v' + pjson.version) : '');
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the PHP files to primary server
gulp.task('upload_php_files_to_primary_server', () => {
	let conn = getPrimaryServerFtpConnection(),
		localFiles = ['./build/app/index.php'],
		serverPath = '/phoenixrobotix/src/datoms/flood_monitoring' + (pjson.version ? ('/v' + pjson.version) : '');
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the backend files to primary server
gulp.task('upload_backend_files_to_primary_server', () => {
	let conn = getPrimaryServerFtpConnection(),
		localFiles = [
			'./build/api/**/*.*',
			'./build/api/**/.*'
		],
		serverPath = '/phoenixrobotix/api/datoms/flood_monitoring/' + (pjson.version ? ('v' + pjson.version + '/') : '') + 'backend';
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});

// Upload the JS files to secondary server
gulp.task('upload_js_files_to_secondary_server', () => {
	let conn = getSecondaryServerFtpConnection(),
		localFiles = ['./build/app/cdn/*.js'],
		serverPath = '/phoenixrobotix/prstatic/datoms/flood-monitoring' + (pjson.version ? ('/v' + pjson.version) : '');
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the PHP files to secondary server
gulp.task('upload_php_files_to_secondary_server', () => {
	let conn = getSecondaryServerFtpConnection(),
		localFiles = ['./build/app/index.php'],
		serverPath = '/phoenixrobotix/src/datoms/flood_monitoring' + (pjson.version ? ('/v' + pjson.version) : '');
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the backend files to secondary server
gulp.task('upload_backend_files_to_secondary_server', () => {
	let conn = getSecondaryServerFtpConnection(),
		localFiles = [
			'./build/api/**/*.*',
			'./build/api/**/.*'
		],
		serverPath = '/phoenixrobotix/api/datoms/flood_monitoring/' + (pjson.version ? ('v' + pjson.version + '/') : '') + 'backend';
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});

// Upload backend files to deploy servers
gulp.task('upload_backend_files_to_deploy_servers', [
	'upload_backend_files_to_primary_server',
	'upload_backend_files_to_secondary_server'
]);
// Upload js files to deploy servers
gulp.task('upload_js_files_to_deploy_servers', [
	'upload_js_files_to_primary_server',
	'upload_js_files_to_secondary_server'
]);
// Upload php files to deploy servers
gulp.task('upload_php_files_to_deploy_servers', [
	'upload_php_files_to_primary_server',
	'upload_php_files_to_secondary_server'
]);
// Upload frontend files to deploy servers
gulp.task('upload_frontend_files_to_deploy_servers', [
	'upload_js_files_to_deploy_servers',
	'upload_php_files_to_deploy_servers'
]);

// Upload the frontend files to testing server
gulp.task('upload_frontend_files_to_testing_server', () => {
	let conn = getTestingServerFtpConnection(),
		localFiles = [
			'./build/app/**/*.*',
			'!./build/app/*.html',
			'!./build/app/*.js',
			'!./build/app/cdn/*.json'
		],
		serverPath = '/phoenixrobotix/dev/datoms/flood_monitoring/';
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the backend files to testing server
gulp.task('upload_backend_files_to_testing_server', () => {
	let conn = getTestingServerFtpConnection(),
		localFiles = [
			'./build/api/**/*.*',
			'./build/api/**/.*'
		],
		serverPath = '/phoenixrobotix/dev/datoms/flood_monitoring/backend';
	return gulp.src(localFiles, {buffer: false})
		.pipe(conn.newer(serverPath))
		.pipe(conn.dest(serverPath));
});
// Upload the files to testing server
gulp.task('upload_files_to_testing_server', [
	'upload_frontend_files_to_testing_server',
	'upload_backend_files_to_testing_server'
]);