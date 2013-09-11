define([
	"dojo/_base/lang",
	"dojo/_base/Deferred"
], function( lang, Deferred ) {

	var file = {
		// summary:
		//		Promised based wrapper for Cordova File API

		getFile: function( filename ) {
			// summary:
			//		Get a file by name
			// filename:
			//		Path of file of obtain
			// returns:
			//		Promise to return file object
			// example:
			// |	file.getFile("myFile").then(function(file) { ... }, function(err) { ... } );
			var def = new Deferred();
			var error = function(err) { def.reject(err); }
		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
		    	function(fs) {
					fs.root.getFile(filename, {create:true, exclusive:false},
						function(fileEntry) {
							fileEntry.file(
								function(file) {
									file.url = fileEntry.toURL();
									def.resolve( file );
								},
						    	error
							);//F
						},
				    	error
				    );//FE
				},
		    	error
		    );//FS
		    return def.promise;
		},

		//-----------------------------------------------------------------------------------------
		getDirectory: function( /*String*/dirpath ) {
			// summary:
			//		Get (or make) directory pointed to by path
			// dirpath:
			//		Directory path to obtain
			// return:
			//		Promise to return directory object
			var def = new Deferred();
			var error = function(err) { def.reject(err); }
			var dirs = dirpath.split("/");
			//-- Get rid of any empty segments.
			for( var x = dirs.length-1; x >= 0; x-- ) {
				if ( !dirs[x].length ) { dirs.splice(x,1); }
			}

			var getDir = function(de, dirs, callback) {
				var dir = dirs.splice(0,1)[0];  // returns array, want 1st (single) node
				de.getDirectory( dir, {create:true, exclusive:false},
					function( d ) {
						if ( dirs.length ) {
							getDir( d, dirs, callback );
						} else {
							callback( d );
						}
					},
			    	error
				);
			};

		    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
		    	function(fs) {
					getDir( fs.root, dirs, function( finalDir ) {
						def.resolve( finalDir );
					});
				},
		    	error
		    );//FS
		    return def.promise;
		},

		copyFile: function(fileLocation, newDirectory, newName){
			// summary:
			//		Copy file to new path/name
			// fileLocation:
			//		Source file location
			// newDirectory:
			//		Where to put copied file
			// newName:
			//		Optional new name for file. Required if same source/target directory
			var def = new Deferred();
			var error = function(err) { def.reject(err); }
			var _this = this;
			window.resolveLocalFileSystemURI(fileLocation,
				function(fileEntry){
					_this.getDirectory(newDirectory).then(
						function(dir){
							fileEntry.copyTo(dir, newName,
								function(fileEntry) {
									fileEntry.file(
										function(fileObj){
											def.resolve({
												name: fileObj.name,
												size: fileObj.size,
												fullPath: fileEntry.fullPath,
												type: fileObj.type
											});
										},
										error
									);
								},
								error
							);
						},
						error
					);
				},
				error
			);
		    return def.promise;
		},

		getFileDetails: function(fileLocation){
			// summary:
			//		Get details ona  file
			// fileLocation: url
			//		Should be in the format file:///mnt/sdcard/SOME_FOLDER/FILE_NAME.EXT
			// returns:
			//		Promise for File details object
			var def = new Deferred();
			var error = function(err) { def.reject(err); }
			window.resolveLocalFileSystemURI(fileLocation,
				function(fileEntry){
					fileEntry.file(
						function(fileObj){
							def.resolve({
								name: fileObj.name,
								size: fileObj.size,
								fullPath: fileEntry.fullPath,
								type: fileObj.type
							});
						},
						error
					);
				},
				error
			);
		    return def.promise;
		},

		deleteFile: function(/* String */fileURL){
			//	summary:
			//
			//	fileURL: url
			//		should be in the format file:///mnt/sdcard/SOME_FOLDER/FILE_NAME.EXT
			var def = new Deferred();
			var error = function(err) { def.reject(err); }
			window.resolveLocalFileSystemURI(fileURL,
				function(fileEntry) {
					fileEntry.remove(
						function(obj){
							def.resolve(obj);
						},
						error
					);
				},
				error
			);
			return def.promise;
		}
	};
    return file;
});