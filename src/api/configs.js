let library_paths;
let env = require('dotenv').config();
process.env = ((env && env.parsed)? env.parsed : {});

const build_mode = process.env.NODE_ENV || 'development';
const build_type = process.env.BUILD_TYPE || 'local';

if( build_mode == 'production' && build_type == 'stage' ){
	library_paths = require('./stage.library_paths');	
}else if( build_mode == 'production' ){
	library_paths = require('./deploy.library_paths');	
}else{
	library_paths = require('./local.library_paths');
}

module.exports = {
	dbConnection: require(library_paths.db_connection),
	libraryACL: require(library_paths.acl_library)
}
