import require$$1 from 'fs';
import require$$0 from 'os';
import require$$2 from 'path';
import require$$0$1 from 'util';
import require$$5 from 'child_process';
import require$$3 from 'events';
import require$$5$1 from 'assert';
//@
//@ ### error()
//@
//@ Tests if error occurred in the last command. Returns a truthy value if an
//@ error returned, or a falsy value otherwise.
//@
//@ **Note**: do not rely on the
//@ return value to be an error message. If you need the last error message, use
//@ the `.stderr` attribute from the last command's return value instead.
const require$$27 = function error() {
	return common.state.error;
  }
//@
//@ ### errorCode()
//@
//@ Returns the error code from the last command.
const require$$28 = function errorCode() {
	return common.state.errorCode;
  }



function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

const common$2 = {exports: {}};

let cat;
let hasRequiredCat;

// ==> Cat () {
function requireCat () {
	if (hasRequiredCat) return cat;
	hasRequiredCat = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('cat', _cat, {
	  canReceivePipe: true,
	  cmdOptions: {
	    'n': 'number',
	  },
	});

	//@
	//@ ### cat([options,] file [, file ...])
	//@ ### cat([options,] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-n`: number all output lines
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var str = cat('file*.txt');
	//@ var str = cat('file1', 'file2');
	//@ var str = cat(['file1', 'file2']); // same as above
	//@ ```
	//@
	//@ Returns a [ShellString](#shellstringstr) containing the given file, or a
	//@ concatenated string containing the files if more than one file is given (a
	//@ new line character is introduced between each file).
	function _cat({number}, files) {
	  let cat = common.readFromPipe();

	  if (!files && !cat) common.error('no paths given');

	  files = [].slice.call(arguments, 1);

	  files.forEach(file => {
	    if (!fs.existsSync(file)) {
	      common.error(`no such file or directory: ${file}`);
	    } else if (common.statFollowLinks(file).isDirectory()) {
	      common.error(`${file}: Is a directory`);
	    }

	    cat += fs.readFileSync(file, 'utf8');
	  });

	  if (number) {
	    cat = addNumbers(cat);
	  }

	  return cat;
	}
	cat = _cat;

	function addNumbers(cat) {
	  let lines = cat.split('\n');
	  let lastLine = lines.pop();

	  lines = lines.map((line, i) => {
	    return numberedLine(i + 1, line);
	  });

	  if (lastLine.length) {
	    lastLine = numberedLine(lines.length + 1, lastLine);
	  }
	  lines.push(lastLine);

	  return lines.join('\n');
	}

	function numberedLine(n, line) {
	  // GNU cat use six pad start number + tab. See http://lingrok.org/xref/coreutils/src/cat.c#57
	  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
	  const number = `${(`     ${n}`).slice(-6)}\t`;
	  return number + line;
	}
	return cat;
}

let cd;
let hasRequiredCd;

// ==> Cd () {
function requireCd () {
	if (hasRequiredCd) return cd;
	hasRequiredCd = 1;
	const os = require$$0;
	const common = requireCommon();

	common.register('cd', _cd, {});

	//@
	//@ ### cd([dir])
	//@
	//@ Changes to directory `dir` for the duration of the script. Changes to home
	//@ directory if no argument is supplied. Returns a
	//@ [ShellString](#shellstringstr) to indicate success or failure.
	function _cd(options, dir) {
	  if (!dir) dir = os.homedir();

	  if (dir === '-') {
	    if (!process.env.OLDPWD) {
	      common.error('could not find previous directory');
	    } else {
	      dir = process.env.OLDPWD;
	    }
	  }

	  try {
	    const curDir = process.cwd();
	    process.chdir(dir);
	    process.env.OLDPWD = curDir;
	  } catch (e) {
	    // something went wrong, let's figure out the error
	    let err;
	    try {
	      common.statFollowLinks(dir); // if this succeeds, it must be some sort of file
	      err = `not a directory: ${dir}`;
	    } catch (e2) {
	      err = `no such file or directory: ${dir}`;
	    }
	    if (err) common.error(err);
	  }
	  return '';
	}
	cd = _cd;
	return cd;
}

let chmod;
let hasRequiredChmod;

// ==> Chmod () {
function requireChmod () {
	if (hasRequiredChmod) return chmod;
	hasRequiredChmod = 1;
	const common = requireCommon();
	const fs = require$$1;
	const path = require$$2;

	const PERMS = (({EXEC, WRITE, READ}) => {
	  return {
	    OTHER_EXEC: EXEC,
	    OTHER_WRITE: WRITE,
	    OTHER_READ: READ,

	    GROUP_EXEC: EXEC << 3,
	    GROUP_WRITE: WRITE << 3,
	    GROUP_READ: READ << 3,

	    OWNER_EXEC: EXEC << 6,
	    OWNER_WRITE: WRITE << 6,
	    OWNER_READ: READ << 6,

	    // Literal octal numbers are apparently not allowed in "strict" javascript.
	    STICKY: parseInt('01000', 8),
	    SETGID: parseInt('02000', 8),
	    SETUID: parseInt('04000', 8),

	    TYPE_MASK: parseInt('0770000', 8),
	  };
	})({
	  EXEC: 1,
	  WRITE: 2,
	  READ: 4,
	});

	common.register('chmod', _chmod, {
	});

	//@
	//@ ### chmod([options,] octal_mode || octal_string, file)
	//@ ### chmod([options,] symbolic_mode, file)
	//@
	//@ Available options:
	//@
	//@ + `-v`: output a diagnostic for every file processed//@
	//@ + `-c`: like verbose, but report only when a change is made//@
	//@ + `-R`: change files and directories recursively//@
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ chmod(755, '/Users/brandon');
	//@ chmod('755', '/Users/brandon'); // same as above
	//@ chmod('u+x', '/Users/brandon');
	//@ chmod('-R', 'a-w', '/Users/brandon');
	//@ ```
	//@
	//@ Alters the permissions of a file or directory by either specifying the
	//@ absolute permissions in octal form or expressing the changes in symbols.
	//@ This command tries to mimic the POSIX behavior as much as possible.
	//@ Notable exceptions:
	//@
	//@ + In symbolic modes, `a-r` and `-r` are identical.  No consideration is
	//@   given to the `umask`.
	//@ + There is no "quiet" option, since default behavior is to run silent.
	//@ + Windows OS uses a very different permission model than POSIX. `chmod()`
	//@   does its best on Windows, but there are limits to how file permissions can
	//@   be set. Note that WSL (Windows subsystem for Linux) **does** follow POSIX,
	//@   so cross-platform compatibility should not be a concern there.
	//@
	//@ Returns a [ShellString](#shellstringstr) indicating success or failure.
	function _chmod(options, mode, filePattern) {
	  if (!filePattern) {
	    if (options.length > 0 && options.charAt(0) === '-') {
	      // Special case where the specified file permissions started with - to subtract perms, which
	      // get picked up by the option parser as command flags.
	      // If we are down by one argument and options starts with -, shift everything over.
	      [].unshift.call(arguments, '');
	    } else {
	      common.error('You must specify a file.');
	    }
	  }

	  options = common.parseOptions(options, {
	    'R': 'recursive',
	    'c': 'changes',
	    'v': 'verbose',
	  });

	  filePattern = [].slice.call(arguments, 2);

	  let files;

	  // TODO: replace this with a call to common.expand()
	  if (options.recursive) {
	    files = [];
	    filePattern.forEach(function addFile(expandedFile) {
	      const stat = common.statNoFollowLinks(expandedFile);

	      if (!stat.isSymbolicLink()) {
	        files.push(expandedFile);

	        if (stat.isDirectory()) {  // intentionally does not follow symlinks.
	          fs.readdirSync(expandedFile).forEach(child => {
	            addFile(`${expandedFile}/${child}`);
	          });
	        }
	      }
	    });
	  } else {
	    files = filePattern;
	  }

	  files.forEach(function innerChmod(file) {
	    file = path.resolve(file);
	    if (!fs.existsSync(file)) {
	      common.error(`File not found: ${file}`);
	    }

	    // When recursing, don't follow symlinks.
	    if (options.recursive && common.statNoFollowLinks(file).isSymbolicLink()) {
	      return;
	    }

	    const stat = common.statFollowLinks(file);
	    const isDir = stat.isDirectory();
	    let perms = stat.mode;
	    const type = perms & PERMS.TYPE_MASK;

	    let newPerms = perms;

	    if (Number.isNaN(parseInt(mode, 8))) {
	      // parse options
	      mode.split(',').forEach(symbolicMode => {
	        const pattern = /([ugoa]*)([=+-])([rwxXst]*)/i;
	        const matches = pattern.exec(symbolicMode);

	        if (matches) {
	          const applyTo = matches[1];
	          const operator = matches[2];
	          const change = matches[3];

	          const changeOwner = applyTo.includes('u') || applyTo === 'a' || applyTo === '';
	          const changeGroup = applyTo.includes('g') || applyTo === 'a' || applyTo === '';
	          const changeOther = applyTo.includes('o') || applyTo === 'a' || applyTo === '';

	          const changeRead = change.includes('r');
	          const changeWrite = change.includes('w');
	          let changeExec = change.includes('x');
	          const changeExecDir = change.includes('X');
	          const changeSticky = change.includes('t');
	          const changeSetuid = change.includes('s');

	          if (changeExecDir && isDir) {
	            changeExec = true;
	          }

	          let mask = 0;
	          if (changeOwner) {
	            mask |= (changeRead ? PERMS.OWNER_READ : 0) + (changeWrite ? PERMS.OWNER_WRITE : 0) + (changeExec ? PERMS.OWNER_EXEC : 0) + (changeSetuid ? PERMS.SETUID : 0);
	          }
	          if (changeGroup) {
	            mask |= (changeRead ? PERMS.GROUP_READ : 0) + (changeWrite ? PERMS.GROUP_WRITE : 0) + (changeExec ? PERMS.GROUP_EXEC : 0) + (changeSetuid ? PERMS.SETGID : 0);
	          }
	          if (changeOther) {
	            mask |= (changeRead ? PERMS.OTHER_READ : 0) + (changeWrite ? PERMS.OTHER_WRITE : 0) + (changeExec ? PERMS.OTHER_EXEC : 0);
	          }

	          // Sticky bit is special - it's not tied to user, group or other.
	          if (changeSticky) {
	            mask |= PERMS.STICKY;
	          }

	          switch (operator) {
	            case '+':
	              newPerms |= mask;
	              break;

	            case '-':
	              newPerms &= ~mask;
	              break;

	            case '=':
	              newPerms = type + mask;

	              // According to POSIX, when using = to explicitly set the
	              // permissions, setuid and setgid can never be cleared.
	              if (common.statFollowLinks(file).isDirectory()) {
	                newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
	              }
	              break;
	            default:
	              common.error(`Could not recognize operator: \`${operator}\``);
	          }

	          if (options.verbose) {
	            console.log(`${file} -> ${newPerms.toString(8)}`);
	          }

	          if (perms !== newPerms) {
	            if (!options.verbose && options.changes) {
	              console.log(`${file} -> ${newPerms.toString(8)}`);
	            }
	            fs.chmodSync(file, newPerms);
	            perms = newPerms; // for the next round of changes!
	          }
	        } else {
	          common.error(`Invalid symbolic mode change: ${symbolicMode}`);
	        }
	      });
	    } else {
	      // they gave us a full number
	      newPerms = type + parseInt(mode, 8);

	      // POSIX rules are that setuid and setgid can only be added using numeric
	      // form, but not cleared.
	      if (common.statFollowLinks(file).isDirectory()) {
	        newPerms |= (PERMS.SETUID + PERMS.SETGID) & perms;
	      }

	      fs.chmodSync(file, newPerms);
	    }
	  });
	  return '';
	}
	chmod = _chmod;
	return chmod;
}

let cp;
let hasRequiredCp;

// ==> Cp () {
function requireCp () {
	if (hasRequiredCp) return cp;
	hasRequiredCp = 1;
	const fs = require$$1;
	const path = require$$2;
	const common = requireCommon();

	common.register('cp', _cp, {
	  cmdOptions: {
	    'f': '!no_force',
	    'n': 'no_force',
	    'u': 'update',
	    'R': 'recursive',
	    'r': 'recursive',
	    'L': 'followsymlink',
	    'P': 'noFollowsymlink',
	    'p': 'preserve',
	  },
	  wrapOutput: false,
	});

	// Buffered file copy, synchronous
	// (Using readFileSync() + writeFileSync() could easily cause a memory overflow
	//  with large files)
	function copyFileSync(srcFile, destFile, {update, followsymlink, preserve}) {
	  if (!fs.existsSync(srcFile)) {
	    common.error(`copyFileSync: no such file or directory: ${srcFile}`);
	  }

	  const isWindows = process.platform === 'win32';

	  // Check the mtimes of the files if the '-u' flag is provided
	  try {
	    if (update && common.statFollowLinks(srcFile).mtime < fs.statSync(destFile).mtime) {
	      return;
	    }
	  } catch (e) {
	    // If we're here, destFile probably doesn't exist, so just do a normal copy
	  }

	  if (common.statNoFollowLinks(srcFile).isSymbolicLink() && !followsymlink) {
	    try {
	      common.statNoFollowLinks(destFile);
	      common.unlinkSync(destFile); // re-link it
	    } catch (e) {
	      // it doesn't exist, so no work needs to be done
	    }

	    const symlinkFull = fs.readlinkSync(srcFile);
	    fs.symlinkSync(symlinkFull, destFile, isWindows ? 'junction' : null);
	  } else {
	    const buf = common.buffer();
	    const bufLength = buf.length;
	    let bytesRead = bufLength;
	    let pos = 0;
	    let fdr = null;
	    let fdw = null;
	    const srcStat = common.statFollowLinks(srcFile);

	    try {
	      fdr = fs.openSync(srcFile, 'r');
	    } catch (e) {
	      /* istanbul ignore next */
	      common.error(`copyFileSync: could not read src file (${srcFile})`);
	    }

	    try {
	      fdw = fs.openSync(destFile, 'w', srcStat.mode);
	    } catch (e) {
	      /* istanbul ignore next */
	      common.error(`copyFileSync: could not write to dest file (code=${e.code}):${destFile}`);
	    }

	    while (bytesRead === bufLength) {
	      bytesRead = fs.readSync(fdr, buf, 0, bufLength, pos);
	      fs.writeSync(fdw, buf, 0, bytesRead);
	      pos += bytesRead;
	    }

	    if (preserve) {
	      fs.fchownSync(fdw, srcStat.uid, srcStat.gid);
	      // Note: utimesSync does not work (rounds to seconds), but futimesSync has
	      // millisecond precision.
	      fs.futimesSync(fdw, srcStat.atime, srcStat.mtime);
	    }

	    fs.closeSync(fdr);
	    fs.closeSync(fdw);
	  }
	}

	// Recursively copies 'sourceDir' into 'destDir'
	// Adapted from https://github.com/ryanmcgrath/wrench-js
	//
	// Copyright (c) 2010 Ryan McGrath
	// Copyright (c) 2012 Artur Adib
	//
	// Licensed under the MIT License
	// http://www.opensource.org/licenses/mit-license.php
	function cpdirSyncRecursive(sourceDir, destDir, currentDepth, opts) {
	  if (!opts) opts = {};

	  // Ensure there is not a run away recursive copy
	  if (currentDepth >= common.config.maxdepth) return;
	  currentDepth++;

	  const isWindows = process.platform === 'win32';

	  // Create the directory where all our junk is moving to; read the mode/etc. of
	  // the source directory (we'll set this on the destDir at the end).
	  const checkDir = common.statFollowLinks(sourceDir);
	  try {
	    fs.mkdirSync(destDir);
	  } catch (e) {
	    // if the directory already exists, that's okay
	    if (e.code !== 'EEXIST') throw e;
	  }

	  const files = fs.readdirSync(sourceDir);

	  for (let i = 0; i < files.length; i++) {
	    const srcFile = `${sourceDir}/${files[i]}`;
	    const destFile = `${destDir}/${files[i]}`;
	    let srcFileStat = common.statNoFollowLinks(srcFile);

	    let symlinkFull;
	    if (opts.followsymlink) {
	      if (cpcheckcycle(sourceDir, srcFile)) {
	        // Cycle link found.
	        console.error('Cycle link found.');
	        symlinkFull = fs.readlinkSync(srcFile);
	        fs.symlinkSync(symlinkFull, destFile, isWindows ? 'junction' : null);
	        continue;
	      }
	    }
	    if (srcFileStat.isDirectory()) {
	      /* recursion this thing right on back. */
	      cpdirSyncRecursive(srcFile, destFile, currentDepth, opts);
	    } else if (srcFileStat.isSymbolicLink() && !opts.followsymlink) {
	      symlinkFull = fs.readlinkSync(srcFile);
	      try {
	        common.statNoFollowLinks(destFile);
	        common.unlinkSync(destFile); // re-link it
	      } catch (e) {
	        // it doesn't exist, so no work needs to be done
	      }
	      fs.symlinkSync(symlinkFull, destFile, isWindows ? 'junction' : null);
	    } else if (srcFileStat.isSymbolicLink() && opts.followsymlink) {
	      srcFileStat = common.statFollowLinks(srcFile);
	      if (srcFileStat.isDirectory()) {
	        cpdirSyncRecursive(srcFile, destFile, currentDepth, opts);
	      } else {
	        copyFileSync(srcFile, destFile, opts);
	      }
	    } else if (fs.existsSync(destFile) && opts.no_force) {
	      common.log(`skipping existing file: ${files[i]}`);
	    } else {
	      copyFileSync(srcFile, destFile, opts);
	    }
	  } // for files

	  // finally change the mode for the newly created directory (otherwise, we
	  // couldn't add files to a read-only directory).
	  // var checkDir = common.statFollowLinks(sourceDir);
	  if (opts.preserve) {
	    fs.utimesSync(destDir, checkDir.atime, checkDir.mtime);
	  }
	  fs.chmodSync(destDir, checkDir.mode);
	} // cpdirSyncRecursive

	// Checks if cureent file was created recently
	function checkRecentCreated(sources, index) {
	  const lookedSource = sources[index];
	  return sources.slice(0, index).some(src => {
	    return path.basename(src) === path.basename(lookedSource);
	  });
	}

	function cpcheckcycle(sourceDir, srcFile) {
	  const srcFileStat = common.statNoFollowLinks(srcFile);
	  if (srcFileStat.isSymbolicLink()) {
	    // Do cycle check. For example:
	    //   $ mkdir -p 1/2/3/4
	    //   $ cd  1/2/3/4
	    //   $ ln -s ../../3 link
	    //   $ cd ../../../..
	    //   $ cp -RL 1 copy
	    const cyclecheck = common.statFollowLinks(srcFile);
	    if (cyclecheck.isDirectory()) {
	      const sourcerealpath = fs.realpathSync(sourceDir);
	      const symlinkrealpath = fs.realpathSync(srcFile);
	      const re = new RegExp(symlinkrealpath);
	      if (re.test(sourcerealpath)) {
	        return true;
	      }
	    }
	  }
	  return false;
	}

	//@
	//@ ### cp([options,] source [, source ...], dest)
	//@ ### cp([options,] source_array, dest)
	//@
	//@ Available options:
	//@
	//@ + `-f`: force (default behavior)
	//@ + `-n`: no-clobber
	//@ + `-u`: only copy if `source` is newer than `dest`
	//@ + `-r`, `-R`: recursive
	//@ + `-L`: follow symlinks
	//@ + `-P`: don't follow symlinks
	//@ + `-p`: preserve file mode, ownership, and timestamps
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ cp('file1', 'dir1');
	//@ cp('-R', 'path/to/dir/', '~/newCopy/');
	//@ cp('-Rf', '/tmp/*', '/usr/local/*', '/home/tmp');
	//@ cp('-Rf', ['/tmp/*', '/usr/local/*'], '/home/tmp'); // same as above
	//@ ```
	//@
	//@ Copies files. Returns a [ShellString](#shellstringstr) indicating success
	//@ or failure.
	function _cp(options, sources, dest) {
	  // If we're missing -R, it actually implies -L (unless -P is explicit)
	  if (options.followsymlink) {
	    options.noFollowsymlink = false;
	  }
	  if (!options.recursive && !options.noFollowsymlink) {
	    options.followsymlink = true;
	  }

	  // Get sources, dest
	  if (arguments.length < 3) {
	    common.error('missing <source> and/or <dest>');
	  } else {
	    sources = [].slice.call(arguments, 1, arguments.length - 1);
	    dest = arguments[arguments.length - 1];
	  }

	  const destExists = fs.existsSync(dest);
	  const destStat = destExists && common.statFollowLinks(dest);

	  // Dest is not existing dir, but multiple sources given
	  if ((!destExists || !destStat.isDirectory()) && sources.length > 1) {
	    common.error('dest is not a directory (too many sources)');
	  }

	  // Dest is an existing file, but -n is given
	  if (destExists && destStat.isFile() && options.no_force) {
	    return new common.ShellString('', '', 0);
	  }

	  sources.forEach((src, srcIndex) => {
	    if (!fs.existsSync(src)) {
	      if (src === '') src = "''"; // if src was empty string, display empty string
	      common.error(`no such file or directory: ${src}`, { continue: true });
	      return; // skip file
	    }
	    const srcStat = common.statFollowLinks(src);
	    if (!options.noFollowsymlink && srcStat.isDirectory()) {
	      if (!options.recursive) {
	        // Non-Recursive
	        common.error(`omitting directory '${src}'`, { continue: true });
	      } else {
	        // Recursive
	        // 'cp /a/source dest' should create 'source' in 'dest'
	        const newDest = (destStat && destStat.isDirectory()) ?
	            path.join(dest, path.basename(src)) :
	            dest;

	        try {
	          common.statFollowLinks(path.dirname(dest));
	          cpdirSyncRecursive(src, newDest, 0, options);
	        } catch (e) {
	          /* istanbul ignore next */
	          common.error(`cannot create directory '${dest}': No such file or directory`);
	        }
	      }
	    } else {
	      // If here, src is a file

	      // When copying to '/path/dir':
	      //    thisDest = '/path/dir/file1'
	      let thisDest = dest;
	      if (destStat && destStat.isDirectory()) {
	        thisDest = path.normalize(`${dest}/${path.basename(src)}`);
	      }

	      const thisDestExists = fs.existsSync(thisDest);
	      if (thisDestExists && checkRecentCreated(sources, srcIndex)) {
	        // cannot overwrite file created recently in current execution, but we want to continue copying other files
	        if (!options.no_force) {
	          common.error(`will not overwrite just-created '${thisDest}' with '${src}'`, { continue: true });
	        }
	        return;
	      }

	      if (thisDestExists && options.no_force) {
	        return; // skip file
	      }

	      if (path.relative(src, thisDest) === '') {
	        // a file cannot be copied to itself, but we want to continue copying other files
	        common.error(`'${thisDest}' and '${src}' are the same file`, { continue: true });
	        return;
	      }

	      copyFileSync(src, thisDest, options);
	    }
	  }); // forEach(src)

	  return new common.ShellString('', common.state.error, common.state.errorCode);
	}
	cp = _cp;
	return cp;
}

const dirs = {};

let hasRequiredDirs;

// ==> Dirs () {
function requireDirs () {
	if (hasRequiredDirs) return dirs;
	hasRequiredDirs = 1;
	const common = requireCommon();
	const _cd = requireCd();
	const path = require$$2;

	common.register('dirs', _dirs, {
	  wrapOutput: false,
	});
	common.register('pushd', _pushd, {
	  wrapOutput: false,
	});
	common.register('popd', _popd, {
	  wrapOutput: false,
	});

	// Pushd/popd/dirs internals
	let _dirStack = [];

	function _isStackIndex(index) {
	  return (/^[-+]\d+$/).test(index);
	}

	function _parseStackIndex(index) {
	  if (_isStackIndex(index)) {
	    if (Math.abs(index) < _dirStack.length + 1) { // +1 for pwd
	      return (/^-/).test(index) ? Number(index) - 1 : Number(index);
	    }
	    common.error(`${index}: directory stack index out of range`);
	  } else {
	    common.error(`${index}: invalid number`);
	  }
	}

	function _actualDirStack() {
	  return [process.cwd()].concat(_dirStack);
	}

	//@
	//@ ### pushd([options,] [dir | '-N' | '+N'])
	//@
	//@ Available options:
	//@
	//@ + `-n`: Suppresses the normal change of directory when adding directories to the stack, so that only the stack is manipulated.
	//@ + `-q`: Suppresses output to the console.
	//@
	//@ Arguments:
	//@
	//@ + `dir`: Sets the current working directory to the top of the stack, then executes the equivalent of `cd dir`.
	//@ + `+N`: Brings the Nth directory (counting from the left of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
	//@ + `-N`: Brings the Nth directory (counting from the right of the list printed by dirs, starting with zero) to the top of the list by rotating the stack.
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ // process.cwd() === '/usr'
	//@ pushd('/etc'); // Returns /etc /usr
	//@ pushd('+1');   // Returns /usr /etc
	//@ ```
	//@
	//@ Save the current directory on the top of the directory stack and then `cd` to `dir`. With no arguments, `pushd` exchanges the top two directories. Returns an array of paths in the stack.
	function _pushd(options, dir) {
	  if (_isStackIndex(options)) {
	    dir = options;
	    options = '';
	  }

	  options = common.parseOptions(options, {
	    'n': 'no-cd',
	    'q': 'quiet',
	  });

	  let dirs = _actualDirStack();

	  if (dir === '+0') {
	    return dirs; // +0 is a noop
	  } else if (!dir) {
	    if (dirs.length > 1) {
	      dirs = dirs.splice(1, 1).concat(dirs);
	    } else {
	      return common.error('no other directory');
	    }
	  } else if (_isStackIndex(dir)) {
	    const n = _parseStackIndex(dir);
	    dirs = dirs.slice(n).concat(dirs.slice(0, n));
	  } else if (options['no-cd']) {
	    dirs.splice(1, 0, dir);
	  } else {
	    dirs.unshift(dir);
	  }

	  if (options['no-cd']) {
	    dirs = dirs.slice(1);
	  } else {
	    dir = path.resolve(dirs.shift());
	    _cd('', dir);
	  }

	  _dirStack = dirs;
	  return _dirs(options.quiet ? '-q' : '');
	}
	dirs.pushd = _pushd;

	//@
	//@
	//@ ### popd([options,] ['-N' | '+N'])
	//@
	//@ Available options:
	//@
	//@ + `-n`: Suppress the normal directory change when removing directories from the stack, so that only the stack is manipulated.
	//@ + `-q`: Suppresses output to the console.
	//@
	//@ Arguments:
	//@
	//@ + `+N`: Removes the Nth directory (counting from the left of the list printed by dirs), starting with zero.
	//@ + `-N`: Removes the Nth directory (counting from the right of the list printed by dirs), starting with zero.
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ echo(process.cwd()); // '/usr'
	//@ pushd('/etc');       // '/etc /usr'
	//@ echo(process.cwd()); // '/etc'
	//@ popd();              // '/usr'
	//@ echo(process.cwd()); // '/usr'
	//@ ```
	//@
	//@ When no arguments are given, `popd` removes the top directory from the stack and performs a `cd` to the new top directory. The elements are numbered from 0, starting at the first directory listed with dirs (i.e., `popd` is equivalent to `popd +0`). Returns an array of paths in the stack.
	function _popd(options, index) {
	  if (_isStackIndex(options)) {
	    index = options;
	    options = '';
	  }

	  options = common.parseOptions(options, {
	    'n': 'no-cd',
	    'q': 'quiet',
	  });

	  if (!_dirStack.length) {
	    return common.error('directory stack empty');
	  }

	  index = _parseStackIndex(index || '+0');

	  if (options['no-cd'] || index > 0 || _dirStack.length + index === 0) {
	    index = index > 0 ? index - 1 : index;
	    _dirStack.splice(index, 1);
	  } else {
	    const dir = path.resolve(_dirStack.shift());
	    _cd('', dir);
	  }

	  return _dirs(options.quiet ? '-q' : '');
	}
	dirs.popd = _popd;

	//@
	//@
	//@ ### dirs([options | '+N' | '-N'])
	//@
	//@ Available options:
	//@
	//@ + `-c`: Clears the directory stack by deleting all of the elements.
	//@ + `-q`: Suppresses output to the console.
	//@
	//@ Arguments:
	//@
	//@ + `+N`: Displays the Nth directory (counting from the left of the list printed by dirs when invoked without options), starting with zero.
	//@ + `-N`: Displays the Nth directory (counting from the right of the list printed by dirs when invoked without options), starting with zero.
	//@
	//@ Display the list of currently remembered directories. Returns an array of paths in the stack, or a single path if `+N` or `-N` was specified.
	//@
	//@ See also: `pushd`, `popd`
	function _dirs(options, index) {
	  if (_isStackIndex(options)) {
	    index = options;
	    options = '';
	  }

	  options = common.parseOptions(options, {
	    'c': 'clear',
	    'q': 'quiet',
	  });

	  if (options.clear) {
	    _dirStack = [];
	    return _dirStack;
	  }

	  const stack = _actualDirStack();

	  if (index) {
	    index = _parseStackIndex(index);

	    if (index < 0) {
	      index = stack.length + index;
	    }

	    if (!options.quiet) {
	      common.log(stack[index]);
	    }
	    return stack[index];
	  }

	  if (!options.quiet) {
	    common.log(stack.join(' '));
	  }

	  return stack;
	}
	dirs.dirs = _dirs;
	return dirs;
}

let echo;
let hasRequiredEcho;

// ==> Echo () {
function requireEcho () {
	if (hasRequiredEcho) return echo;
	hasRequiredEcho = 1;
	const format = require$$0$1.format;

	const common = requireCommon();

	common.register('echo', _echo, {
	  allowGlobbing: false,
	});

	//@
	//@ ### echo([options,] string [, string ...])
	//@
	//@ Available options:
	//@
	//@ + `-e`: interpret backslash escapes (default)
	//@ + `-n`: remove trailing newline from output
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ echo('hello world');
	//@ var str = echo('hello world');
	//@ echo('-n', 'no newline at end');
	//@ ```
	//@
	//@ Prints `string` to stdout, and returns a [ShellString](#shellstringstr).
	function _echo(opts) {
	  // allow strings starting with '-', see issue #20
	  const messages = [].slice.call(arguments, opts ? 0 : 1);
	  let options = {};

	  // If the first argument starts with '-', parse it as options string.
	  // If parseOptions throws, it wasn't an options string.
	  try {
	    options = common.parseOptions(messages[0], {
	      'e': 'escapes',
	      'n': 'no_newline',
	    }, {
	      silent: true,
	    });

	    // Allow null to be echoed
	    if (messages[0]) {
	      messages.shift();
	    }
	  } catch (_) {
	    // Clear out error if an error occurred
	    common.state.error = null;
	  }

	  let output = format(...messages);

	  // Add newline if -n is not passed.
	  if (!options.no_newline) {
	    output += '\n';
	  }

	  process.stdout.write(output);

	  return output;
	}

	echo = _echo;
	return echo;
}

const tempdir = {};

let hasRequiredTempdir;

// ==> Tempdir () {
function requireTempdir () {
	if (hasRequiredTempdir) return tempdir;
	hasRequiredTempdir = 1;
	const common = requireCommon();
	const os = require$$0;
	const fs = require$$1;

	common.register('tempdir', _tempDir, {
	  allowGlobbing: false,
	  wrapOutput: false,
	});

	// Returns false if 'dir' is not a writeable directory, 'dir' otherwise
	function writeableDir(dir) {
	  if (!dir || !fs.existsSync(dir)) return false;

	  if (!common.statFollowLinks(dir).isDirectory()) return false;

	  const testFile = `${dir}/${common.randomFileName()}`;
	  try {
	    fs.writeFileSync(testFile, ' ');
	    common.unlinkSync(testFile);
	    return dir;
	  } catch (e) {
	    /* istanbul ignore next */
	    return false;
	  }
	}

	// Variable to cache the tempdir value for successive lookups.
	let cachedTempDir;

	//@
	//@ ### tempdir()
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var tmp = tempdir(); // "/tmp" for most *nix platforms
	//@ ```
	//@
	//@ Searches and returns string containing a writeable, platform-dependent temporary directory.
	//@ Follows Python's [tempfile algorithm](http://docs.python.org/library/tempfile.html#tempfile.tempdir).
	function _tempDir() {
	  if (cachedTempDir) return cachedTempDir;

	  cachedTempDir = writeableDir(os.tmpdir()) ||
	                  writeableDir(process.env.TMPDIR) ||
	                  writeableDir(process.env.TEMP) ||
	                  writeableDir(process.env.TMP) ||
	                  writeableDir(process.env.Wimp$ScrapDir) || // RiscOS
	                  writeableDir('C:\\TEMP') || // Windows
	                  writeableDir('C:\\TMP') || // Windows
	                  writeableDir('\\TEMP') || // Windows
	                  writeableDir('\\TMP') || // Windows
	                  writeableDir('/tmp') ||
	                  writeableDir('/var/tmp') ||
	                  writeableDir('/usr/tmp') ||
	                  writeableDir('.'); // last resort

	  return cachedTempDir;
	}

	// Indicates if the tempdir value is currently cached. This is exposed for tests
	// only. The return value should only be tested for truthiness.
	function isCached() {
	  return cachedTempDir;
	}

	// Clears the cached tempDir value, if one is cached. This is exposed for tests
	// only.
	function clearCache() {
	  cachedTempDir = undefined;
	}

	tempdir.tempDir = _tempDir;
	tempdir.isCached = isCached;
	tempdir.clearCache = clearCache;
	return tempdir;
}

let pwd;
let hasRequiredPwd;

// ==> Pwd () {
function requirePwd () {
	if (hasRequiredPwd) return pwd;
	hasRequiredPwd = 1;
	const path = require$$2;
	const common = requireCommon();

	common.register('pwd', _pwd, {
	  allowGlobbing: false,
	});

	//@
	//@ ### pwd()
	//@
	//@ Returns the current directory as a [ShellString](#shellstringstr).
	function _pwd() {
	  const pwd = path.resolve(process.cwd());
	  return pwd;
	}
	pwd = _pwd;
	return pwd;
}

let exec;
let hasRequiredExec;

// ==> Exec () {
function requireExec () {
	if (hasRequiredExec) return exec;
	hasRequiredExec = 1;
	const common = requireCommon();
	const _tempDir = requireTempdir().tempDir;
	const _pwd = requirePwd();
	const path = require$$2;
	const fs = require$$1;
	const child = require$$5;

	const DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;
	const DEFAULT_ERROR_CODE = 1;

	common.register('exec', _exec, {
	  unix: false,
	  canReceivePipe: true,
	  wrapOutput: false,
	  handlesFatalDynamically: true,
	});

	// We use this function to run `exec` synchronously while also providing realtime
	// output.
	function execSync(cmd, opts, pipe) {
	  if (!common.config.execPath) {
	    try {
	        common.error('Unable to find a path to the node binary. Please manually set config.execPath');
	    } catch (e) {
	      if (opts.fatal) {
	        throw e;
	      }

	      return;
	    }
	  }

	  const tempDir = _tempDir();
	  const paramsFile = path.join(tempDir, common.randomFileName());
	  const stderrFile = path.join(tempDir, common.randomFileName());
	  const stdoutFile = path.join(tempDir, common.randomFileName());

	  opts = common.extend({
	    silent: common.config.silent,
	    fatal: common.config.fatal, // TODO(nfischer): this and the line above are probably unnecessary
	    cwd: _pwd().toString(),
	    env: process.env,
	    maxBuffer: DEFAULT_MAXBUFFER_SIZE,
	    encoding: 'utf8',
	  }, opts);

	  if (fs.existsSync(paramsFile)) common.unlinkSync(paramsFile);
	  if (fs.existsSync(stderrFile)) common.unlinkSync(stderrFile);
	  if (fs.existsSync(stdoutFile)) common.unlinkSync(stdoutFile);

	  opts.cwd = path.resolve(opts.cwd);

	  const paramsToSerialize = {
	    command: cmd,
	    execOptions: opts,
	    pipe,
	    stdoutFile,
	    stderrFile,
	  };

	  // Create the files and ensure these are locked down (for read and write) to
	  // the current user. The main concerns here are:
	  //
	  // * If we execute a command which prints sensitive output, then
	  //   stdoutFile/stderrFile must not be readable by other users.
	  // * paramsFile must not be readable by other users, or else they can read it
	  //   to figure out the path for stdoutFile/stderrFile and create these first
	  //   (locked down to their own access), which will crash exec() when it tries
	  //   to write to the files.
	  function writeFileLockedDown(filePath, data) {
	    fs.writeFileSync(filePath, data, {
	      encoding: 'utf8',
	      mode: parseInt('600', 8),
	    });
	  }
	  writeFileLockedDown(stdoutFile, '');
	  writeFileLockedDown(stderrFile, '');
	  writeFileLockedDown(paramsFile, JSON.stringify(paramsToSerialize));

	  const execArgs = [
	    path.join(__dirname, 'exec-child.js'),
	    paramsFile,
	  ];

	  /* istanbul ignore else */
	  if (opts.silent) {
	    opts.stdio = 'ignore';
	  } else {
	    opts.stdio = [0, 1, 2];
	  }

	  let code = 0;

	  // Welcome to the future
	  try {
	    // Bad things if we pass in a `shell` option to child_process.execFileSync,
	    // so we need to explicitly remove it here.
	    delete opts.shell;

	    child.execFileSync(common.config.execPath, execArgs, opts);
	  } catch (e) {
	    // Commands with non-zero exit code raise an exception.
	    code = e.status || DEFAULT_ERROR_CODE;
	  }

	  // fs.readFileSync uses buffer encoding by default, so call
	  // it without the encoding option if the encoding is 'buffer'.
	  // Also, if the exec timeout is too short for node to start up,
	  // the files will not be created, so these calls will throw.
	  let stdout = '';
	  let stderr = '';
	  if (opts.encoding === 'buffer') {
	    stdout = fs.readFileSync(stdoutFile);
	    stderr = fs.readFileSync(stderrFile);
	  } else {
	    stdout = fs.readFileSync(stdoutFile, opts.encoding);
	    stderr = fs.readFileSync(stderrFile, opts.encoding);
	  }

	  // No biggie if we can't erase the files now -- they're in a temp dir anyway
	  // and we locked down permissions (see the note above).
	  try { common.unlinkSync(paramsFile); } catch (e) {}
	  try { common.unlinkSync(stderrFile); } catch (e) {}
	  try { common.unlinkSync(stdoutFile); } catch (e) {}

	  if (code !== 0) {
	    // Note: `silent` should be unconditionally true to avoid double-printing
	    // the command's stderr, and to avoid printing any stderr when the user has
	    // set `shell.config.silent`.
	    common.error(stderr, code, { continue: true, silent: true, fatal: opts.fatal });
	  }
	  const obj = common.ShellString(stdout, stderr, code);
	  return obj;
	} // execSync()

	// Wrapper around exec() to enable echoing output to console in real time
	function execAsync(cmd, opts, pipe, callback) {
	  opts = common.extend({
	    silent: common.config.silent,
	    fatal: common.config.fatal, // TODO(nfischer): this and the line above are probably unnecessary
	    cwd: _pwd().toString(),
	    env: process.env,
	    maxBuffer: DEFAULT_MAXBUFFER_SIZE,
	    encoding: 'utf8',
	  }, opts);

	  const c = child.exec(cmd, opts, (err, stdout, stderr) => {
	    if (callback) {
	      if (!err) {
	        callback(0, stdout, stderr);
	      } else if (err.code === undefined) {
	        // See issue #536
	        /* istanbul ignore next */
	        callback(1, stdout, stderr);
	      } else {
	        callback(err.code, stdout, stderr);
	      }
	    }
	  });

	  if (pipe) c.stdin.end(pipe);

	  if (!opts.silent) {
	    c.stdout.pipe(process.stdout);
	    c.stderr.pipe(process.stderr);
	  }

	  return c;
	}

	//@
	//@ ### exec(command [, options] [, callback])
	//@
	//@ Available options:
	//@
	//@ + `async`: Asynchronous execution. If a callback is provided, it will be set to
	//@   `true`, regardless of the passed value (default: `false`).
	//@ + `fatal`: Exit upon error (default: `false`).
	//@ + `silent`: Do not echo program output to console (default: `false`).
	//@ + `encoding`: Character encoding to use. Affects the values returned to stdout and stderr, and
	//@   what is written to stdout and stderr when not in silent mode (default: `'utf8'`).
	//@ + and any option available to Node.js's
	//@   [`child_process.exec()`](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var version = exec('node --version', {silent:true}).stdout;
	//@
	//@ var child = exec('some_long_running_process', {async:true});
	//@ child.stdout.on('data', function(data) {
	//@   /* ... do something with data ... */
	//@ });
	//@
	//@ exec('some_long_running_process', function(code, stdout, stderr) {
	//@   console.log('Exit code:', code);
	//@   console.log('Program output:', stdout);
	//@   console.log('Program stderr:', stderr);
	//@ });
	//@ ```
	//@
	//@ Executes the given `command` _synchronously_, unless otherwise specified.
	//@ When in synchronous mode, this returns a [ShellString](#shellstringstr).
	//@ Otherwise, this returns the child process object, and the `callback`
	//@ receives the arguments `(code, stdout, stderr)`.
	//@
	//@ Not seeing the behavior you want? `exec()` runs everything through `sh`
	//@ by default (or `cmd.exe` on Windows), which differs from `bash`. If you
	//@ need bash-specific behavior, try out the `{shell: 'path/to/bash'}` option.
	//@
	//@ **Security note:** as `shell.exec()` executes an arbitrary string in the
	//@ system shell, it is **critical** to properly sanitize user input to avoid
	//@ **command injection**. For more context, consult the [Security
	//@ Guidelines](https://github.com/shelljs/shelljs/wiki/Security-guidelines).
	function _exec(command, options = {}, callback) {
      const pipe = common.readFromPipe();

      // Callback is defined instead of options.
      if (typeof options === 'function') {
	    callback = options;
	    options = { async: true };
	  }

      // Callback is defined with options.
      if (typeof options === 'object' && typeof callback === 'function') {
	    options.async = true;
	  }

      options = common.extend({
	    silent: common.config.silent,
	    fatal: common.config.fatal,
	    async: false,
	  }, options);

      if (!command) {
	    try {
	      common.error('must specify command');
	    } catch (e) {
	      if (options.fatal) {
	        throw e;
	      }

	      return;
	    }
	  }

      if (options.async) {
	    return execAsync(command, options, pipe, callback);
	  } else {
	    return execSync(command, options, pipe);
	  }
    }
	exec = _exec;
	return exec;
}

const old = {};

let hasRequiredOld;

// ==> Old () {
function requireOld () {
	if (hasRequiredOld) return old;
	hasRequiredOld = 1;
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	const pathModule = require$$2;
	const isWindows = process.platform === 'win32';
	const fs = require$$1;

	// JavaScript implementation of realpath, ported from node pre-v6

	const DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

	function rethrow() {
	  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
	  // is fairly slow to generate.
	  let callback;
	  if (DEBUG) {
	    var backtrace = new Error;
	    callback = debugCallback;
	  } else
	    callback = missingCallback;

	  return callback;

	  function debugCallback(err) {
	    if (err) {
	      backtrace.message = err.message;
	      err = backtrace;
	      missingCallback(err);
	    }
	  }

	  function missingCallback(err) {
	    if (err) {
	      if (process.throwDeprecation)
	        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
	      else if (!process.noDeprecation) {
	        const msg = `fs: missing callback ${err.stack || err.message}`;
	        if (process.traceDeprecation)
	          console.trace(msg);
	        else
	          console.error(msg);
	      }
	    }
	  }
	}

	function maybeCallback(cb) {
	  return typeof cb === 'function' ? cb : rethrow();
	}

	pathModule.normalize;

	// Regexp that finds the next partion of a (partial) path
	// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
	if (isWindows) {
	  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
	} else {
	  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
	}

	// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
	if (isWindows) {
	  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
	} else {
	  var splitRootRe = /^[\/]*/;
	}

	old.realpathSync = function realpathSync(p, cache) {
      // make p is absolute
      p = pathModule.resolve(p);

      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return cache[p];
	  }

      const original = p;
      const seenLinks = {};
      const knownHard = {};

      // current character position in p
      let pos;
      // the partial path so far, including a trailing slash if any
      let current;
      // the partial path without a trailing slash (except when pointing at a root)
      let base;
      // the partial path scanned in the previous round, with slash
      let previous;

      start();

      function start() {
	    // Skip over roots
	    const m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstatSync(base);
	      knownHard[base] = true;
	    }
	  }

      // walk down the path, swapping out linked pathparts for their real
      // values
      // NB: p.length changes.
      while (pos < p.length) {
	    // find the next part
	    nextPartRe.lastIndex = pos;
	    const result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      continue;
	    }

	    let resolvedLink;
	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // some known symbolic link.  no need to stat again.
	      resolvedLink = cache[base];
	    } else {
	      const stat = fs.lstatSync(base);
	      if (!stat.isSymbolicLink()) {
	        knownHard[base] = true;
	        if (cache) cache[base] = base;
	        continue;
	      }

	      // read the link if it wasn't read before
	      // dev/ino always return 0 on windows, so skip the check.
	      let linkTarget = null;
	      if (!isWindows) {
	        var id = `${stat.dev.toString(32)}:${stat.ino.toString(32)}`;
	        if (seenLinks.hasOwnProperty(id)) {
	          linkTarget = seenLinks[id];
	        }
	      }
	      if (linkTarget === null) {
	        fs.statSync(base);
	        linkTarget = fs.readlinkSync(base);
	      }
	      resolvedLink = pathModule.resolve(previous, linkTarget);
	      // track this, if given a cache.
	      if (cache) cache[base] = resolvedLink;
	      if (!isWindows) seenLinks[id] = linkTarget;
	    }

	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }

      if (cache) cache[original] = p;

      return p;
    };


	old.realpath = function realpath(p, cache, cb) {
      if (typeof cb !== 'function') {
	    cb = maybeCallback(cache);
	    cache = null;
	  }

      // make p is absolute
      p = pathModule.resolve(p);

      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return process.nextTick(cb.bind(null, null, cache[p]));
	  }

      const original = p;
      const seenLinks = {};
      const knownHard = {};

      // current character position in p
      let pos;
      // the partial path so far, including a trailing slash if any
      let current;
      // the partial path without a trailing slash (except when pointing at a root)
      let base;
      // the partial path scanned in the previous round, with slash
      let previous;

      start();

      function start() {
	    // Skip over roots
	    const m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstat(base, err => {
	        if (err) return cb(err);
	        knownHard[base] = true;
	        LOOP();
	      });
	    } else {
	      process.nextTick(LOOP);
	    }
	  }

      // walk down the path, swapping out linked pathparts for their real
      // values
      function LOOP() {
	    // stop if scanned past end of path
	    if (pos >= p.length) {
	      if (cache) cache[original] = p;
	      return cb(null, p);
	    }

	    // find the next part
	    nextPartRe.lastIndex = pos;
	    const result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      return process.nextTick(LOOP);
	    }

	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // known symbolic link.  no need to stat again.
	      return gotResolvedLink(cache[base]);
	    }

	    return fs.lstat(base, gotStat);
	  }

      function gotStat(err, stat) {
	    if (err) return cb(err);

	    // if not a symlink, skip to the next path part
	    if (!stat.isSymbolicLink()) {
	      knownHard[base] = true;
	      if (cache) cache[base] = base;
	      return process.nextTick(LOOP);
	    }

	    // stat & read the link if not read before
	    // call gotTarget as soon as the link target is known
	    // dev/ino always return 0 on windows, so skip the check.
	    if (!isWindows) {
	      var id = `${stat.dev.toString(32)}:${stat.ino.toString(32)}`;
	      if (seenLinks.hasOwnProperty(id)) {
	        return gotTarget(null, seenLinks[id], base);
	      }
	    }
	    fs.stat(base, err => {
	      if (err) return cb(err);

	      fs.readlink(base, (err, target) => {
	        if (!isWindows) seenLinks[id] = target;
	        gotTarget(err, target);
	      });
	    });
	  }

      function gotTarget(err, target, base) {
	    if (err) return cb(err);

	    const resolvedLink = pathModule.resolve(previous, target);
	    if (cache) cache[base] = resolvedLink;
	    gotResolvedLink(resolvedLink);
	  }

      function gotResolvedLink(resolvedLink) {
	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }
    };
	return old;
}

let fs_realpath;
let hasRequiredFs_realpath;

// ==> Fs_realpath () {
function requireFs_realpath () {
	if (hasRequiredFs_realpath) return fs_realpath;
	hasRequiredFs_realpath = 1;
	fs_realpath = realpath;
	realpath.realpath = realpath;
	realpath.sync = realpathSync;
	realpath.realpathSync = realpathSync;
	realpath.monkeypatch = monkeypatch;
	realpath.unmonkeypatch = unmonkeypatch;

	const fs = require$$1;
	const origRealpath = fs.realpath;
	const origRealpathSync = fs.realpathSync;

	const version = process.version;
	const ok = /^v[0-5]\./.test(version);
	const old = requireOld();

	function newError (er) {
	  return er && er.syscall === 'realpath' && (
	    er.code === 'ELOOP' ||
	    er.code === 'ENOMEM' ||
	    er.code === 'ENAMETOOLONG'
	  )
	}

	function realpath (p, cache, cb) {
	  if (ok) {
	    return origRealpath(p, cache, cb)
	  }

	  if (typeof cache === 'function') {
	    cb = cache;
	    cache = null;
	  }
	  origRealpath(p, cache, (er, result) => {
	    if (newError(er)) {
	      old.realpath(p, cache, cb);
	    } else {
	      cb(er, result);
	    }
	  });
	}

	function realpathSync (p, cache) {
	  if (ok) {
	    return origRealpathSync(p, cache)
	  }

	  try {
	    return origRealpathSync(p, cache)
	  } catch (er) {
	    if (newError(er)) {
	      return old.realpathSync(p, cache)
	    } else {
	      throw er
	    }
	  }
	}

	function monkeypatch () {
	  fs.realpath = realpath;
	  fs.realpathSync = realpathSync;
	}

	function unmonkeypatch () {
	  fs.realpath = origRealpath;
	  fs.realpathSync = origRealpathSync;
	}
	return fs_realpath;
}

let concatMap;
let hasRequiredConcatMap;

// ==> ConcatMap () {
function requireConcatMap () {
	if (hasRequiredConcatMap) return concatMap;
	hasRequiredConcatMap = 1;
	concatMap = (xs, fn) => {
	    const res = [];
	    for (let i = 0; i < xs.length; i++) {
	        const x = fn(xs[i], i);
	        if (isArray(x)) res.push(...x);
	        else res.push(x);
	    }
	    return res;
	};

	var isArray = Array.isArray || (xs => {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	});
	return concatMap;
}

let balancedMatch;
let hasRequiredBalancedMatch;

// ==> BalancedMatch () {
function requireBalancedMatch () {
	if (hasRequiredBalancedMatch) return balancedMatch;
	hasRequiredBalancedMatch = 1;
	balancedMatch = balanced;
	function balanced(a, b, str) {
	  if (a instanceof RegExp) a = maybeMatch(a, str);
	  if (b instanceof RegExp) b = maybeMatch(b, str);

	  const r = range(a, b, str);

	  return r && {
	    start: r[0],
	    end: r[1],
	    pre: str.slice(0, r[0]),
	    body: str.slice(r[0] + a.length, r[1]),
	    post: str.slice(r[1] + b.length)
	  };
	}

	function maybeMatch(reg, str) {
	  const m = str.match(reg);
	  return m ? m[0] : null;
	}

	balanced.range = range;
	function range(a, b, str) {
      let begs;
      let beg;
      let left;
      let right;
      let result;
      let ai = str.indexOf(a);
      let bi = str.indexOf(b, ai + 1);
      let i = ai;

      if (ai >= 0 && bi > 0) {
	    if(a===b) {
	      return [ai, bi];
	    }
	    begs = [];
	    left = str.length;

	    while (i >= 0 && !result) {
	      if (i == ai) {
	        begs.push(i);
	        ai = str.indexOf(a, i + 1);
	      } else if (begs.length == 1) {
	        result = [ begs.pop(), bi ];
	      } else {
	        beg = begs.pop();
	        if (beg < left) {
	          left = beg;
	          right = bi;
	        }

	        bi = str.indexOf(b, i + 1);
	      }

	      i = ai < bi && ai >= 0 ? ai : bi;
	    }

	    if (begs.length) {
	      result = [ left, right ];
	    }
	  }

      return result;
    }
	return balancedMatch;
}

let braceExpansion;
let hasRequiredBraceExpansion;

// ==> BraceExpansion () {
function requireBraceExpansion () {
	if (hasRequiredBraceExpansion) return braceExpansion;
	hasRequiredBraceExpansion = 1;
	const concatMap = requireConcatMap();
	const balanced = requireBalancedMatch();

	braceExpansion = expandTop;

	const escSlash = `\0SLASH${Math.random()}\0`;
	const escOpen = `\0OPEN${Math.random()}\0`;
	const escClose = `\0CLOSE${Math.random()}\0`;
	const escComma = `\0COMMA${Math.random()}\0`;
	const escPeriod = `\0PERIOD${Math.random()}\0`;

	function numeric(str) {
	  return parseInt(str, 10) == str
	    ? parseInt(str, 10)
	    : str.charCodeAt(0);
	}

	function escapeBraces(str) {
	  return str.split('\\\\').join(escSlash)
	            .split('\\{').join(escOpen)
	            .split('\\}').join(escClose)
	            .split('\\,').join(escComma)
	            .split('\\.').join(escPeriod);
	}

	function unescapeBraces(str) {
	  return str.split(escSlash).join('\\')
	            .split(escOpen).join('{')
	            .split(escClose).join('}')
	            .split(escComma).join(',')
	            .split(escPeriod).join('.');
	}


	// Basically just str.split(","), but handling cases
	// where we have nested braced sections, which should be
	// treated as individual members, like {a,{b,c},d}
	function parseCommaParts(str) {
	  if (!str)
	    return [''];

	  const parts = [];
	  const m = balanced('{', '}', str);

	  if (!m)
	    return str.split(',');

	  const pre = m.pre;
	  const body = m.body;
	  const post = m.post;
	  const p = pre.split(',');

	  p[p.length-1] += `{${body}}`;
	  const postParts = parseCommaParts(post);
	  if (post.length) {
	    p[p.length-1] += postParts.shift();
	    p.push(...postParts);
	  }

	  parts.push(...p);

	  return parts;
	}

	function expandTop(str) {
	  if (!str)
	    return [];

	  // I don't know why Bash 4.3 does this, but it does.
	  // Anything starting with {} will have the first two bytes preserved
	  // but *only* at the top level, so {},a}b will not expand to anything,
	  // but a{},b}c will be expanded to [a}c,abc].
	  // One could argue that this is a bug in Bash, but since the goal of
	  // this module is to match Bash's rules, we escape a leading {}
	  if (str.substr(0, 2) === '{}') {
	    str = `\\{\\}${str.substr(2)}`;
	  }

	  return expand(escapeBraces(str), true).map(unescapeBraces);
	}

	function embrace(str) {
	  return `{${str}}`;
	}
	function isPadded(el) {
	  return /^-?0\d/.test(el);
	}

	function lte(i, y) {
	  return i <= y;
	}
	function gte(i, y) {
	  return i >= y;
	}

	function expand(str, isTop) {
	  const expansions = [];

	  const m = balanced('{', '}', str);
	  if (!m || /\$$/.test(m.pre)) return [str];

	  const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
	  const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
	  const isSequence = isNumericSequence || isAlphaSequence;
	  const isOptions = m.body.includes(',');
	  if (!isSequence && !isOptions) {
	    // {a},b}
	    if (m.post.match(/,.*\}/)) {
	      str = `${m.pre}{${m.body}${escClose}${m.post}`;
	      return expand(str);
	    }
	    return [str];
	  }

	  let n;
	  if (isSequence) {
	    n = m.body.split(/\.\./);
	  } else {
	    n = parseCommaParts(m.body);
	    if (n.length === 1) {
	      // x{{a,b}}y ==> x{a}y x{b}y
	      n = expand(n[0], false).map(embrace);
	      if (n.length === 1) {
	        var post = m.post.length
	          ? expand(m.post, false)
	          : [''];
	        return post.map(p => {
	          return m.pre + n[0] + p;
	        });
	      }
	    }
	  }

	  // at this point, n is the parts, and we know it's not a comma set
	  // with a single entry.

	  // no need to expand pre, since it is guaranteed to be free of brace-sets
	  const pre = m.pre;
	  var post = m.post.length
	    ? expand(m.post, false)
	    : [''];

	  let N;

	  if (isSequence) {
	    const x = numeric(n[0]);
	    const y = numeric(n[1]);
	    const width = Math.max(n[0].length, n[1].length);
	    let incr = n.length == 3
	      ? Math.abs(numeric(n[2]))
	      : 1;
	    let test = lte;
	    const reverse = y < x;
	    if (reverse) {
	      incr *= -1;
	      test = gte;
	    }
	    const pad = n.some(isPadded);

	    N = [];

	    for (let i = x; test(i, y); i += incr) {
	      let c;
	      if (isAlphaSequence) {
	        c = String.fromCharCode(i);
	        if (c === '\\')
	          c = '';
	      } else {
	        c = String(i);
	        if (pad) {
	          const need = width - c.length;
	          if (need > 0) {
	            const z = new Array(need + 1).join('0');
	            if (i < 0)
	              c = `-${z}${c.slice(1)}`;
	            else
	              c = z + c;
	          }
	        }
	      }
	      N.push(c);
	    }
	  } else {
	    N = concatMap(n, el => { return expand(el, false) });
	  }

	  for (let j = 0; j < N.length; j++) {
	    for (let k = 0; k < post.length; k++) {
	      const expansion = pre + N[j] + post[k];
	      if (!isTop || isSequence || expansion)
	        expansions.push(expansion);
	    }
	  }

	  return expansions;
	}
	return braceExpansion;
}

let minimatch_1;
let hasRequiredMinimatch;

// ==> Minimatch () {
function requireMinimatch () {
  if (hasRequiredMinimatch) return minimatch_1;
  hasRequiredMinimatch = 1;
  minimatch_1 = minimatch;
  minimatch.Minimatch = Minimatch;

  const path = (() => { try { return require('path') } catch (e) {}})() || {
    sep: '/'
  };
  minimatch.sep = path.sep;

  const GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
  const expand = requireBraceExpansion();

  const plTypes = {
    '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
    '?': { open: '(?:', close: ')?' },
    '+': { open: '(?:', close: ')+' },
    '*': { open: '(?:', close: ')*' },
    '@': { open: '(?:', close: ')' }
  };

  // any single thing other than /
  // don't need to escape / when using new RegExp()
  const qmark = '[^/]';

  // * => any number of characters
  const star = `${qmark}*?`;

  // ** when dots are allowed.  Anything goes, except .. and .
  // not (^ or / followed by one or two dots followed by $ or /),
  // followed by anything, any number of times.
  const twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

  // not a ^ or / followed by a dot,
  // followed by anything, any number of times.
  const twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

  // characters that need to be escaped in RegExp.
  const reSpecials = charSet('().*{}+?[]^$\\!');

  // "abc" -> { a:true, b:true, c:true }
  function charSet (s) {
    return s.split('').reduce((set, c) => {
      set[c] = true;
      return set
    }, {});
  }

  // normalizes slashes.
  const slashSplit = /\/+/;

  minimatch.filter = filter;
  function filter(pattern, options = {}) {
    return (p, i, list) => {
      return minimatch(p, pattern, options)
    };
  }

  function ext(a, b = {}) {
    const t = {};
    Object.keys(a).forEach(k => {
      t[k] = a[k];
    });
    Object.keys(b).forEach(k => {
      t[k] = b[k];
    });
    return t
  }

  minimatch.defaults = def => {
    if (!def || typeof def !== 'object' || !Object.keys(def).length) {
      return minimatch
    }

    const orig = minimatch;

    class m {
      constructor(p, pattern, options) {
	    return orig(p, pattern, ext(def, options))
	  }

      static Minimatch(pattern, options) {
	    return new orig.Minimatch(pattern, ext(def, options))
	  }

      static filter(pattern, options) {
	    return orig.filter(pattern, ext(def, options))
	  }

      static defaults(options) {
	    return orig.defaults(ext(def, options))
	  }

      static makeRe(pattern, options) {
	    return orig.makeRe(pattern, ext(def, options))
	  }

      static braceExpand(pattern, options) {
	    return orig.braceExpand(pattern, ext(def, options))
	  }
    }

    m.Minimatch.defaults = function defaults (options) {
      return orig.defaults(ext(def, options)).Minimatch
    };

    m.match = (list, pattern, options) => {
      return orig.match(list, pattern, ext(def, options))
    };

    return m
  };

  Minimatch.defaults = def => {
    return minimatch.defaults(def).Minimatch
  };

  function minimatch (p, pattern, options) {
    assertValidPattern(pattern);

    if (!options) options = {};

    // shortcut: comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
      return false
    }

    return new Minimatch(pattern, options).match(p)
  }

  class Minimatch {
    constructor(pattern, options) {
	  if (!(this instanceof Minimatch)) {
	    return new Minimatch(pattern, options)
	  }

	  assertValidPattern(pattern);

	  if (!options) options = {};

	  pattern = pattern.trim();

	  // windows support: need to use /, not \
	  if (!options.allowWindowsEscape && path.sep !== '/') {
	    pattern = pattern.split(path.sep).join('/');
	  }

	  this.options = options;
	  this.set = [];
	  this.pattern = pattern;
	  this.regexp = null;
	  this.negate = false;
	  this.comment = false;
	  this.empty = false;
	  this.partial = !!options.partial;

	  // make the set of regexps etc.
	  this.make();
	}

    debug() {}

    match(f, partial) {
	  if (typeof partial === 'undefined') partial = this.partial;
	  this.debug('match', f, this.pattern);
	  // short-circuit in the case of busted things.
	  // comments, etc.
	  if (this.comment) return false
	  if (this.empty) return f === ''

	  if (f === '/' && partial) return true

	  const options = this.options;

	  // windows: need to use /, not \
	  if (path.sep !== '/') {
	    f = f.split(path.sep).join('/');
	  }

	  // treat the test path as a set of pathparts.
	  f = f.split(slashSplit);
	  this.debug(this.pattern, 'split', f);

	  // just ONE of the pattern sets in this.set needs to match
	  // in order for it to be valid.  If negating, then just one
	  // match means that we have failed.
	  // Either way, return on the first hit.

	  const set = this.set;
	  this.debug(this.pattern, 'set', set);

	  // Find the basename of the path by looking for the last non-empty segment
	  let filename;
	  let i;
	  for (i = f.length - 1; i >= 0; i--) {
	    filename = f[i];
	    if (filename) break
	  }

	  for (i = 0; i < set.length; i++) {
	    const pattern = set[i];
	    let file = f;
	    if (options.matchBase && pattern.length === 1) {
	      file = [filename];
	    }
	    const hit = this.matchOne(file, pattern, partial);
	    if (hit) {
	      if (options.flipNegate) return true
	      return !this.negate
	    }
	  }

	  // didn't get any hits.  this is success if it's a negative
	  // pattern, failure otherwise.
	  if (options.flipNegate) return false
	  return this.negate
	}

    // set partial to true to test if, for example,
    // "/a/b" matches the start of "/*/b/*/d"
    // Partial means, if you run out of file before you run
    // out of pattern, then that's fine, as long as all
    // the parts match.
    matchOne(file, pattern, partial) {
	  const options = this.options;

	  this.debug('matchOne',
	    { 'this': this, file, pattern });

	  this.debug('matchOne', file.length, pattern.length);

	  for (var fi = 0,
	      pi = 0,
	      fl = file.length,
	      pl = pattern.length
	      ; (fi < fl) && (pi < pl)
	      ; fi++, pi++) {
	    this.debug('matchOne loop');
	    const p = pattern[pi];
	    const f = file[fi];

	    this.debug(pattern, p, f);

	    // should be impossible.
	    // some invalid regexp stuff in the set.
	    /* istanbul ignore if */
	    if (p === false) return false

	    if (p === GLOBSTAR) {
	      this.debug('GLOBSTAR', [pattern, p, f]);

	      // "**"
	      // a/**/b/**/c would match the following:
	      // a/b/x/y/z/c
	      // a/x/y/z/b/c
	      // a/b/x/b/x/c
	      // a/b/c
	      // To do this, take the rest of the pattern after
	      // the **, and see if it would match the file remainder.
	      // If so, return success.
	      // If not, the ** "swallows" a segment, and try again.
	      // This is recursively awful.
	      //
	      // a/**/b/**/c matching a/b/x/y/z/c
	      // - a matches a
	      // - doublestar
	      //   - matchOne(b/x/y/z/c, b/**/c)
	      //     - b matches b
	      //     - doublestar
	      //       - matchOne(x/y/z/c, c) -> no
	      //       - matchOne(y/z/c, c) -> no
	      //       - matchOne(z/c, c) -> no
	      //       - matchOne(c, c) yes, hit
	      let fr = fi;
	      const pr = pi + 1;
	      if (pr === pl) {
	        this.debug('** at the end');
	        // a ** at the end will just swallow the rest.
	        // We have found a match.
	        // however, it will not swallow /.x, unless
	        // options.dot is set.
	        // . and .. are *never* matched by **, for explosively
	        // exponential reasons.
	        for (; fi < fl; fi++) {
	          if (file[fi] === '.' || file[fi] === '..' ||
	            (!options.dot && file[fi].charAt(0) === '.')) return false
	        }
	        return true
	      }

	      // ok, let's see if we can swallow whatever we can.
	      while (fr < fl) {
	        const swallowee = file[fr];

	        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

	        // XXX remove this slice.  Just pass the start index.
	        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
	          this.debug('globstar found match!', fr, fl, swallowee);
	          // found a match.
	          return true
	        } else {
	          // can't swallow "." or ".." ever.
	          // can only swallow ".foo" when explicitly asked.
	          if (swallowee === '.' || swallowee === '..' ||
	            (!options.dot && swallowee.charAt(0) === '.')) {
	            this.debug('dot detected!', file, fr, pattern, pr);
	            break
	          }

	          // ** swallows a segment, and continue.
	          this.debug('globstar swallow a segment, and continue');
	          fr++;
	        }
	      }

	      // no match was found.
	      // However, in partial mode, we can't say this is necessarily over.
	      // If there's more *pattern* left, then
	      /* istanbul ignore if */
	      if (partial) {
	        // ran out of file
	        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
	        if (fr === fl) return true
	      }
	      return false
	    }

	    // something other than **
	    // non-magic patterns just have to match exactly
	    // patterns with magic have been turned into regexps.
	    let hit;
	    if (typeof p === 'string') {
	      hit = f === p;
	      this.debug('string match', p, f, hit);
	    } else {
	      hit = f.match(p);
	      this.debug('pattern match', p, f, hit);
	    }

	    if (!hit) return false
	  }

	  // Note: ending in / means that we'll get a final ""
	  // at the end of the pattern.  This can only match a
	  // corresponding "" at the end of the file.
	  // If the file ends in /, then it can only match a
	  // a pattern that ends in /, unless the pattern just
	  // doesn't have any more for it. But, a/b/ should *not*
	  // match "a/b/*", even though "" matches against the
	  // [^/]*? pattern, except in partial mode, where it might
	  // simply not be reached yet.
	  // However, a/b/ should still satisfy a/*

	  // now either we fell off the end of the pattern, or we're done.
	  if (fi === fl && pi === pl) {
	    // ran out of pattern and filename at the same time.
	    // an exact hit!
	    return true
	  } else if (fi === fl) {
	    // ran out of file, but still had pattern left.
	    // this is ok if we're doing the match as part of
	    // a glob fs traversal.
	    return partial
	  } else /* istanbul ignore else */ if (pi === pl) {
	    // ran out of pattern, still have file left.
	    // this is only acceptable if we're on the very last
	    // empty segment of a file with a trailing slash.
	    // a/* should match a/b/
	    return (fi === fl - 1) && (file[fi] === '')
	  }

	  // should be unreachable.
	  /* istanbul ignore next */
	  throw new Error('wtf?')
	}
  }

  Minimatch.prototype.make = make;
  function make () {
    const pattern = this.pattern;
    const options = this.options;

    // empty patterns and comments match nothing.
    if (!options.nocomment && pattern.charAt(0) === '#') {
      this.comment = true;
      return
    }
    if (!pattern) {
      this.empty = true;
      return
    }

    // step 1: figure out negation, etc.
    this.parseNegate();

    // step 2: expand braces
    let set = this.globSet = this.braceExpand();

    if (options.debug) this.debug = function debug() { console.error(...arguments); };

    this.debug(this.pattern, set);

    // step 3: now we have a set, so turn each one into a series of path-portion
    // matching patterns.
    // These will be regexps, except in the case of "**", which is
    // set to the GLOBSTAR object for globstar behavior,
    // and will not contain any / characters
    set = this.globParts = set.map(s => {
      return s.split(slashSplit)
    });

    this.debug(this.pattern, set);

    // glob --> regexps
    set = set.map(function (s, si, set) {
      return s.map(this.parse, this)
    }, this);

    this.debug(this.pattern, set);

    // filter out everything that didn't compile properly.
    set = set.filter(s => {
      return !s.includes(false);
    });

    this.debug(this.pattern, set);

    this.set = set;
  }

  Minimatch.prototype.parseNegate = parseNegate;
  function parseNegate () {
    const pattern = this.pattern;
    let negate = false;
    const options = this.options;
    let negateOffset = 0;

    if (options.nonegate) return

    for (let i = 0, l = pattern.length
      ; i < l && pattern.charAt(i) === '!'
      ; i++) {
      negate = !negate;
      negateOffset++;
    }

    if (negateOffset) this.pattern = pattern.substr(negateOffset);
    this.negate = negate;
  }

  // Brace expansion:
  // a{b,c}d -> abd acd
  // a{b,}c -> abc ac
  // a{0..3}d -> a0d a1d a2d a3d
  // a{b,c{d,e}f}g -> abg acdfg acefg
  // a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
  //
  // Invalid sets are not expanded.
  // a{2..}b -> a{2..}b
  // a{b}c -> a{b}c
  minimatch.braceExpand = (pattern, options) => {
    return braceExpand(pattern, options)
  };

  Minimatch.prototype.braceExpand = braceExpand;

  function braceExpand (pattern, options) {
    if (!options) {
      if (this instanceof Minimatch) {
        options = this.options;
      } else {
        options = {};
      }
    }

    pattern = typeof pattern === 'undefined'
      ? this.pattern : pattern;

    assertValidPattern(pattern);

    // Thanks to Yeting Li <https://github.com/yetingli> for
    // improving this regexp to avoid a ReDOS vulnerability.
    if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
      // shortcut. no need to expand.
      return [pattern]
    }

    return expand(pattern)
  }

  const MAX_PATTERN_LENGTH = 1024 * 64;
  var assertValidPattern = pattern => {
    if (typeof pattern !== 'string') {
      throw new TypeError('invalid pattern')
    }

    if (pattern.length > MAX_PATTERN_LENGTH) {
      throw new TypeError('pattern is too long')
    }
  };

  // parse a component of the expanded set.
  // At this point, no pattern may contain "/" in it
  // so we're going to return a 2d array, where each entry is the full
  // pattern, split on '/', and then turned into a regular expression.
  // A regexp is made at the end which joins each array with an
  // escaped /, and another full one which joins each regexp with |.
  //
  // Following the lead of Bash 4.1, note that "**" only has special meaning
  // when it is the *only* thing in a path portion.  Otherwise, any series
  // of * is equivalent to a single *.  Globstar behavior is enabled by
  // default, and can be disabled by setting options.noglobstar.
  Minimatch.prototype.parse = parse;
  const SUBPARSE = {};
  function parse (pattern, isSub) {
    assertValidPattern(pattern);

    const options = this.options;

    // shortcuts
    if (pattern === '**') {
      if (!options.noglobstar)
        return GLOBSTAR
      else
        pattern = '*';
    }
    if (pattern === '') return ''

    let re = '';
    let hasMagic = !!options.nocase;
    let escaping = false;
    // ? => one single character
    const patternListStack = [];
    const negativeLists = [];
    let stateChar;
    let inClass = false;
    let reClassStart = -1;
    let classStart = -1;
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.
    const patternStart = pattern.charAt(0) === '.' ? '' // anything
    // not (start or / followed by . or .. followed by / or end)
    : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
    : '(?!\\.)';
    const self = this;

    function clearStateChar () {
      if (stateChar) {
        // we had some state-tracking character
        // that wasn't consumed by this pass.
        switch (stateChar) {
          case '*':
            re += star;
            hasMagic = true;
          break
          case '?':
            re += qmark;
            hasMagic = true;
          break
          default:
            re += `\\${stateChar}`;
          break
        }
        self.debug('clearStateChar %j %j', stateChar, re);
        stateChar = false;
      }
    }

    for (var i = 0, len = pattern.length, c
      ; (i < len) && (c = pattern.charAt(i))
      ; i++) {
      this.debug('%s\t%s %s %j', pattern, i, re, c);

      // skip over any that are escaped.
      if (escaping && reSpecials[c]) {
        re += `\\${c}`;
        escaping = false;
        continue
      }

      switch (c) {
        /* istanbul ignore next */
        case '/': {
          // completely not allowed, even escaped.
          // Should already be path-split by now.
          return false
        }

        case '\\':
          clearStateChar();
          escaping = true;
        continue

        // the various stateChar values
        // for the "extglob" stuff.
        case '?':
        case '*':
        case '+':
        case '@':
        case '!':
          this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

          // all of those are literals inside a class, except that
          // the glob [!a] means [^a] in regexp
          if (inClass) {
            this.debug('  in class');
            if (c === '!' && i === classStart + 1) c = '^';
            re += c;
            continue
          }

          // if we already have a stateChar, then it means
          // that there was something like ** or +? in there.
          // Handle the stateChar, then proceed with this one.
          self.debug('call clearStateChar %j', stateChar);
          clearStateChar();
          stateChar = c;
          // if extglob is disabled, then +(asdf|foo) isn't a thing.
          // just clear the statechar *now*, rather than even diving into
          // the patternList stuff.
          if (options.noext) clearStateChar();
        continue

        case '(':
          if (inClass) {
            re += '(';
            continue
          }

          if (!stateChar) {
            re += '\\(';
            continue
          }

          patternListStack.push({
            type: stateChar,
            start: i - 1,
            reStart: re.length,
            open: plTypes[stateChar].open,
            close: plTypes[stateChar].close
          });
          // negation is (?:(?!js)[^/]*)
          re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
          this.debug('plType %j %j', stateChar, re);
          stateChar = false;
        continue

        case ')':
          if (inClass || !patternListStack.length) {
            re += '\\)';
            continue
          }

          clearStateChar();
          hasMagic = true;
          var pl = patternListStack.pop();
          // negation is (?:(?!js)[^/]*)
          // The others are (?:<pattern>)<type>
          re += pl.close;
          if (pl.type === '!') {
            negativeLists.push(pl);
          }
          pl.reEnd = re.length;
        continue

        case '|':
          if (inClass || !patternListStack.length || escaping) {
            re += '\\|';
            escaping = false;
            continue
          }

          clearStateChar();
          re += '|';
        continue

        // these are mostly the same in regexp and glob
        case '[':
          // swallow any state-tracking char before the [
          clearStateChar();

          if (inClass) {
            re += `\\${c}`;
            continue
          }

          inClass = true;
          classStart = i;
          reClassStart = re.length;
          re += c;
        continue

        case ']':
          //  a right bracket shall lose its special
          //  meaning and represent itself in
          //  a bracket expression if it occurs
          //  first in the list.  -- POSIX.2 2.8.3.2
          if (i === classStart + 1 || !inClass) {
            re += `\\${c}`;
            escaping = false;
            continue
          }

          // handle the case where we left a class open.
          // "[z-a]" is valid, equivalent to "\[z-a\]"
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
            RegExp(`[${cs}]`);
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE);
            re = `${re.substr(0, reClassStart)}\\[${sp[0]}\\]`;
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue
          }

          // finish up the class.
          hasMagic = true;
          inClass = false;
          re += c;
        continue

        default:
          // swallow any state char that wasn't consumed
          clearStateChar();

          if (escaping) {
            // no need
            escaping = false;
          } else if (reSpecials[c]
            && !(c === '^' && inClass)) {
            re += '\\';
          }

          re += c;

      } // switch
    } // for

    // handle the case where we left a class open.
    // "[abc" is valid, equivalent to "\[abc"
    if (inClass) {
      // split where the last [ was, and escape it
      // this is a huge pita.  We now have to re-walk
      // the contents of the would-be class to re-translate
      // any characters that were passed through as-is
      cs = pattern.substr(classStart + 1);
      sp = this.parse(cs, SUBPARSE);
      re = `${re.substr(0, reClassStart)}\\[${sp[0]}`;
      hasMagic = hasMagic || sp[1];
    }

    // handle the case where we had a +( thing at the *end*
    // of the pattern.
    // each pattern list stack adds 3 chars, and we need to go through
    // and escape any | chars that were passed through as-is for the regexp.
    // Go through and escape them, taking care not to double-escape any
    // | chars that were already escaped.
    for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
      let tail = re.slice(pl.reStart + pl.open.length);
      this.debug('setting tail', re, pl);
      // maybe some even number of \, then maybe 1 \, followed by a |
      tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_, $1, $2) => {
        if (!$2) {
          // the | isn't already escaped, so escape it.
          $2 = '\\';
        }

        // need to escape all those slashes *again*, without escaping the
        // one that we need for escaping the | character.  As it works out,
        // escaping an even number of slashes can be done by simply repeating
        // it exactly after itself.  That's why this trick works.
        //
        // I am sorry that you have to see this.
        return `${$1 + $1 + $2}|`;
      });

      this.debug('tail=%j\n   %s', tail, tail, pl, re);
      const t = pl.type === '*' ? star
        : pl.type === '?' ? qmark
        : `\\${pl.type}`;

      hasMagic = true;
      re = `${re.slice(0, pl.reStart) + t}\\(${tail}`;
    }

    // handle trailing things that only matter at the very end.
    clearStateChar();
    if (escaping) {
      // trailing \\
      re += '\\\\';
    }

    // only need to apply the nodot start if the re starts with
    // something that could conceivably capture a dot
    let addPatternStart = false;
    switch (re.charAt(0)) {
      case '[': case '.': case '(': addPatternStart = true;
    }

    // Hack to work around lack of negative lookbehind in JS
    // A pattern like: *.!(x).!(y|z) needs to ensure that a name
    // like 'a.xyz.yz' doesn't match.  So, the first negative
    // lookahead, has to look ALL the way ahead, to the end of
    // the pattern.
    for (let n = negativeLists.length - 1; n > -1; n--) {
      const nl = negativeLists[n];

      const nlBefore = re.slice(0, nl.reStart);
      const nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
      let nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
      let nlAfter = re.slice(nl.reEnd);

      nlLast += nlAfter;

      // Handle nested stuff like *(*.js|!(*.json)), where open parens
      // mean that we should *not* include the ) in the bit that is considered
      // "after" the negated section.
      const openParensBefore = nlBefore.split('(').length - 1;
      let cleanAfter = nlAfter;
      for (i = 0; i < openParensBefore; i++) {
        cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
      }
      nlAfter = cleanAfter;

      let dollar = '';
      if (nlAfter === '' && isSub !== SUBPARSE) {
        dollar = '$';
      }
      const newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
      re = newRe;
    }

    // if the re is not "" at this point, then we need to make sure
    // it doesn't match against an empty path part.
    // Otherwise a/* will match a/, which it should not.
    if (re !== '' && hasMagic) {
      re = `(?=.)${re}`;
    }

    if (addPatternStart) {
      re = patternStart + re;
    }

    // parsing just a piece of a larger pattern.
    if (isSub === SUBPARSE) {
      return [re, hasMagic]
    }

    // skip the regexp for non-magical patterns
    // unescape anything in it, though, so that it'll be
    // an exact match against a file etc.
    if (!hasMagic) {
      return globUnescape(pattern)
    }

    const flags = options.nocase ? 'i' : '';
    try {
      var regExp = new RegExp(`^${re}$`, flags);
    } catch (er) /* istanbul ignore next - should be impossible */ {
      // If it was an invalid regular expression, then it can't match
      // anything.  This trick looks for a character after the end of
      // the string, which is of course impossible, except in multi-line
      // mode, but it's not a /m regex.
      return new RegExp('$.')
    }

    regExp._glob = pattern;
    regExp._src = re;

    return regExp
  }

  minimatch.makeRe = (pattern, options) => {
    return new Minimatch(pattern, options || {}).makeRe()
  };

  Minimatch.prototype.makeRe = makeRe;
  function makeRe () {
    if (this.regexp || this.regexp === false) return this.regexp

    // at this point, this.set is a 2d array of partial
    // pattern strings, or "**".
    //
    // It's better to use .match().  This function shouldn't
    // be used, really, but it's pretty convenient sometimes,
    // when you just want to work with a regex.
    const set = this.set;

    if (!set.length) {
      this.regexp = false;
      return this.regexp
    }
    const options = this.options;

    const twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot;
    const flags = options.nocase ? 'i' : '';

    let re = set.map(pattern => {
      return pattern.map(p => {
        return (p === GLOBSTAR) ? twoStar
        : (typeof p === 'string') ? regExpEscape(p)
        : p._src
      }).join('\\\/');
    }).join('|');

    // must match entire pattern
    // ending in a * or ** will make it less strict.
    re = `^(?:${re})$`;

    // can match anything, as long as it's not this.
    if (this.negate) re = `^(?!${re}).*$`;

    try {
      this.regexp = new RegExp(re, flags);
    } catch (ex) /* istanbul ignore next - should be impossible */ {
      this.regexp = false;
    }
    return this.regexp
  }

  minimatch.match = (list, pattern, options = {}) => {
    const mm = new Minimatch(pattern, options);
    list = list.filter(f => {
      return mm.match(f)
    });
    if (mm.options.nonull && !list.length) {
      list.push(pattern);
    }
    return list
  };

  // replace stuff like \* with *
  function globUnescape (s) {
    return s.replace(/\\(.)/g, '$1')
  }

  function regExpEscape (s) {
    return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }
  return minimatch_1;
}

const inherits = {exports: {}};

const inherits_browser = {exports: {}};

let hasRequiredInherits_browser;

// ==> Inherits_browser () {
function requireInherits_browser () {
	if (hasRequiredInherits_browser) return inherits_browser.exports;
	hasRequiredInherits_browser = 1;
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      const TempCtor = () => {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	return inherits_browser.exports;
}

let hasRequiredInherits;

// ==> Inherits () {
function requireInherits () {
	if (hasRequiredInherits) return inherits.exports;
	hasRequiredInherits = 1;
	try {
	  const util = require('util');
	  /* istanbul ignore next */
	  if (typeof util.inherits !== 'function') throw '';
	  inherits.exports = util.inherits;
	} catch (e) {
	  /* istanbul ignore next */
	  inherits.exports = requireInherits_browser();
	}
	return inherits.exports;
}

const pathIsAbsolute = {exports: {}};

let hasRequiredPathIsAbsolute;

// ==> PathIsAbsolute () {
function requirePathIsAbsolute () {
	if (hasRequiredPathIsAbsolute) return pathIsAbsolute.exports;
	hasRequiredPathIsAbsolute = 1;

	function posix(path) {
		return path.charAt(0) === '/';
	}

	function win32(path) {
		// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
		const splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
		const result = splitDeviceRe.exec(path);
		const device = result[1] || '';
		const isUnc = Boolean(device && device.charAt(1) !== ':');

		// UNC paths are always absolute
		return Boolean(result[2] || isUnc);
	}

	pathIsAbsolute.exports = process.platform === 'win32' ? win32 : posix;
	pathIsAbsolute.exports.posix = posix;
	pathIsAbsolute.exports.win32 = win32;
	return pathIsAbsolute.exports;
}

const common$1 = {};

let hasRequiredCommon$1;

// ==> Common$1 () {
function requireCommon$1 () {
	if (hasRequiredCommon$1) return common$1;
	hasRequiredCommon$1 = 1;
	common$1.setopts = setopts;
	common$1.ownProp = ownProp;
	common$1.makeAbs = makeAbs;
	common$1.finish = finish;
	common$1.mark = mark;
	common$1.isIgnored = isIgnored;
	common$1.childrenIgnored = childrenIgnored;

	function ownProp (obj, field) {
	  return Object.prototype.hasOwnProperty.call(obj, field)
	}

	const fs = require$$1;
	const path = require$$2;
	const minimatch = requireMinimatch();
	const isAbsolute = requirePathIsAbsolute();
	const Minimatch = minimatch.Minimatch;

	function alphasort (a, b) {
	  return a.localeCompare(b, 'en')
	}

	function setupIgnores(self, {ignore}) {
	  self.ignore = ignore || [];

	  if (!Array.isArray(self.ignore))
	    self.ignore = [self.ignore];

	  if (self.ignore.length) {
	    self.ignore = self.ignore.map(ignoreMap);
	  }
	}

	// ignore patterns are always in dot:true mode.
	function ignoreMap (pattern) {
	  let gmatcher = null;
	  if (pattern.slice(-3) === '/**') {
	    const gpattern = pattern.replace(/(\/\*\*)+$/, '');
	    gmatcher = new Minimatch(gpattern, { dot: true });
	  }

	  return {
	    matcher: new Minimatch(pattern, { dot: true }),
	    gmatcher
	  };
	}

	function setopts (self, pattern, options) {
	  if (!options)
	    options = {};

	  // base-matching: just use globstar for that.
	  if (options.matchBase && !pattern.includes("/")) {
	    if (options.noglobstar) {
	      throw new Error("base matching requires globstar")
	    }
	    pattern = `**/${pattern}`;
	  }

	  self.silent = !!options.silent;
	  self.pattern = pattern;
	  self.strict = options.strict !== false;
	  self.realpath = !!options.realpath;
	  self.realpathCache = options.realpathCache || Object.create(null);
	  self.follow = !!options.follow;
	  self.dot = !!options.dot;
	  self.mark = !!options.mark;
	  self.nodir = !!options.nodir;
	  if (self.nodir)
	    self.mark = true;
	  self.sync = !!options.sync;
	  self.nounique = !!options.nounique;
	  self.nonull = !!options.nonull;
	  self.nosort = !!options.nosort;
	  self.nocase = !!options.nocase;
	  self.stat = !!options.stat;
	  self.noprocess = !!options.noprocess;
	  self.absolute = !!options.absolute;
	  self.fs = options.fs || fs;

	  self.maxLength = options.maxLength || Infinity;
	  self.cache = options.cache || Object.create(null);
	  self.statCache = options.statCache || Object.create(null);
	  self.symlinks = options.symlinks || Object.create(null);

	  setupIgnores(self, options);

	  self.changedCwd = false;
	  const cwd = process.cwd();
	  if (!ownProp(options, "cwd"))
	    self.cwd = cwd;
	  else {
	    self.cwd = path.resolve(options.cwd);
	    self.changedCwd = self.cwd !== cwd;
	  }

	  self.root = options.root || path.resolve(self.cwd, "/");
	  self.root = path.resolve(self.root);
	  if (process.platform === "win32")
	    self.root = self.root.replace(/\\/g, "/");

	  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
	  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
	  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
	  if (process.platform === "win32")
	    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
	  self.nomount = !!options.nomount;

	  // disable comments and negation in Minimatch.
	  // Note that they are not supported in Glob itself anyway.
	  options.nonegate = true;
	  options.nocomment = true;
	  // always treat \ in patterns as escapes, not path separators
	  options.allowWindowsEscape = false;

	  self.minimatch = new Minimatch(pattern, options);
	  self.options = self.minimatch.options;
	}

	function finish (self) {
	  const nou = self.nounique;
	  let all = nou ? [] : Object.create(null);

	  for (var i = 0, l = self.matches.length; i < l; i ++) {
	    const matches = self.matches[i];
	    if (!matches || Object.keys(matches).length === 0) {
	      if (self.nonull) {
	        // do like the shell, and spit out the literal glob
	        const literal = self.minimatch.globSet[i];
	        if (nou)
	          all.push(literal);
	        else
	          all[literal] = true;
	      }
	    } else {
	      // had matches
	      const m = Object.keys(matches);
	      if (nou)
	        all.push(...m);
	      else
	        m.forEach(m => {
	          all[m] = true;
	        });
	    }
	  }

	  if (!nou)
	    all = Object.keys(all);

	  if (!self.nosort)
	    all = all.sort(alphasort);

	  // at *some* point we statted all of these
	  if (self.mark) {
	    for (var i = 0; i < all.length; i++) {
	      all[i] = self._mark(all[i]);
	    }
	    if (self.nodir) {
	      all = all.filter(e => {
	        let notDir = !(/\/$/.test(e));
	        const c = self.cache[e] || self.cache[makeAbs(self, e)];
	        if (notDir && c)
	          notDir = c !== 'DIR' && !Array.isArray(c);
	        return notDir
	      });
	    }
	  }

	  if (self.ignore.length)
	    all = all.filter(m => {
	      return !isIgnored(self, m)
	    });

	  self.found = all;
	}

	function mark (self, p) {
	  const abs = makeAbs(self, p);
	  const c = self.cache[abs];
	  let m = p;
	  if (c) {
	    const isDir = c === 'DIR' || Array.isArray(c);
	    const slash = p.slice(-1) === '/';

	    if (isDir && !slash)
	      m += '/';
	    else if (!isDir && slash)
	      m = m.slice(0, -1);

	    if (m !== p) {
	      const mabs = makeAbs(self, m);
	      self.statCache[mabs] = self.statCache[abs];
	      self.cache[mabs] = self.cache[abs];
	    }
	  }

	  return m
	}

	// lotta situps...
	function makeAbs({root, changedCwd, cwd}, f) {
	  let abs = f;
	  if (f.charAt(0) === '/') {
	    abs = path.join(root, f);
	  } else if (isAbsolute(f) || f === '') {
	    abs = f;
	  } else if (changedCwd) {
	    abs = path.resolve(cwd, f);
	  } else {
	    abs = path.resolve(f);
	  }

	  if (process.platform === 'win32')
	    abs = abs.replace(/\\/g, '/');

	  return abs
	}


	// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
	// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
	function isIgnored({ignore}, path) {
	  if (!ignore.length)
	    return false

	  return ignore.some(({matcher, gmatcher}) => {
	    return matcher.match(path) || !!(gmatcher && gmatcher.match(path));
	  });
	}

	function childrenIgnored({ignore}, path) {
	  if (!ignore.length)
	    return false

	  return ignore.some(({gmatcher}) => {
	    return !!(gmatcher && gmatcher.match(path));
	  });
	}
	return common$1;
}

let sync;
let hasRequiredSync;

// ==> Sync () {
function requireSync () {
  if (hasRequiredSync) return sync;
  hasRequiredSync = 1;
  sync = globSync;
  globSync.GlobSync = GlobSync;

  const rp = requireFs_realpath();
  const minimatch = requireMinimatch();
  minimatch.Minimatch;
  requireGlob().Glob;
  const path = require$$2;
  const assert = require$$5$1;
  const isAbsolute = requirePathIsAbsolute();
  const common = requireCommon$1();
  const setopts = common.setopts;
  const ownProp = common.ownProp;
  const childrenIgnored = common.childrenIgnored;
  const isIgnored = common.isIgnored;

  function globSync (pattern, options) {
    if (typeof options === 'function' || arguments.length === 3)
      throw new TypeError('callback provided to sync glob\n'+
                          'See: https://github.com/isaacs/node-glob/issues/167')

    return new GlobSync(pattern, options).found
  }

  class GlobSync {
    constructor(pattern, options) {
	  if (!pattern)
	    throw new Error('must provide pattern')

	  if (typeof options === 'function' || arguments.length === 3)
	    throw new TypeError('callback provided to sync glob\n'+
	                        'See: https://github.com/isaacs/node-glob/issues/167')

	  if (!(this instanceof GlobSync))
	    return new GlobSync(pattern, options)

	  setopts(this, pattern, options);

	  if (this.noprocess)
	    return this

	  const n = this.minimatch.set.length;
	  this.matches = new Array(n);
	  for (let i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false);
	  }
	  this._finish();
	}

    _finish() {
	  assert.ok(this instanceof GlobSync);
	  if (this.realpath) {
	    const self = this;
	    this.matches.forEach((matchset, index) => {
	      const set = self.matches[index] = Object.create(null);
	      for (let p in matchset) {
	        try {
	          p = self._makeAbs(p);
	          const real = rp.realpathSync(p, self.realpathCache);
	          set[real] = true;
	        } catch (er) {
	          if (er.syscall === 'stat')
	            set[self._makeAbs(p)] = true;
	          else
	            throw er
	        }
	      }
	    });
	  }
	  common.finish(this);
	}

    _process(pattern, index, inGlobStar) {
	  assert.ok(this instanceof GlobSync);

	  // Get the first [n] parts of pattern that are all strings.
	  let n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // See if there's anything else
	  let prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  const remain = pattern.slice(n);

	  // get the list of entries.
	  let read;
	  if (prefix === null)
	    read = '.';
	  else if (isAbsolute(prefix) ||
	      isAbsolute(pattern.map(p => {
	        return typeof p === 'string' ? p : '[*]'
	      }).join('/'))) {
	    if (!prefix || !isAbsolute(prefix))
	      prefix = `/${prefix}`;
	    read = prefix;
	  } else
	    read = prefix;

	  const abs = this._makeAbs(read);

	  //if ignored, skip processing
	  if (childrenIgnored(this, read))
	    return

	  const isGlobStar = remain[0] === minimatch.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
	}

    _processReaddir(prefix, read, abs, remain, index, inGlobStar) {
	  const entries = this._readdir(abs, inGlobStar);

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  const pn = remain[0];
	  const negate = !!this.minimatch.negate;
	  const rawGlob = pn._glob;
	  const dotOk = this.dot || rawGlob.charAt(0) === '.';

	  const matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      let m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  const len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix.slice(-1) !== '/')
	          e = `${prefix}/${e}`;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = path.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    let newPattern;
	    if (prefix)
	      newPattern = [prefix, e];
	    else
	      newPattern = [e];
	    this._process(newPattern.concat(remain), index, inGlobStar);
	  }
	}

    _emitMatch(index, e) {
	  if (isIgnored(this, e))
	    return

	  const abs = this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute) {
	    e = abs;
	  }

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    const c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  if (this.stat)
	    this._stat(e);
	}

    _readdirInGlobStar(abs) {
	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false)

	  let entries;
	  let lstat;
	  try {
	    lstat = this.fs.lstatSync(abs);
	  } catch (er) {
	    if (er.code === 'ENOENT') {
	      // lstat failed, doesn't exist
	      return null
	    }
	  }

	  const isSym = lstat && lstat.isSymbolicLink();
	  this.symlinks[abs] = isSym;

	  // If it's not a symlink or a dir, then it's definitely a regular file.
	  // don't bother doing a readdir in that case.
	  if (!isSym && lstat && !lstat.isDirectory())
	    this.cache[abs] = 'FILE';
	  else
	    entries = this._readdir(abs, false);

	  return entries
	}

    _readdir(abs, inGlobStar) {

	  if (inGlobStar && !ownProp(this.symlinks, abs))
	    return this._readdirInGlobStar(abs)

	  if (ownProp(this.cache, abs)) {
	    const c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return null

	    if (Array.isArray(c))
	      return c
	  }

	  try {
	    return this._readdirEntries(abs, this.fs.readdirSync(abs))
	  } catch (er) {
	    this._readdirError(abs, er);
	    return null
	  }
	}

    _readdirEntries(abs, entries) {
	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (let i = 0; i < entries.length; i ++) {
	      let e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = `${abs}/${e}`;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;

	  // mark and cache dir-ness
	  return entries
	}

    _readdirError(f, er) {
	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      const abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        const error = new Error(`${er.code} invalid cwd ${this.cwd}`);
	        error.path = this.cwd;
	        error.code = er.code;
	        throw error
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict)
	        throw er
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }
	}

    _processGlobStar(prefix, read, abs, remain, index, inGlobStar) {

	  const entries = this._readdir(abs, inGlobStar);

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  const remainWithoutGlobStar = remain.slice(1);
	  const gspref = prefix ? [ prefix ] : [];
	  const noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false);

	  const len = entries.length;
	  const isSym = this.symlinks[abs];

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return

	  for (let i = 0; i < len; i++) {
	    const e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    const instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true);

	    const below = gspref.concat(entries[i], remain);
	    this._process(below, index, true);
	  }
	}

    _processSimple(prefix, index) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  const exists = this._stat(prefix);

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return

	  if (prefix && isAbsolute(prefix) && !this.nomount) {
	    const trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = path.join(this.root, prefix);
	    } else {
	      prefix = path.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	}

    // Returns either 'DIR', 'FILE', or false
    _stat(f) {
	  const abs = this._makeAbs(f);
	  const needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return false

	  if (!this.stat && ownProp(this.cache, abs)) {
	    var c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return c

	    if (needDir && c === 'FILE')
	      return false

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  let stat = this.statCache[abs];
	  if (!stat) {
	    let lstat;
	    try {
	      lstat = this.fs.lstatSync(abs);
	    } catch (er) {
	      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	        this.statCache[abs] = false;
	        return false
	      }
	    }

	    if (lstat && lstat.isSymbolicLink()) {
	      try {
	        stat = this.fs.statSync(abs);
	      } catch (er) {
	        stat = lstat;
	      }
	    } else {
	      stat = lstat;
	    }
	  }

	  this.statCache[abs] = stat;

	  var c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';

	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return false

	  return c
	}

    _mark(p) {
	  return common.mark(this, p)
	}

    _makeAbs(f) {
	  return common.makeAbs(this, f)
	}
  }

  return sync;
}

let wrappy_1;
let hasRequiredWrappy;

// ==> Wrappy () {
function requireWrappy () {
	if (hasRequiredWrappy) return wrappy_1;
	hasRequiredWrappy = 1;
	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	wrappy_1 = wrappy;
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)

	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')

	  Object.keys(fn).forEach(k => {
	    wrapper[k] = fn[k];
	  });

	  return wrapper

	  function wrapper() {
	    const args = new Array(arguments.length);
	    for (let i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    const ret = fn.apply(this, args);
	    const cb = args[args.length-1];
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(k => {
	        ret[k] = cb[k];
	      });
	    }
	    return ret
	  }
	}
	return wrappy_1;
}

const once = {exports: {}};

let hasRequiredOnce;

// ==> Once () {
function requireOnce () {
	if (hasRequiredOnce) return once.exports;
	hasRequiredOnce = 1;
	const wrappy = requireWrappy();
	once.exports = wrappy(once$1);
	once.exports.strict = wrappy(onceStrict);

	once$1.proto = once$1(() => {
	  Object.defineProperty(Function.prototype, 'once', {
	    value() {
	      return once$1(this)
	    },
	    configurable: true
	  });

	  Object.defineProperty(Function.prototype, 'onceStrict', {
	    value() {
	      return onceStrict(this)
	    },
	    configurable: true
	  });
	});

	function once$1 (fn) {
	  const f = function(...args) {
	    if (f.called) return f.value
	    f.called = true;
	    return f.value = fn.apply(this, args);
	  };
	  f.called = false;
	  return f
	}

	function onceStrict (fn) {
	  const f = function(...args) {
	    if (f.called)
	      throw new Error(f.onceError)
	    f.called = true;
	    return f.value = fn.apply(this, args);
	  };
	  const name = fn.name || 'Function wrapped with `once`';
	  f.onceError = `${name} shouldn't be called more than once`;
	  f.called = false;
	  return f
	}
	return once.exports;
}

let inflight_1;
let hasRequiredInflight;

// ==> Inflight () {
function requireInflight () {
	if (hasRequiredInflight) return inflight_1;
	hasRequiredInflight = 1;
	const wrappy = requireWrappy();
	const reqs = Object.create(null);
	const once = requireOnce();

	inflight_1 = wrappy(inflight);

	function inflight (key, cb) {
	  if (reqs[key]) {
	    reqs[key].push(cb);
	    return null
	  } else {
	    reqs[key] = [cb];
	    return makeres(key)
	  }
	}

	function makeres (key) {
	  return once(function RES () {
	    const cbs = reqs[key];
	    const len = cbs.length;
	    const args = slice(arguments);

	    // XXX It's somewhat ambiguous whether a new callback added in this
	    // pass should be queued for later execution if something in the
	    // list of callbacks throws, or if it should just be discarded.
	    // However, it's such an edge case that it hardly matters, and either
	    // choice is likely as surprising as the other.
	    // As it happens, we do go ahead and schedule it for later execution.
	    try {
	      for (let i = 0; i < len; i++) {
	        cbs[i].apply(null, args);
	      }
	    } finally {
	      if (cbs.length > len) {
	        // added more in the interim.
	        // de-zalgo, just in case, but don't call again.
	        cbs.splice(0, len);
	        process.nextTick(() => {
	          RES(...args);
	        });
	      } else {
	        delete reqs[key];
	      }
	    }
	  });
	}

	function slice (args) {
	  const length = args.length;
	  const array = [];

	  for (let i = 0; i < length; i++) array[i] = args[i];
	  return array
	}
	return inflight_1;
}

let glob_1;
let hasRequiredGlob;

// ==> Glob () {
function requireGlob () {
  if (hasRequiredGlob) return glob_1;
  hasRequiredGlob = 1;
  // Approach:
  //
  // 1. Get the minimatch set
  // 2. For each pattern in the set, PROCESS(pattern, false)
  // 3. Store matches per-set, then uniq them
  //
  // PROCESS(pattern, inGlobStar)
  // Get the first [n] items from pattern that are all strings
  // Join these together.  This is PREFIX.
  //   If there is no more remaining, then stat(PREFIX) and
  //   add to matches if it succeeds.  END.
  //
  // If inGlobStar and PREFIX is symlink and points to dir
  //   set ENTRIES = []
  // else readdir(PREFIX) as ENTRIES
  //   If fail, END
  //
  // with ENTRIES
  //   If pattern[n] is GLOBSTAR
  //     // handle the case where the globstar match is empty
  //     // by pruning it out, and testing the resulting pattern
  //     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
  //     // handle other cases.
  //     for ENTRY in ENTRIES (not dotfiles)
  //       // attach globstar + tail onto the entry
  //       // Mark that this entry is a globstar match
  //       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
  //
  //   else // not globstar
  //     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
  //       Test ENTRY against pattern[n]
  //       If fails, continue
  //       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
  //
  // Caveat:
  //   Cache all stats and readdirs results to minimize syscall.  Since all
  //   we ever care about is existence and directory-ness, we can just keep
  //   `true` for files, and [children,...] for directories, or `false` for
  //   things that don't exist.

  glob_1 = glob;

  const rp = requireFs_realpath();
  const minimatch = requireMinimatch();
  minimatch.Minimatch;
  const inherits = requireInherits();
  const EE = require$$3.EventEmitter;
  const path = require$$2;
  const assert = require$$5$1;
  const isAbsolute = requirePathIsAbsolute();
  const globSync = requireSync();
  const common = requireCommon$1();
  const setopts = common.setopts;
  const ownProp = common.ownProp;
  const inflight = requireInflight();
  const childrenIgnored = common.childrenIgnored;
  const isIgnored = common.isIgnored;

  const once = requireOnce();

  function glob (pattern, options, cb) {
    if (typeof options === 'function') cb = options, options = {};
    if (!options) options = {};

    if (options.sync) {
      if (cb)
        throw new TypeError('callback provided to sync glob')
      return globSync(pattern, options)
    }

    return new Glob(pattern, options, cb)
  }

  glob.sync = globSync;
  const GlobSync = glob.GlobSync = globSync.GlobSync;

  // old api surface
  glob.glob = glob;

  function extend (origin, add) {
    if (add === null || typeof add !== 'object') {
      return origin
    }

    const keys = Object.keys(add);
    let i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin
  }

  glob.hasMagic = (pattern, options_) => {
    const options = extend({}, options_);
    options.noprocess = true;

    const g = new Glob(pattern, options);
    const set = g.minimatch.set;

    if (!pattern)
      return false

    if (set.length > 1)
      return true

    for (let j = 0; j < set[0].length; j++) {
      if (typeof set[0][j] !== 'string')
        return true
    }

    return false
  };

  glob.Glob = Glob;
  inherits(Glob, EE);

  class Glob {
    constructor(pattern, options, cb) {
	  if (typeof options === 'function') {
	    cb = options;
	    options = null;
	  }

	  if (options && options.sync) {
	    if (cb)
	      throw new TypeError('callback provided to sync glob')
	    return new GlobSync(pattern, options)
	  }

	  if (!(this instanceof Glob))
	    return new Glob(pattern, options, cb)

	  setopts(this, pattern, options);
	  this._didRealPath = false;

	  // process each pattern in the minimatch set
	  const n = this.minimatch.set.length;

	  // The matches are stored as {<filename>: true,...} so that
	  // duplicates are automagically pruned.
	  // Later, we do an Object.keys() on these.
	  // Keep them as a list so we can fill in when nonull is set.
	  this.matches = new Array(n);

	  if (typeof cb === 'function') {
	    cb = once(cb);
	    this.on('error', cb);
	    this.on('end', matches => {
	      cb(null, matches);
	    });
	  }

	  const self = this;
	  this._processing = 0;

	  this._emitQueue = [];
	  this._processQueue = [];
	  this.paused = false;

	  if (this.noprocess)
	    return this

	  if (n === 0)
	    return done()

	  let sync = true;
	  for (let i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false, done);
	  }
	  sync = false;

	  function done () {
	    --self._processing;
	    if (self._processing <= 0) {
	      if (sync) {
	        process.nextTick(() => {
	          self._finish();
	        });
	      } else {
	        self._finish();
	      }
	    }
	  }
	}

    _finish() {
	  assert(this instanceof Glob);
	  if (this.aborted)
	    return

	  if (this.realpath && !this._didRealpath)
	    return this._realpath()

	  common.finish(this);
	  this.emit('end', this.found);
	}

    _realpath() {
	  if (this._didRealpath)
	    return

	  this._didRealpath = true;

	  let n = this.matches.length;
	  if (n === 0)
	    return this._finish()

	  const self = this;
	  for (let i = 0; i < this.matches.length; i++)
	    this._realpathSet(i, next);

	  function next () {
	    if (--n === 0)
	      self._finish();
	  }
	}

    _realpathSet(index, cb) {
	  const matchset = this.matches[index];
	  if (!matchset)
	    return cb()

	  const found = Object.keys(matchset);
	  const self = this;
	  let n = found.length;

	  if (n === 0)
	    return cb()

	  const set = this.matches[index] = Object.create(null);
	  found.forEach((p, i) => {
	    // If there's a problem with the stat, then it means that
	    // one or more of the links in the realpath couldn't be
	    // resolved.  just return the abs value in that case.
	    p = self._makeAbs(p);
	    rp.realpath(p, self.realpathCache, (er, real) => {
	      if (!er)
	        set[real] = true;
	      else if (er.syscall === 'stat')
	        set[p] = true;
	      else
	        self.emit('error', er); // srsly wtf right here

	      if (--n === 0) {
	        self.matches[index] = set;
	        cb();
	      }
	    });
	  });
	}

    _mark(p) {
	  return common.mark(this, p)
	}

    _makeAbs(f) {
	  return common.makeAbs(this, f)
	}

    abort() {
	  this.aborted = true;
	  this.emit('abort');
	}

    pause() {
	  if (!this.paused) {
	    this.paused = true;
	    this.emit('pause');
	  }
	}

    resume() {
	  if (this.paused) {
	    this.emit('resume');
	    this.paused = false;
	    if (this._emitQueue.length) {
	      const eq = this._emitQueue.slice(0);
	      this._emitQueue.length = 0;
	      for (var i = 0; i < eq.length; i ++) {
	        const e = eq[i];
	        this._emitMatch(e[0], e[1]);
	      }
	    }
	    if (this._processQueue.length) {
	      const pq = this._processQueue.slice(0);
	      this._processQueue.length = 0;
	      for (var i = 0; i < pq.length; i ++) {
	        const p = pq[i];
	        this._processing--;
	        this._process(p[0], p[1], p[2], p[3]);
	      }
	    }
	  }
	}

    _process(pattern, index, inGlobStar, cb) {
	  assert(this instanceof Glob);
	  assert(typeof cb === 'function');

	  if (this.aborted)
	    return

	  this._processing++;
	  if (this.paused) {
	    this._processQueue.push([pattern, index, inGlobStar, cb]);
	    return
	  }

	  //console.error('PROCESS %d', this._processing, pattern)

	  // Get the first [n] parts of pattern that are all strings.
	  let n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // see if there's anything else
	  let prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index, cb);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  const remain = pattern.slice(n);

	  // get the list of entries.
	  let read;
	  if (prefix === null)
	    read = '.';
	  else if (isAbsolute(prefix) ||
	      isAbsolute(pattern.map(p => {
	        return typeof p === 'string' ? p : '[*]'
	      }).join('/'))) {
	    if (!prefix || !isAbsolute(prefix))
	      prefix = `/${prefix}`;
	    read = prefix;
	  } else
	    read = prefix;

	  const abs = this._makeAbs(read);

	  //if ignored, skip _processing
	  if (childrenIgnored(this, read))
	    return cb()

	  const isGlobStar = remain[0] === minimatch.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
	}

    _processReaddir(prefix, read, abs, remain, index, inGlobStar, cb) {
	  const self = this;
	  this._readdir(abs, inGlobStar, (er, entries) => {
	    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
	  });
	}

    _processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return cb()

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  const pn = remain[0];
	  const negate = !!this.minimatch.negate;
	  const rawGlob = pn._glob;
	  const dotOk = this.dot || rawGlob.charAt(0) === '.';

	  const matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      let m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

	  const len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return cb()

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix !== '/')
	          e = `${prefix}/${e}`;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = path.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return cb()
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    if (prefix) {
	      if (prefix !== '/')
	        e = `${prefix}/${e}`;
	      else
	        e = prefix + e;
	    }
	    this._process([e].concat(remain), index, inGlobStar, cb);
	  }
	  cb();
	}

    _emitMatch(index, e) {
	  if (this.aborted)
	    return

	  if (isIgnored(this, e))
	    return

	  if (this.paused) {
	    this._emitQueue.push([index, e]);
	    return
	  }

	  const abs = isAbsolute(e) ? e : this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute)
	    e = abs;

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    const c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  const st = this.statCache[abs];
	  if (st)
	    this.emit('stat', e, st);

	  this.emit('match', e);
	}

    _readdirInGlobStar(abs, cb) {
	  if (this.aborted)
	    return

	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false, cb)

	  const lstatkey = `lstat\0${abs}`;
	  const self = this;
	  const lstatcb = inflight(lstatkey, lstatcb_);

	  if (lstatcb)
	    self.fs.lstat(abs, lstatcb);

	  function lstatcb_ (er, lstat) {
	    if (er && er.code === 'ENOENT')
	      return cb()

	    const isSym = lstat && lstat.isSymbolicLink();
	    self.symlinks[abs] = isSym;

	    // If it's not a symlink or a dir, then it's definitely a regular file.
	    // don't bother doing a readdir in that case.
	    if (!isSym && lstat && !lstat.isDirectory()) {
	      self.cache[abs] = 'FILE';
	      cb();
	    } else
	      self._readdir(abs, false, cb);
	  }
	}

    _readdir(abs, inGlobStar, cb) {
	  if (this.aborted)
	    return

	  cb = inflight(`readdir\0${abs}\0${inGlobStar}`, cb);
	  if (!cb)
	    return

	  //console.error('RD %j %j', +inGlobStar, abs)
	  if (inGlobStar && !ownProp(this.symlinks, abs))
	    return this._readdirInGlobStar(abs, cb)

	  if (ownProp(this.cache, abs)) {
	    const c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return cb()

	    if (Array.isArray(c))
	      return cb(null, c)
	  }

	  const self = this;
	  self.fs.readdir(abs, readdirCb(this, abs, cb));
	}

    _readdirEntries(abs, entries, cb) {
	  if (this.aborted)
	    return

	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (let i = 0; i < entries.length; i ++) {
	      let e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = `${abs}/${e}`;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;
	  return cb(null, entries)
	}

    _readdirError(f, er, cb) {
	  if (this.aborted)
	    return

	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      const abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        const error = new Error(`${er.code} invalid cwd ${this.cwd}`);
	        error.path = this.cwd;
	        error.code = er.code;
	        this.emit('error', error);
	        this.abort();
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict) {
	        this.emit('error', er);
	        // If the error is handled, then we abort
	        // if not, we threw out of here
	        this.abort();
	      }
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }

	  return cb()
	}

    _processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb) {
	  const self = this;
	  this._readdir(abs, inGlobStar, (er, entries) => {
	    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
	  });
	}

    _processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
	  //console.error('pgs2', prefix, remain[0], entries)

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return cb()

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  const remainWithoutGlobStar = remain.slice(1);
	  const gspref = prefix ? [ prefix ] : [];
	  const noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false, cb);

	  const isSym = this.symlinks[abs];
	  const len = entries.length;

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return cb()

	  for (let i = 0; i < len; i++) {
	    const e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    const instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true, cb);

	    const below = gspref.concat(entries[i], remain);
	    this._process(below, index, true, cb);
	  }

	  cb();
	}

    _processSimple(prefix, index, cb) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  const self = this;
	  this._stat(prefix, (er, exists) => {
	    self._processSimple2(prefix, index, er, exists, cb);
	  });
	}

    _processSimple2(prefix, index, er, exists, cb) {

	  //console.error('ps2', prefix, exists)

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return cb()

	  if (prefix && isAbsolute(prefix) && !this.nomount) {
	    const trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = path.join(this.root, prefix);
	    } else {
	      prefix = path.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	  cb();
	}

    // Returns either 'DIR', 'FILE', or false
    _stat(f, cb) {
	  const abs = this._makeAbs(f);
	  const needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return cb()

	  if (!this.stat && ownProp(this.cache, abs)) {
	    let c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return cb(null, c)

	    if (needDir && c === 'FILE')
	      return cb()

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  const stat = this.statCache[abs];
	  if (stat !== undefined) {
	    if (stat === false)
	      return cb(null, stat)
	    else {
	      const type = stat.isDirectory() ? 'DIR' : 'FILE';
	      if (needDir && type === 'FILE')
	        return cb()
	      else
	        return cb(null, type, stat)
	    }
	  }

	  const self = this;
	  const statcb = inflight(`stat\0${abs}`, lstatcb_);
	  if (statcb)
	    self.fs.lstat(abs, statcb);

	  function lstatcb_ (er, lstat) {
	    if (lstat && lstat.isSymbolicLink()) {
	      // If it's a symlink, then treat it as the target, unless
	      // the target does not exist, then treat it as a file.
	      return self.fs.stat(abs, (er, stat) => {
	        if (er)
	          self._stat2(f, abs, null, lstat, cb);
	        else
	          self._stat2(f, abs, er, stat, cb);
	      });
	    } else {
	      self._stat2(f, abs, er, lstat, cb);
	    }
	  }
	}

    _stat2(f, abs, er, stat, cb) {
	  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	    this.statCache[abs] = false;
	    return cb()
	  }

	  const needDir = f.slice(-1) === '/';
	  this.statCache[abs] = stat;

	  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
	    return cb(null, false, stat)

	  let c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';
	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return cb()

	  return cb(null, c, stat)
	}
  }

  function readdirCb (self, abs, cb) {
    return (er, entries) => {
      if (er)
        self._readdirError(abs, er, cb);
      else
        self._readdirEntries(abs, entries, cb);
    };
  }

  return glob_1;
}

let ls;
let hasRequiredLs;

// ==> Ls () {
function requireLs () {
	if (hasRequiredLs) return ls;
	hasRequiredLs = 1;
	const path = require$$2;
	const fs = require$$1;
	const common = requireCommon();
	const glob = requireGlob();

	// glob patterns use the UNIX path seperator
	const globPatternRecursive = '/**';

	common.register('ls', _ls, {
	  cmdOptions: {
	    'R': 'recursive',
	    'A': 'all',
	    'L': 'link',
	    'a': 'all_deprecated',
	    'd': 'directory',
	    'l': 'long',
	  },
	});

	//@
	//@ ### ls([options,] [path, ...])
	//@ ### ls([options,] path_array)
	//@
	//@ Available options:
	//@
	//@ + `-R`: recursive
	//@ + `-A`: all files (include files beginning with `.`, except for `.` and `..`)
	//@ + `-L`: follow symlinks
	//@ + `-d`: list directories themselves, not their contents
	//@ + `-l`: provides more details for each file. Specifically, each file is
	//@         represented by a structured object with separate fields for file
	//@         metadata (see
	//@         [`fs.Stats`](https://nodejs.org/api/fs.html#fs_class_fs_stats)). The
	//@         return value also overrides `.toString()` to resemble `ls -l`'s
	//@         output format for human readability, but programmatic usage should
	//@         depend on the stable object format rather than the `.toString()`
	//@         representation.
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ ls('projs/*.js');
	//@ ls('projs/**/*.js'); // Find all js files recursively in projs
	//@ ls('-R', '/users/me', '/tmp');
	//@ ls('-R', ['/users/me', '/tmp']); // same as above
	//@ ls('-l', 'file.txt'); // { name: 'file.txt', mode: 33188, nlink: 1, ...}
	//@ ```
	//@
	//@ Returns a [ShellString](#shellstringstr) (with array-like properties) of all
	//@ the files in the given `path`, or files in the current directory if no
	//@ `path` is  provided.
	function _ls(options, paths) {
	  if (options.all_deprecated) {
	    // We won't support the -a option as it's hard to image why it's useful
	    // (it includes '.' and '..' in addition to '.*' files)
	    // For backwards compatibility we'll dump a deprecated message and proceed as before
	    common.log('ls: Option -a is deprecated. Use -A instead');
	    options.all = true;
	  }

	  if (!paths) {
	    paths = ['.'];
	  } else {
	    paths = [].slice.call(arguments, 1);
	  }

	  const list = [];

	  function pushFile(abs, relName, stat) {
	    if (process.platform === 'win32') {
	      relName = relName.replace(/\\/g, '/');
	    }
	    if (options.long) {
	      stat = stat || (options.link ? common.statFollowLinks(abs) : common.statNoFollowLinks(abs));
	      list.push(addLsAttributes(relName, stat));
	    } else {
	      // list.push(path.relative(rel || '.', file));
	      list.push(relName);
	    }
	  }

	  paths.forEach(p => {
	    let stat;

	    try {
	      stat = options.link ? common.statFollowLinks(p) : common.statNoFollowLinks(p);
	      // follow links to directories by default
	      if (stat.isSymbolicLink()) {
	        /* istanbul ignore next */
	        // workaround for https://github.com/shelljs/shelljs/issues/795
	        // codecov seems to have a bug that miscalculate this block as uncovered.
	        // but according to nyc report this block does get covered.
	        try {
	          const _stat = common.statFollowLinks(p);
	          if (_stat.isDirectory()) {
	            stat = _stat;
	          }
	        } catch (_) {} // bad symlink, treat it like a file
	      }
	    } catch (e) {
	      common.error(`no such file or directory: ${p}`, 2, { continue: true });
	      return;
	    }

	    // If the stat succeeded
	    if (stat.isDirectory() && !options.directory) {
	      if (options.recursive) {
	        // use glob, because it's simple
	        glob.sync(p + globPatternRecursive, { dot: options.all, follow: options.link })
	          .forEach(item => {
	            // Glob pattern returns the directory itself and needs to be filtered out.
	            if (path.relative(p, item)) {
	              pushFile(item, path.relative(p, item));
	            }
	          });
	      } else if (options.all) {
	        // use fs.readdirSync, because it's fast
	        fs.readdirSync(p).forEach(item => {
	          pushFile(path.join(p, item), item);
	        });
	      } else {
	        // use fs.readdirSync and then filter out secret files
	        fs.readdirSync(p).forEach(item => {
	          if (item[0] !== '.') {
	            pushFile(path.join(p, item), item);
	          }
	        });
	      }
	    } else {
	      pushFile(p, p, stat);
	    }
	  });

	  // Add methods, to make this more compatible with ShellStrings
	  return list;
	}

	function addLsAttributes(pathName, stats) {
	  // Note: this object will contain more information than .toString() returns
	  stats.name = pathName;
	  stats.toString = function () {
	    // Return a string resembling unix's `ls -l` format
	    return [this.mode, this.nlink, this.uid, this.gid, this.size, this.mtime, this.name].join(' ');
	  };
	  return stats;
	}

	ls = _ls;
	return ls;
}

let find;
let hasRequiredFind;

// ==> Find () {
function requireFind () {
	if (hasRequiredFind) return find;
	hasRequiredFind = 1;
	const path = require$$2;
	const common = requireCommon();
	const _ls = requireLs();

	common.register('find', _find, {
	  cmdOptions: {
	    'L': 'link',
	  },
	});

	//@
	//@ ### find(path [, path ...])
	//@ ### find(path_array)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ find('src', 'lib');
	//@ find(['src', 'lib']); // same as above
	//@ find('.').filter(function(file) { return file.match(/\.js$/); });
	//@ ```
	//@
	//@ Returns a [ShellString](#shellstringstr) (with array-like properties) of all
	//@ files (however deep) in the given paths.
	//@
	//@ The main difference from `ls('-R', path)` is that the resulting file names
	//@ include the base directories (e.g., `lib/resources/file1` instead of just `file1`).
	function _find({link}, paths) {
	  if (!paths) {
	    common.error('no path specified');
	  } else if (typeof paths === 'string') {
	    paths = [].slice.call(arguments, 1);
	  }

	  const list = [];

	  function pushFile(file) {
	    if (process.platform === 'win32') {
	      file = file.replace(/\\/g, '/');
	    }
	    list.push(file);
	  }

	  // why not simply do `ls('-R', paths)`? because the output wouldn't give the base dirs
	  // to get the base dir in the output, we need instead `ls('-R', 'dir/*')` for every directory

	  paths.forEach(file => {
	    let stat;
	    try {
	      stat = common.statFollowLinks(file);
	    } catch (e) {
	      common.error(`no such file or directory: ${file}`);
	    }

	    pushFile(file);

	    if (stat.isDirectory()) {
	      _ls({ recursive: true, all: true, link }, file).forEach(subfile => {
	        pushFile(path.join(file, subfile));
	      });
	    }
	  });

	  return list;
	}
	find = _find;
	return find;
}

let grep;
let hasRequiredGrep;

// ==> Grep () {
function requireGrep () {
	if (hasRequiredGrep) return grep;
	hasRequiredGrep = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('grep', _grep, {
	  globStart: 2, // don't glob-expand the regex
	  canReceivePipe: true,
	  cmdOptions: {
	    'v': 'inverse',
	    'l': 'nameOnly',
	    'i': 'ignoreCase',
	    'n': 'lineNumber',
	  },
	});

	//@
	//@ ### grep([options,] regex_filter, file [, file ...])
	//@ ### grep([options,] regex_filter, file_array)
	//@
	//@ Available options:
	//@
	//@ + `-v`: Invert `regex_filter` (only print non-matching lines).
	//@ + `-l`: Print only filenames of matching files.
	//@ + `-i`: Ignore case.
	//@ + `-n`: Print line numbers.
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
	//@ grep('GLOBAL_VARIABLE', '*.js');
	//@ ```
	//@
	//@ Reads input string from given files and returns a
	//@ [ShellString](#shellstringstr) containing all lines of the @ file that match
	//@ the given `regex_filter`.
	function _grep({ignoreCase, nameOnly, inverse, lineNumber}, regex, files) {
	  // Check if this is coming from a pipe
	  const pipe = common.readFromPipe();

	  if (!files && !pipe) common.error('no paths given', 2);

	  files = [].slice.call(arguments, 2);

	  if (pipe) {
	    files.unshift('-');
	  }

	  const grep = [];
	  if (ignoreCase) {
	    regex = new RegExp(regex, 'i');
	  }
	  files.forEach(file => {
	    if (!fs.existsSync(file) && file !== '-') {
	      common.error(`no such file or directory: ${file}`, 2, { continue: true });
	      return;
	    }

	    const contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
	    if (nameOnly) {
	      if (contents.match(regex)) {
	        grep.push(file);
	      }
	    } else {
	      const lines = contents.split('\n');
	      lines.forEach((line, index) => {
	        const matched = line.match(regex);
	        if ((inverse && !matched) || (!inverse && matched)) {
	          let result = line;
	          if (lineNumber) {
	            result = `${index + 1}:${line}`;
	          }
	          grep.push(result);
	        }
	      });
	    }
	  });

	  if (grep.length === 0 && common.state.errorCode !== 2) {
	    // We didn't hit the error above, but pattern didn't match
	    common.error('', { silent: true });
	  }
	  return `${grep.join('\n')}\n`;
	}
	grep = _grep;
	return grep;
}

let head;
let hasRequiredHead;

// ==> Head () {
function requireHead () {
	if (hasRequiredHead) return head;
	hasRequiredHead = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('head', _head, {
	  canReceivePipe: true,
	  cmdOptions: {
	    'n': 'numLines',
	  },
	});

	// Reads |numLines| lines or the entire file, whichever is less.
	function readSomeLines(file, numLines) {
	  const buf = common.buffer();
	  const bufLength = buf.length;
	  let bytesRead = bufLength;
	  let pos = 0;

	  const fdr = fs.openSync(file, 'r');
	  let numLinesRead = 0;
	  let ret = '';
	  while (bytesRead === bufLength && numLinesRead < numLines) {
	    bytesRead = fs.readSync(fdr, buf, 0, bufLength, pos);
	    const bufStr = buf.toString('utf8', 0, bytesRead);
	    numLinesRead += bufStr.split('\n').length - 1;
	    ret += bufStr;
	    pos += bytesRead;
	  }

	  fs.closeSync(fdr);
	  return ret;
	}

	//@
	//@ ### head([{'-n': \<num\>},] file [, file ...])
	//@ ### head([{'-n': \<num\>},] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-n <num>`: Show the first `<num>` lines of the files
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var str = head({'-n': 1}, 'file*.txt');
	//@ var str = head('file1', 'file2');
	//@ var str = head(['file1', 'file2']); // same as above
	//@ ```
	//@
	//@ Read the start of a `file`. Returns a [ShellString](#shellstringstr).
	function _head(options, files) {
	  let head = [];
	  const pipe = common.readFromPipe();

	  if (!files && !pipe) common.error('no paths given');

	  let idx = 1;
	  if (options.numLines === true) {
	    idx = 2;
	    options.numLines = Number(arguments[1]);
	  } else if (options.numLines === false) {
	    options.numLines = 10;
	  }
	  files = [].slice.call(arguments, idx);

	  if (pipe) {
	    files.unshift('-');
	  }

	  let shouldAppendNewline = false;
	  files.forEach(file => {
	    if (file !== '-') {
	      if (!fs.existsSync(file)) {
	        common.error(`no such file or directory: ${file}`, { continue: true });
	        return;
	      } else if (common.statFollowLinks(file).isDirectory()) {
	        common.error(`error reading '${file}': Is a directory`, {
	          continue: true,
	        });
	        return;
	      }
	    }

	    let contents;
	    if (file === '-') {
	      contents = pipe;
	    } else if (options.numLines < 0) {
	      contents = fs.readFileSync(file, 'utf8');
	    } else {
	      contents = readSomeLines(file, options.numLines);
	    }

	    const lines = contents.split('\n');
	    const hasTrailingNewline = (lines[lines.length - 1] === '');
	    if (hasTrailingNewline) {
	      lines.pop();
	    }
	    shouldAppendNewline = (hasTrailingNewline || options.numLines < lines.length);

	    head = head.concat(lines.slice(0, options.numLines));
	  });

	  if (shouldAppendNewline) {
	    head.push(''); // to add a trailing newline once we join
	  }
	  return head.join('\n');
	}
	head = _head;
	return head;
}

let ln;
let hasRequiredLn;

// ==> Ln () {
function requireLn () {
	if (hasRequiredLn) return ln;
	hasRequiredLn = 1;
	const fs = require$$1;
	const path = require$$2;
	const common = requireCommon();

	common.register('ln', _ln, {
	  cmdOptions: {
	    's': 'symlink',
	    'f': 'force',
	  },
	});

	//@
	//@ ### ln([options,] source, dest)
	//@
	//@ Available options:
	//@
	//@ + `-s`: symlink
	//@ + `-f`: force
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ ln('file', 'newlink');
	//@ ln('-sf', 'file', 'existing');
	//@ ```
	//@
	//@ Links `source` to `dest`. Use `-f` to force the link, should `dest` already
	//@ exist. Returns a [ShellString](#shellstringstr) indicating success or
	//@ failure.
	function _ln({force, symlink}, source, dest) {
	  if (!source || !dest) {
	    common.error('Missing <source> and/or <dest>');
	  }

	  source = String(source);
	  const sourcePath = path.normalize(source).replace(RegExp(`${path.sep}$`), '');
	  const isAbsolute = (path.resolve(source) === sourcePath);
	  dest = path.resolve(process.cwd(), String(dest));

	  if (fs.existsSync(dest)) {
	    if (!force) {
	      common.error('Destination file exists', { continue: true });
	    }

	    fs.unlinkSync(dest);
	  }

	  if (symlink) {
	    const isWindows = process.platform === 'win32';
	    let linkType = isWindows ? 'file' : null;
	    const resolvedSourcePath = isAbsolute ? sourcePath : path.resolve(process.cwd(), path.dirname(dest), source);
	    if (!fs.existsSync(resolvedSourcePath)) {
	      common.error('Source file does not exist', { continue: true });
	    } else if (isWindows && common.statFollowLinks(resolvedSourcePath).isDirectory()) {
	      linkType = 'junction';
	    }

	    try {
	      fs.symlinkSync(linkType === 'junction' ? resolvedSourcePath : source, dest, linkType);
	    } catch (err) {
	      common.error(err.message);
	    }
	  } else {
	    if (!fs.existsSync(source)) {
	      common.error('Source file does not exist', { continue: true });
	    }
	    try {
	      fs.linkSync(source, dest);
	    } catch (err) {
	      common.error(err.message);
	    }
	  }
	  return '';
	}
	ln = _ln;
	return ln;
}

let mkdir;
let hasRequiredMkdir;

// ==> Mkdir () {
function requireMkdir () {
	if (hasRequiredMkdir) return mkdir;
	hasRequiredMkdir = 1;
	const common = requireCommon();
	const fs = require$$1;
	const path = require$$2;

	common.register('mkdir', _mkdir, {
	  cmdOptions: {
	    'p': 'fullpath',
	  },
	});

	// Recursively creates `dir`
	function mkdirSyncRecursive(dir) {
	  const baseDir = path.dirname(dir);

	  // Prevents some potential problems arising from malformed UNCs or
	  // insufficient permissions.
	  /* istanbul ignore next */
	  if (baseDir === dir) {
	    common.error(`dirname() failed: [${dir}]`);
	  }

	  // Base dir does not exist, go recursive
	  if (!fs.existsSync(baseDir)) {
	    mkdirSyncRecursive(baseDir);
	  }

	  try {
	    // Base dir created, can create dir
	    fs.mkdirSync(dir, parseInt('0777', 8));
	  } catch (e) {
	    // swallow error if dir already exists
	    if (e.code !== 'EEXIST' || common.statNoFollowLinks(dir).isFile()) { throw e; }
	  }
	}

	//@
	//@ ### mkdir([options,] dir [, dir ...])
	//@ ### mkdir([options,] dir_array)
	//@
	//@ Available options:
	//@
	//@ + `-p`: full path (and create intermediate directories, if necessary)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ mkdir('-p', '/tmp/a/b/c/d', '/tmp/e/f/g');
	//@ mkdir('-p', ['/tmp/a/b/c/d', '/tmp/e/f/g']); // same as above
	//@ ```
	//@
	//@ Creates directories. Returns a [ShellString](#shellstringstr) indicating
	//@ success or failure.
	function _mkdir({fullpath}, dirs) {
	  if (!dirs) common.error('no paths given');

	  if (typeof dirs === 'string') {
	    dirs = [].slice.call(arguments, 1);
	  }
	  // if it's array leave it as it is

	  dirs.forEach(dir => {
	    try {
	      const stat = common.statNoFollowLinks(dir);
	      if (!fullpath) {
	        common.error(`path already exists: ${dir}`, { continue: true });
	      } else if (stat.isFile()) {
	        common.error(`cannot create directory ${dir}: File exists`, { continue: true });
	      }
	      return; // skip dir
	    } catch (e) {
	      // do nothing
	    }

	    // Base dir does not exist, and no -p option given
	    const baseDir = path.dirname(dir);
	    if (!fs.existsSync(baseDir) && !fullpath) {
	      common.error(`no such file or directory: ${baseDir}`, { continue: true });
	      return; // skip dir
	    }

	    try {
	      if (fullpath) {
	        mkdirSyncRecursive(path.resolve(dir));
	      } else {
	        fs.mkdirSync(dir, parseInt('0777', 8));
	      }
	    } catch (e) {
	      let reason;
	      if (e.code === 'EACCES') {
	        reason = 'Permission denied';
	      } else if (e.code === 'ENOTDIR' || e.code === 'ENOENT') {
	        reason = 'Not a directory';
	      } else {
	        /* istanbul ignore next */
	        throw e;
	      }
	      common.error(`cannot create directory ${dir}: ${reason}`, { continue: true });
	    }
	  });
	  return '';
	} // man arraykdir
	mkdir = _mkdir;
	return mkdir;
}

let rm;
let hasRequiredRm;

// ==> Rm () {
function requireRm () {
	if (hasRequiredRm) return rm;
	hasRequiredRm = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('rm', _rm, {
	  cmdOptions: {
	    'f': 'force',
	    'r': 'recursive',
	    'R': 'recursive',
	  },
	});

	// Recursively removes 'dir'
	// Adapted from https://github.com/ryanmcgrath/wrench-js
	//
	// Copyright (c) 2010 Ryan McGrath
	// Copyright (c) 2012 Artur Adib
	//
	// Licensed under the MIT License
	// http://www.opensource.org/licenses/mit-license.php
	function rmdirSyncRecursive(dir, force, fromSymlink) {
	  let files;

	  files = fs.readdirSync(dir);

	  // Loop through and delete everything in the sub-tree after checking it
	  for (let i = 0; i < files.length; i++) {
	    const file = `${dir}/${files[i]}`;
	    const currFile = common.statNoFollowLinks(file);

	    if (currFile.isDirectory()) { // Recursive function back to the beginning
	      rmdirSyncRecursive(file, force);
	    } else if (force || isWriteable(file)) {
	      // Assume it's a file - perhaps a try/catch belongs here?
	      try {
	        common.unlinkSync(file);
	      } catch (e) {
	        /* istanbul ignore next */
	        common.error(`could not remove file (code ${e.code}): ${file}`, {
	          continue: true,
	        });
	      }
	    }
	  }

	  // if was directory was referenced through a symbolic link,
	  // the contents should be removed, but not the directory itself
	  if (fromSymlink) return;

	  // Now that we know everything in the sub-tree has been deleted, we can delete the main directory.
	  // Huzzah for the shopkeep.

	  let result;
	  try {
	    // Retry on windows, sometimes it takes a little time before all the files in the directory are gone
	    const start = Date.now();

	    // TODO: replace this with a finite loop
	    for (;;) {
	      try {
	        result = fs.rmdirSync(dir);
	        if (fs.existsSync(dir)) throw { code: 'EAGAIN' };
	        break;
	      } catch (er) {
	        /* istanbul ignore next */
	        // In addition to error codes, also check if the directory still exists and loop again if true
	        if (process.platform === 'win32' && (er.code === 'ENOTEMPTY' || er.code === 'EBUSY' || er.code === 'EPERM' || er.code === 'EAGAIN')) {
	          if (Date.now() - start > 1000) throw er;
	        } else if (er.code === 'ENOENT') {
	          // Directory did not exist, deletion was successful
	          break;
	        } else {
	          throw er;
	        }
	      }
	    }
	  } catch (e) {
	    common.error(`could not remove directory (code ${e.code}): ${dir}`, { continue: true });
	  }

	  return result;
	} // rmdirSyncRecursive

	// Hack to determine if file has write permissions for current user
	// Avoids having to check user, group, etc, but it's probably slow
	function isWriteable(file) {
	  let writePermission = true;
	  try {
	    const __fd = fs.openSync(file, 'a');
	    fs.closeSync(__fd);
	  } catch (e) {
	    writePermission = false;
	  }

	  return writePermission;
	}

	function handleFile(file, {force}) {
	  if (force || isWriteable(file)) {
	    // -f was passed, or file is writable, so it can be removed
	    common.unlinkSync(file);
	  } else {
	    common.error(`permission denied: ${file}`, { continue: true });
	  }
	}

	function handleDirectory(file, {recursive, force}) {
	  if (recursive) {
	    // -r was passed, so directory can be removed
	    rmdirSyncRecursive(file, force);
	  } else {
	    common.error('path is a directory', { continue: true });
	  }
	}

	function handleSymbolicLink(file, {recursive, force}) {
	  let stats;
	  try {
	    stats = common.statFollowLinks(file);
	  } catch (e) {
	    // symlink is broken, so remove the symlink itself
	    common.unlinkSync(file);
	    return;
	  }

	  if (stats.isFile()) {
	    common.unlinkSync(file);
	  } else if (stats.isDirectory()) {
	    if (file[file.length - 1] === '/') {
	      // trailing separator, so remove the contents, not the link
	      if (recursive) {
	        // -r was passed, so directory can be removed
	        const fromSymlink = true;
	        rmdirSyncRecursive(file, force, fromSymlink);
	      } else {
	        common.error('path is a directory', { continue: true });
	      }
	    } else {
	      // no trailing separator, so remove the link
	      common.unlinkSync(file);
	    }
	  }
	}

	function handleFIFO(file) {
	  common.unlinkSync(file);
	}

	//@
	//@ ### rm([options,] file [, file ...])
	//@ ### rm([options,] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-f`: force
	//@ + `-r, -R`: recursive
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ rm('-rf', '/tmp/*');
	//@ rm('some_file.txt', 'another_file.txt');
	//@ rm(['some_file.txt', 'another_file.txt']); // same as above
	//@ ```
	//@
	//@ Removes files. Returns a [ShellString](#shellstringstr) indicating success
	//@ or failure.
	function _rm(options, files) {
	  if (!files) common.error('no paths given');

	  // Convert to array
	  files = [].slice.call(arguments, 1);

	  files.forEach(file => {
	    let lstats;
	    try {
	      const filepath = (file[file.length - 1] === '/')
	        ? file.slice(0, -1) // remove the '/' so lstatSync can detect symlinks
	        : file;
	      lstats = common.statNoFollowLinks(filepath); // test for existence
	    } catch (e) {
	      // Path does not exist, no force flag given
	      if (!options.force) {
	        common.error(`no such file or directory: ${file}`, { continue: true });
	      }
	      return; // skip file
	    }

	    // If here, path exists
	    if (lstats.isFile()) {
	      handleFile(file, options);
	    } else if (lstats.isDirectory()) {
	      handleDirectory(file, options);
	    } else if (lstats.isSymbolicLink()) {
	      handleSymbolicLink(file, options);
	    } else if (lstats.isFIFO()) {
	      handleFIFO(file);
	    }
	  }); // forEach(file)
	  return '';
	} // rm
	rm = _rm;
	return rm;
}

let mv;
let hasRequiredMv;

// ==> Mv () {
function requireMv () {
	if (hasRequiredMv) return mv;
	hasRequiredMv = 1;
	const fs = require$$1;
	const path = require$$2;
	const common = requireCommon();
	const cp = requireCp();
	const rm = requireRm();

	common.register('mv', _mv, {
	  cmdOptions: {
	    'f': '!no_force',
	    'n': 'no_force',
	  },
	});

	// Checks if cureent file was created recently
	function checkRecentCreated(sources, index) {
	  const lookedSource = sources[index];
	  return sources.slice(0, index).some(src => {
	    return path.basename(src) === path.basename(lookedSource);
	  });
	}

	//@
	//@ ### mv([options ,] source [, source ...], dest')
	//@ ### mv([options ,] source_array, dest')
	//@
	//@ Available options:
	//@
	//@ + `-f`: force (default behavior)
	//@ + `-n`: no-clobber
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ mv('-n', 'file', 'dir/');
	//@ mv('file1', 'file2', 'dir/');
	//@ mv(['file1', 'file2'], 'dir/'); // same as above
	//@ ```
	//@
	//@ Moves `source` file(s) to `dest`. Returns a [ShellString](#shellstringstr)
	//@ indicating success or failure.
	function _mv({no_force}, sources, dest) {
	  // Get sources, dest
	  if (arguments.length < 3) {
	    common.error('missing <source> and/or <dest>');
	  } else if (arguments.length > 3) {
	    sources = [].slice.call(arguments, 1, arguments.length - 1);
	    dest = arguments[arguments.length - 1];
	  } else if (typeof sources === 'string') {
	    sources = [sources];
	  } else {
	    // TODO(nate): figure out if we actually need this line
	    common.error('invalid arguments');
	  }

	  const exists = fs.existsSync(dest);
	  const stats = exists && common.statFollowLinks(dest);

	  // Dest is not existing dir, but multiple sources given
	  if ((!exists || !stats.isDirectory()) && sources.length > 1) {
	    common.error('dest is not a directory (too many sources)');
	  }

	  // Dest is an existing file, but no -f given
	  if (exists && stats.isFile() && no_force) {
	    common.error(`dest file already exists: ${dest}`);
	  }

	  sources.forEach((src, srcIndex) => {
	    if (!fs.existsSync(src)) {
	      common.error(`no such file or directory: ${src}`, { continue: true });
	      return; // skip file
	    }

	    // If here, src exists

	    // When copying to '/path/dir':
	    //    thisDest = '/path/dir/file1'
	    let thisDest = dest;
	    if (fs.existsSync(dest) && common.statFollowLinks(dest).isDirectory()) {
	      thisDest = path.normalize(`${dest}/${path.basename(src)}`);
	    }

	    const thisDestExists = fs.existsSync(thisDest);

	    if (thisDestExists && checkRecentCreated(sources, srcIndex)) {
	      // cannot overwrite file created recently in current execution, but we want to continue copying other files
	      if (!no_force) {
	        common.error(`will not overwrite just-created '${thisDest}' with '${src}'`, { continue: true });
	      }
	      return;
	    }

	    if (fs.existsSync(thisDest) && no_force) {
	      common.error(`dest file already exists: ${thisDest}`, { continue: true });
	      return; // skip file
	    }

	    if (path.resolve(src) === path.dirname(path.resolve(thisDest))) {
	      common.error(`cannot move to self: ${src}`, { continue: true });
	      return; // skip file
	    }

	    try {
	      fs.renameSync(src, thisDest);
	    } catch (e) {
	      /* istanbul ignore next */
	      if (e.code === 'EXDEV') {
	        // If we're trying to `mv` to an external partition, we'll actually need
	        // to perform a copy and then clean up the original file. If either the
	        // copy or the rm fails with an exception, we should allow this
	        // exception to pass up to the top level.
	        cp({ recursive: true }, src, thisDest);
	        rm({ recursive: true, force: true }, src);
	      }
	    }
	  }); // forEach(src)
	  return '';
	} // mv
	mv = _mv;
	return mv;
}

let sed;
let hasRequiredSed;

// ==> Sed () {
function requireSed () {
	if (hasRequiredSed) return sed;
	hasRequiredSed = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('sed', _sed, {
	  globStart: 3, // don't glob-expand regexes
	  canReceivePipe: true,
	  cmdOptions: {
	    'i': 'inplace',
	  },
	});

	//@
	//@ ### sed([options,] search_regex, replacement, file [, file ...])
	//@ ### sed([options,] search_regex, replacement, file_array)
	//@
	//@ Available options:
	//@
	//@ + `-i`: Replace contents of `file` in-place. _Note that no backups will be created!_
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ sed('-i', 'PROGRAM_VERSION', 'v0.1.3', 'source.js');
	//@ ```
	//@
	//@ Reads an input string from `file`s, line by line, and performs a JavaScript `replace()` on
	//@ each of the lines from the input string using the given `search_regex` and `replacement` string or
	//@ function. Returns the new [ShellString](#shellstringstr) after replacement.
	//@
	//@ Note:
	//@
	//@ Like unix `sed`, ShellJS `sed` supports capture groups. Capture groups are specified
	//@ using the `$n` syntax:
	//@
	//@ ```javascript
	//@ sed(/(\w+)\s(\w+)/, '$2, $1', 'file.txt');
	//@ ```
	//@
	//@ Also, like unix `sed`, ShellJS `sed` runs replacements on each line from the input file
	//@ (split by '\n') separately, so `search_regex`es that span more than one line (or include '\n')
	//@ will not match anything and nothing will be replaced.
	function _sed({inplace}, regex, replacement, files) {
	  // Check if this is coming from a pipe
	  const pipe = common.readFromPipe();

	  if (typeof replacement !== 'string' && typeof replacement !== 'function') {
	    if (typeof replacement === 'number') {
	      replacement = replacement.toString(); // fallback
	    } else {
	      common.error('invalid replacement string');
	    }
	  }

	  // Convert all search strings to RegExp
	  if (typeof regex === 'string') {
	    regex = RegExp(regex);
	  }

	  if (!files && !pipe) {
	    common.error('no files given');
	  }

	  files = [].slice.call(arguments, 3);

	  if (pipe) {
	    files.unshift('-');
	  }

	  const sed = [];
	  files.forEach(file => {
	    if (!fs.existsSync(file) && file !== '-') {
	      common.error(`no such file or directory: ${file}`, 2, { continue: true });
	      return;
	    }

	    const contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
	    const lines = contents.split('\n');
	    const result = lines.map(line => {
	      return line.replace(regex, replacement);
	    }).join('\n');

	    sed.push(result);

	    if (inplace) {
	      fs.writeFileSync(file, result, 'utf8');
	    }
	  });

	  if (inplace) {
	    return '';
	  } else {
	    return sed.join('\n');
	  }
	}
	sed = _sed;
	return sed;
}

let set;
let hasRequiredSet;

// ==> Set () {
function requireSet () {
	if (hasRequiredSet) return set;
	hasRequiredSet = 1;
	const common = requireCommon();

	common.register('set', _set, {
	  allowGlobbing: false,
	  wrapOutput: false,
	});

	//@
	//@ ### set(options)
	//@
	//@ Available options:
	//@
	//@ + `+/-e`: exit upon error (`config.fatal`)
	//@ + `+/-v`: verbose: show all commands (`config.verbose`)
	//@ + `+/-f`: disable filename expansion (globbing)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ set('-e'); // exit upon first error
	//@ set('+e'); // this undoes a "set('-e')"
	//@ ```
	//@
	//@ Sets global configuration variables.
	function _set(options) {
	  if (!options) {
	    const args = [].slice.call(arguments, 0);
	    if (args.length < 2) common.error('must provide an argument');
	    options = args[1];
	  }
	  const negate = (options[0] === '+');
	  if (negate) {
	    options = `-${options.slice(1)}`; // parseOptions needs a '-' prefix
	  }
	  options = common.parseOptions(options, {
	    'e': 'fatal',
	    'v': 'verbose',
	    'f': 'noglob',
	  });

	  if (negate) {
	    Object.keys(options).forEach(key => {
	      options[key] = !options[key];
	    });
	  }

	  Object.keys(options).forEach(key => {
	    // Only change the global config if `negate` is false and the option is true
	    // or if `negate` is true and the option is false (aka negate !== option)
	    if (negate !== options[key]) {
	      common.config[key] = options[key];
	    }
	  });
	}
	set = _set;
	return set;
}

let sort;
let hasRequiredSort;

// ==> Sort () {
function requireSort () {
	if (hasRequiredSort) return sort;
	hasRequiredSort = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('sort', _sort, {
	  canReceivePipe: true,
	  cmdOptions: {
	    'r': 'reverse',
	    'n': 'numerical',
	  },
	});

	// parse out the number prefix of a line
	function parseNumber(str) {
	  const match = str.match(/^\s*(\d*)\s*(.*)$/);
	  return { num: Number(match[1]), value: match[2] };
	}

	// compare two strings case-insensitively, but examine case for strings that are
	// case-insensitive equivalent
	function unixCmp(a, b) {
	  const aLower = a.toLowerCase();
	  const bLower = b.toLowerCase();
	  return (aLower === bLower ?
	      -1 * a.localeCompare(b) : // unix sort treats case opposite how javascript does
	      aLower.localeCompare(bLower));
	}

	// compare two strings in the fashion that unix sort's -n option works
	function numericalCmp(a, b) {
	  const objA = parseNumber(a);
	  const objB = parseNumber(b);
	  if (objA.hasOwnProperty('num') && objB.hasOwnProperty('num')) {
	    return ((objA.num !== objB.num) ?
	        (objA.num - objB.num) :
	        unixCmp(objA.value, objB.value));
	  } else {
	    return unixCmp(objA.value, objB.value);
	  }
	}

	//@
	//@ ### sort([options,] file [, file ...])
	//@ ### sort([options,] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-r`: Reverse the results
	//@ + `-n`: Compare according to numerical value
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ sort('foo.txt', 'bar.txt');
	//@ sort('-r', 'foo.txt');
	//@ ```
	//@
	//@ Return the contents of the `file`s, sorted line-by-line as a
	//@ [ShellString](#shellstringstr). Sorting multiple files mixes their content
	//@ (just as unix `sort` does).
	function _sort({numerical, reverse}, files) {
	  // Check if this is coming from a pipe
	  const pipe = common.readFromPipe();

	  if (!files && !pipe) common.error('no files given');

	  files = [].slice.call(arguments, 1);

	  if (pipe) {
	    files.unshift('-');
	  }

	  const lines = files.reduce((accum, file) => {
	    if (file !== '-') {
	      if (!fs.existsSync(file)) {
	        common.error(`no such file or directory: ${file}`, { continue: true });
	        return accum;
	      } else if (common.statFollowLinks(file).isDirectory()) {
	        common.error(`read failed: ${file}: Is a directory`, {
	          continue: true,
	        });
	        return accum;
	      }
	    }

	    const contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
	    return accum.concat(contents.trimRight().split('\n'));
	  }, []);

	  let sorted = lines.sort(numerical ? numericalCmp : unixCmp);

	  if (reverse) {
	    sorted = sorted.reverse();
	  }

	  return `${sorted.join('\n')}\n`;
	}

	sort = _sort;
	return sort;
}

let tail;
let hasRequiredTail;

// ==> Tail () {
function requireTail () {
	if (hasRequiredTail) return tail;
	hasRequiredTail = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('tail', _tail, {
	  canReceivePipe: true,
	  cmdOptions: {
	    'n': 'numLines',
	  },
	});

	//@
	//@ ### tail([{'-n': \<num\>},] file [, file ...])
	//@ ### tail([{'-n': \<num\>},] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-n <num>`: Show the last `<num>` lines of `file`s
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var str = tail({'-n': 1}, 'file*.txt');
	//@ var str = tail('file1', 'file2');
	//@ var str = tail(['file1', 'file2']); // same as above
	//@ ```
	//@
	//@ Read the end of a `file`. Returns a [ShellString](#shellstringstr).
	function _tail(options, files) {
	  let tail = [];
	  const pipe = common.readFromPipe();

	  if (!files && !pipe) common.error('no paths given');

	  let idx = 1;
	  let plusOption = false;
	  if (options.numLines === true) {
	    idx = 2;
	    if (arguments[1][0] === '+') {
	      plusOption = true;
	    }
	    options.numLines = Number(arguments[1]);
	  } else if (options.numLines === false) {
	    options.numLines = 10;
	  }
	  // arguments[0] is a json object
	  if (arguments[0].numLines[0] === '+') {
	    plusOption = true;
	  }
	  options.numLines = -1 * Math.abs(options.numLines);
	  files = [].slice.call(arguments, idx);

	  if (pipe) {
	    files.unshift('-');
	  }

	  let shouldAppendNewline = false;
	  files.forEach(file => {
	    if (file !== '-') {
	      if (!fs.existsSync(file)) {
	        common.error(`no such file or directory: ${file}`, { continue: true });
	        return;
	      } else if (common.statFollowLinks(file).isDirectory()) {
	        common.error(`error reading '${file}': Is a directory`, {
	          continue: true,
	        });
	        return;
	      }
	    }

	    const contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');

	    const lines = contents.split('\n');
	    if (lines[lines.length - 1] === '') {
	      lines.pop();
	      shouldAppendNewline = true;
	    } else {
	      shouldAppendNewline = false;
	    }

	    tail = tail.concat(plusOption ? lines.slice(-options.numLines - 1) : lines.slice(options.numLines));
	  });

	  if (shouldAppendNewline) {
	    tail.push(''); // to add a trailing newline once we join
	  }

	  return tail.join('\n');
	}

	tail = _tail;
	return tail;
}

let test;
let hasRequiredTest;

// ==> Test () {
function requireTest () {
	if (hasRequiredTest) return test;
	hasRequiredTest = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('test', _test, {
	  cmdOptions: {
	    'b': 'block',
	    'c': 'character',
	    'd': 'directory',
	    'e': 'exists',
	    'f': 'file',
	    'L': 'link',
	    'p': 'pipe',
	    'S': 'socket',
	  },
	  wrapOutput: false,
	  allowGlobbing: false,
	});


	//@
	//@ ### test(expression)
	//@
	//@ Available expression primaries:
	//@
	//@ + `'-b', 'path'`: true if path is a block device
	//@ + `'-c', 'path'`: true if path is a character device
	//@ + `'-d', 'path'`: true if path is a directory
	//@ + `'-e', 'path'`: true if path exists
	//@ + `'-f', 'path'`: true if path is a regular file
	//@ + `'-L', 'path'`: true if path is a symbolic link
	//@ + `'-p', 'path'`: true if path is a pipe (FIFO)
	//@ + `'-S', 'path'`: true if path is a socket
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ if (test('-d', path)) { /* do something with dir */ };
	//@ if (!test('-f', path)) continue; // skip if it's not a regular file
	//@ ```
	//@
	//@ Evaluates `expression` using the available primaries and returns
	//@ corresponding boolean value.
	function _test(options, path) {
	  if (!path) common.error('no path given');

	  let canInterpret = false;
	  Object.keys(options).forEach(key => {
	    if (options[key] === true) {
	      canInterpret = true;
	    }
	  });

	  if (!canInterpret) common.error('could not interpret expression');

	  if (options.link) {
	    try {
	      return common.statNoFollowLinks(path).isSymbolicLink();
	    } catch (e) {
	      return false;
	    }
	  }

	  if (!fs.existsSync(path)) return false;

	  if (options.exists) return true;

	  const stats = common.statFollowLinks(path);

	  if (options.block) return stats.isBlockDevice();

	  if (options.character) return stats.isCharacterDevice();

	  if (options.directory) return stats.isDirectory();

	  if (options.file) return stats.isFile();

	  /* istanbul ignore next */
	  if (options.pipe) return stats.isFIFO();

	  /* istanbul ignore next */
	  if (options.socket) return stats.isSocket();

	  /* istanbul ignore next */
	  return false; // fallback
	} // test
	test = _test;
	return test;
}

let to;
let hasRequiredTo;

// ==> To () {
function requireTo () {
	if (hasRequiredTo) return to;
	hasRequiredTo = 1;
	const common = requireCommon();
	const fs = require$$1;
	const path = require$$2;

	common.register('to', _to, {
	  pipeOnly: true,
	  wrapOutput: false,
	});

	//@
	//@ ### ShellString.prototype.to(file)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ cat('input.txt').to('output.txt');
	//@ ```
	//@
	//@ Analogous to the redirection operator `>` in Unix, but works with
	//@ `ShellStrings` (such as those returned by `cat`, `grep`, etc.). _Like Unix
	//@ redirections, `to()` will overwrite any existing file!_ Returns the same
	//@ [ShellString](#shellstringstr) this operated on, to support chaining.
	function _to(options, file) {
	  if (!file) common.error('wrong arguments');

	  if (!fs.existsSync(path.dirname(file))) {
	    common.error(`no such file or directory: ${path.dirname(file)}`);
	  }

	  try {
	    fs.writeFileSync(file, this.stdout || this.toString(), 'utf8');
	    return this;
	  } catch (e) {
	    /* istanbul ignore next */
	    common.error(`could not write to file (code ${e.code}): ${file}`, { continue: true });
	  }
	}
	to = _to;
	return to;
}

let toEnd;
let hasRequiredToEnd;

// ==> ToEnd () {
function requireToEnd () {
	if (hasRequiredToEnd) return toEnd;
	hasRequiredToEnd = 1;
	const common = requireCommon();
	const fs = require$$1;
	const path = require$$2;

	common.register('toEnd', _toEnd, {
	  pipeOnly: true,
	  wrapOutput: false,
	});

	//@
	//@ ### ShellString.prototype.toEnd(file)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ cat('input.txt').toEnd('output.txt');
	//@ ```
	//@
	//@ Analogous to the redirect-and-append operator `>>` in Unix, but works with
	//@ `ShellStrings` (such as those returned by `cat`, `grep`, etc.). Returns the
	//@ same [ShellString](#shellstringstr) this operated on, to support chaining.
	function _toEnd(options, file) {
	  if (!file) common.error('wrong arguments');

	  if (!fs.existsSync(path.dirname(file))) {
	    common.error(`no such file or directory: ${path.dirname(file)}`);
	  }

	  try {
	    fs.appendFileSync(file, this.stdout || this.toString(), 'utf8');
	    return this;
	  } catch (e) {
	    /* istanbul ignore next */
	    common.error(`could not append to file (code ${e.code}): ${file}`, { continue: true });
	  }
	}
	toEnd = _toEnd;
	return toEnd;
}

let touch;
let hasRequiredTouch;

// ==> Touch () {
function requireTouch () {
	if (hasRequiredTouch) return touch;
	hasRequiredTouch = 1;
	const common = requireCommon();
	const fs = require$$1;

	common.register('touch', _touch, {
	  cmdOptions: {
	    'a': 'atime_only',
	    'c': 'no_create',
	    'd': 'date',
	    'm': 'mtime_only',
	    'r': 'reference',
	  },
	});

	//@
	//@ ### touch([options,] file [, file ...])
	//@ ### touch([options,] file_array)
	//@
	//@ Available options:
	//@
	//@ + `-a`: Change only the access time
	//@ + `-c`: Do not create any files
	//@ + `-m`: Change only the modification time
	//@ + `{'-d': someDate}`, `{date: someDate}`: Use a `Date` instance (ex. `someDate`)
	//@   instead of current time
	//@ + `{'-r': file}`, `{reference: file}`: Use `file`'s times instead of current
	//@   time
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ touch('source.js');
	//@ touch('-c', 'path/to/file.js');
	//@ touch({ '-r': 'referenceFile.txt' }, 'path/to/file.js');
	//@ touch({ '-d': new Date('December 17, 1995 03:24:00'), '-m': true }, 'path/to/file.js');
	//@ touch({ date: new Date('December 17, 1995 03:24:00') }, 'path/to/file.js');
	//@ ```
	//@
	//@ Update the access and modification times of each file to the current time.
	//@ A file argument that does not exist is created empty, unless `-c` is supplied.
	//@ This is a partial implementation of
	//@ [`touch(1)`](http://linux.die.net/man/1/touch). Returns a
	//@ [ShellString](#shellstringstr) indicating success or failure.
	function _touch(opts, files) {
	  if (!files) {
	    common.error('no files given');
	  } else if (typeof files === 'string') {
	    files = [].slice.call(arguments, 1);
	  } else {
	    common.error('file arg should be a string file path or an Array of string file paths');
	  }

	  files.forEach(f => {
	    touchFile(opts, f);
	  });
	  return '';
	}

	function touchFile(opts, file) {
	  const stat = tryStatFile(file);

	  if (stat && stat.isDirectory()) {
	    // don't error just exit
	    return;
	  }

	  // if the file doesn't already exist and the user has specified --no-create then
	  // this script is finished
	  if (!stat && opts.no_create) {
	    return;
	  }

	  // open the file and then close it. this will create it if it doesn't exist but will
	  // not truncate the file
	  fs.closeSync(fs.openSync(file, 'a'));

	  //
	  // Set timestamps
	  //

	  // setup some defaults
	  const now = new Date();
	  let mtime = opts.date || now;
	  let atime = opts.date || now;

	  // use reference file
	  if (opts.reference) {
	    const refStat = tryStatFile(opts.reference);
	    if (!refStat) {
	      common.error(`failed to get attributess of ${opts.reference}`);
	    }
	    mtime = refStat.mtime;
	    atime = refStat.atime;
	  } else if (opts.date) {
	    mtime = opts.date;
	    atime = opts.date;
	  }

	  if (opts.atime_only && opts.mtime_only) ; else if (opts.atime_only) {
	    mtime = stat.mtime;
	  } else if (opts.mtime_only) {
	    atime = stat.atime;
	  }

	  fs.utimesSync(file, atime, mtime);
	}

	touch = _touch;

	function tryStatFile(filePath) {
	  try {
	    return common.statFollowLinks(filePath);
	  } catch (e) {
	    return null;
	  }
	}
	return touch;
}

let uniq;
let hasRequiredUniq;

// ==> Uniq () {
function requireUniq () {
	if (hasRequiredUniq) return uniq;
	hasRequiredUniq = 1;
	const common = requireCommon();
	const fs = require$$1;

	// add c spaces to the left of str
	function lpad(c, str) {
	  let res = `${str}`;
	  if (res.length < c) {
	    res = Array((c - res.length) + 1).join(' ') + res;
	  }
	  return res;
	}

	common.register('uniq', _uniq, {
	  canReceivePipe: true,
	  cmdOptions: {
	    'i': 'ignoreCase',
	    'c': 'count',
	    'd': 'duplicates',
	  },
	});

	//@
	//@ ### uniq([options,] [input, [output]])
	//@
	//@ Available options:
	//@
	//@ + `-i`: Ignore case while comparing
	//@ + `-c`: Prefix lines by the number of occurrences
	//@ + `-d`: Only print duplicate lines, one for each group of identical lines
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ uniq('foo.txt');
	//@ uniq('-i', 'foo.txt');
	//@ uniq('-cd', 'foo.txt', 'bar.txt');
	//@ ```
	//@
	//@ Filter adjacent matching lines from `input`. Returns a
	//@ [ShellString](#shellstringstr).
	function _uniq({ignoreCase, duplicates, count}, input, output) {
	  // Check if this is coming from a pipe
	  const pipe = common.readFromPipe();

	  if (!pipe) {
	    if (!input) common.error('no input given');

	    if (!fs.existsSync(input)) {
	      common.error(`${input}: No such file or directory`);
	    } else if (common.statFollowLinks(input).isDirectory()) {
	      common.error(`error reading '${input}'`);
	    }
	  }
	  if (output && fs.existsSync(output) && common.statFollowLinks(output).isDirectory()) {
	    common.error(`${output}: Is a directory`);
	  }

	  const lines = (input ? fs.readFileSync(input, 'utf8') : pipe)
	              .trimRight()
	              .split('\n');

	  const compare = (a, b) => {
	    return ignoreCase ?
	           a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()) :
	           a.localeCompare(b);
	  };
	  const uniqed = `${lines.reduceRight((res, e) => {
  // Perform uniq -c on the input
  if (res.length === 0) {
    return [{ count: 1, ln: e }];
  } else if (compare(res[0].ln, e) === 0) {
    return [{ count: res[0].count + 1, ln: e }].concat(res.slice(1));
  } else {
    return [{ count: 1, ln: e }].concat(res);
  }
}, []).filter(({count}) => {
               // Do we want only duplicated objects?
  return duplicates ? count > 1 : true;
}).map(obj => {
               // Are we tracking the counts of each line?
  return (count ? (`${lpad(7, obj.count)} `) : '') + obj.ln;
}).join('\n')}\n`;

	  if (output) {
	    (new common.ShellString(uniqed)).to(output);
	    // if uniq writes to output, nothing is passed to the next command in the pipeline (if any)
	    return '';
	  } else {
	    return uniqed;
	  }
	}

	uniq = _uniq;
	return uniq;
}

let which;
let hasRequiredWhich;

// ==> Which () {
function requireWhich () {
	if (hasRequiredWhich) return which;
	hasRequiredWhich = 1;
	const common = requireCommon();
	const fs = require$$1;
	const path = require$$2;

	common.register('which', _which, {
	  allowGlobbing: false,
	  cmdOptions: {
	    'a': 'all',
	  },
	});

	// XP's system default value for `PATHEXT` system variable, just in case it's not
	// set on Windows.
	const XP_DEFAULT_PATHEXT = '.com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh';

	// For earlier versions of NodeJS that doesn't have a list of constants (< v6)
	const FILE_EXECUTABLE_MODE = 1;

	function isWindowsPlatform() {
	  return process.platform === 'win32';
	}

	// Cross-platform method for splitting environment `PATH` variables
	function splitPath(p) {
	  return p ? p.split(path.delimiter) : [];
	}

	// Tests are running all cases for this func but it stays uncovered by codecov due to unknown reason
	/* istanbul ignore next */
	function isExecutable(pathName) {
	  try {
	    // TODO(node-support): replace with fs.constants.X_OK once remove support for node < v6
	    fs.accessSync(pathName, FILE_EXECUTABLE_MODE);
	  } catch (err) {
	    return false;
	  }
	  return true;
	}

	function checkPath(pathName) {
	  return fs.existsSync(pathName) && !common.statFollowLinks(pathName).isDirectory()
	    && (isWindowsPlatform() || isExecutable(pathName));
	}

	//@
	//@ ### which(command)
	//@
	//@ Examples:
	//@
	//@ ```javascript
	//@ var nodeExec = which('node');
	//@ ```
	//@
	//@ Searches for `command` in the system's `PATH`. On Windows, this uses the
	//@ `PATHEXT` variable to append the extension if it's not already executable.
	//@ Returns a [ShellString](#shellstringstr) containing the absolute path to
	//@ `command`.
	function _which({all}, cmd) {
	  if (!cmd) common.error('must specify command');

	  const isWindows = isWindowsPlatform();
	  const pathArray = splitPath(process.env.PATH);

	  const queryMatches = [];

	  // No relative/absolute paths provided?
	  if (!cmd.includes('/')) {
	    // Assume that there are no extensions to append to queries (this is the
	    // case for unix)
	    let pathExtArray = [''];
	    if (isWindows) {
	      // In case the PATHEXT variable is somehow not set (e.g.
	      // child_process.spawn with an empty environment), use the XP default.
	      const pathExtEnv = process.env.PATHEXT || XP_DEFAULT_PATHEXT;
	      pathExtArray = splitPath(pathExtEnv.toUpperCase());
	    }

	    // Search for command in PATH
	    for (let k = 0; k < pathArray.length; k++) {
	      // already found it
	      if (queryMatches.length > 0 && !all) break;

	      let attempt = path.resolve(pathArray[k], cmd);

	      if (isWindows) {
	        attempt = attempt.toUpperCase();
	      }

	      const match = attempt.match(/\.[^<>:"/|?*.]+$/);
	      if (match && pathExtArray.includes(match[0])) { // this is Windows-only
	        // The user typed a query with the file extension, like
	        // `which('node.exe')`
	        if (checkPath(attempt)) {
	          queryMatches.push(attempt);
	          break;
	        }
	      } else { // All-platforms
	        // Cycle through the PATHEXT array, and check each extension
	        // Note: the array is always [''] on Unix
	        for (let i = 0; i < pathExtArray.length; i++) {
	          const ext = pathExtArray[i];
	          const newAttempt = attempt + ext;
	          if (checkPath(newAttempt)) {
	            queryMatches.push(newAttempt);
	            break;
	          }
	        }
	      }
	    }
	  } else if (checkPath(cmd)) { // a valid absolute or relative path
	    queryMatches.push(path.resolve(cmd));
	  }

	  if (queryMatches.length > 0) {
	    return all ? queryMatches : queryMatches[0];
	  }
	  return all ? [] : null;
	}
	which = _which;
	return which;
}

const _register = {};

let hasRequired_register;

// ==> _register () {
function require_register () {
	if (hasRequired_register) return _register;
	hasRequired_register = 1;
	const { DEFAULT_WRAP_OPTIONS, shell, shellMethods, wrap, pipeMethods } = requireCommon();

	// Register a new ShellJS command
	function _register$1(name, implementation, wrapOptions = {}) {
      // Validate options
      Object.keys(wrapOptions).forEach(option => {
	    if (!DEFAULT_WRAP_OPTIONS.hasOwnProperty(option)) {
	      throw new Error(`Unknown option '${option}'`);
	    }
	    if (typeof wrapOptions[option] !== typeof DEFAULT_WRAP_OPTIONS[option]) {
	      throw new TypeError(`Unsupported type '${typeof wrapOptions[option]}' for option '${option}'`);
	    }
	  });

      // If an option isn't specified, use the default
      wrapOptions = Object.assign({}, DEFAULT_WRAP_OPTIONS, wrapOptions);

      if (shell.hasOwnProperty(name)) {
	    throw new Error(`Command \`${name}\` already exists`);
	  }

      if (wrapOptions.pipeOnly) {
	    wrapOptions.canReceivePipe = true;
	    shellMethods[name] = wrap(name, implementation, wrapOptions);
	  } else {
	    shell[name] = wrap(name, implementation, wrapOptions);
	  }

      if (wrapOptions.canReceivePipe) {
	    pipeMethods.push(name);
	  }
    }
	_register._register = _register$1;
	return _register;
}

let hasRequiredCommon;

// ==> Common () {
function requireCommon () {
	if (hasRequiredCommon) return common$2.exports;
	hasRequiredCommon = 1;
	((module, exports) => {
      // Ignore warning about 'new String()' and use of the Buffer constructor
      /* eslint no-new-wrappers: "off",
         no-buffer-constructor: "off" */


      //
      // ShellJS
      // Unix shell commands on top of Node's API
      //
      // Copyright (c) 2012 Artur Adib
      // http://github.com/shelljs/shelljs
      //

      const common = {};
      const shell = {};
      exports.shell = shell;
      //@
      //@ All commands run synchronously, unless otherwise stated.
      //@ All commands accept standard bash globbing characters (`*`, `?`, etc.),
      //@ compatible with the [node `glob` module](https://github.com/isaacs/node-glob).
      //@
      //@ For less-commonly used commands and features, please check out our [wiki
      //@ page](https://github.com/shelljs/shelljs/wiki).
      //@

      // Include the docs for all the default commands
      //@commands

      // Load all default commands

      requireCat();
      requireCd();
      requireChmod();
      // TODO(nfischer): uncomment this when shell.cmd() is finished.
      // 'cmd',
      requireCp();
      requireDirs();
      requireEcho();
      requireExec();
      requireFind();
      requireGrep();
      requireHead();
      requireLn();
      requireLs();
      requireMkdir();
      requireMv();
      requirePwd();
      requireRm();
      requireSed();
      requireSet();
      requireSort();
      requireTail();
      requireTempdir();
      requireTest();
      requireTo();
      requireToEnd();
      requireTouch();
      requireUniq();
      requireWhich();


      //@
      //@ ### exit(code)
      //@
      //@ Exits the current process with the given exit `code`.
      shell.exit = function exit(code) {
        common.state.error = null;
        common.state.errorCode = 0;
        if (code) {
          common.error('exit', {
            continue: true,
            code,
            prefix: '',
            silent: true,
            fatal: false,
          });
          process.exit(code);
        } else {
          process.exit();
        }
      };

      //@include ./src/error.js
      shell.error = require$$27;

      //@include ./src/errorCode.js
      shell.errorCode = require$$28;

      //@include ./src/common.js
      shell.ShellString = common.ShellString;

      //@
      //@ ### env['VAR_NAME']
      //@
      //@ Object containing environment variables (both getter and setter). Shortcut
      //@ to `process.env`.
      shell.env = process.env;

      //@
      //@ ### Pipes
      //@
      //@ Examples:
      //@
      //@ ```javascript
      //@ grep('foo', 'file1.txt', 'file2.txt').sed(/o/g, 'a').to('output.txt');
      //@ echo('files with o\'s in the name:\n' + ls().grep('o'));
      //@ cat('test.js').exec('node'); // pipe to exec() call
      //@ ```
      //@
      //@ Commands can send their output to another command in a pipe-like fashion.
      //@ `sed`, `grep`, `cat`, `exec`, `to`, and `toEnd` can appear on the right-hand
      //@ side of a pipe. Pipes can be chained.

      //@
      //@ ## Configuration
      //@

      shell.config = common.config;

      //@
      //@ ### config.silent
      //@
      //@ Example:
      //@
      //@ ```javascript
      //@ var sh = require('shelljs');
      //@ var silentState = sh.config.silent; // save old silent state
      //@ sh.config.silent = true;
      //@ /* ... */
      //@ sh.config.silent = silentState; // restore old silent state
      //@ ```
      //@
      //@ Suppresses all command output if `true`, except for `echo()` calls.
      //@ Default is `false`.

      //@
      //@ ### config.fatal
      //@
      //@ Example:
      //@
      //@ ```javascript
      //@ require('shelljs/global');
      //@ config.fatal = true; // or set('-e');
      //@ cp('this_file_does_not_exist', '/dev/null'); // throws Error here
      //@ /* more commands... */
      //@ ```
      //@
      //@ If `true`, the script will throw a Javascript error when any shell.js
      //@ command encounters an error. Default is `false`. This is analogous to
      //@ Bash's `set -e`.

      //@
      //@ ### config.verbose
      //@
      //@ Example:
      //@
      //@ ```javascript
      //@ config.verbose = true; // or set('-v');
      //@ cd('dir/');
      //@ rm('-rf', 'foo.txt', 'bar.txt');
      //@ exec('echo hello');
      //@ ```
      //@
      //@ Will print each command as follows:
      //@
      //@ ```
      //@ cd dir/
      //@ rm -rf foo.txt bar.txt
      //@ exec echo hello
      //@ ```

      //@
      //@ ### config.globOptions (deprecated)
      //@
      //@ **Deprecated**: we recommend that you do not edit `config.globOptions`.
      //@ Support for this configuration option may be changed or removed in a future
      //@ ShellJS release.
      //@
      //@ Example:
      //@
      //@ ```javascript
      //@ config.globOptions = {nodir: true};
      //@ ```
      //@
      //@ `config.globOptions` changes how ShellJS expands glob (wildcard)
      //@ expressions. See
      //@ [node-glob](https://github.com/isaacs/node-glob?tab=readme-ov-file#options)
      //@ for available options. Be aware that modifying `config.globOptions` **may
      //@ break ShellJS functionality.**

      //@
      //@ ### config.reset()
      //@
      //@ Example:
      //@
      //@ ```javascript
      //@ var shell = require('shelljs');
      //@ // Make changes to shell.config, and do stuff...
      //@ /* ... */
      //@ shell.config.reset(); // reset to original state
      //@ // Do more stuff, but with original settings
      //@ /* ... */
      //@ ```
      //@
      //@ Reset `shell.config` to the defaults:
      //@
      //@ ```javascript
      //@ {
      //@   fatal: false,
      //@   globOptions: {},
      //@   maxdepth: 255,
      //@   noglob: false,
      //@   silent: false,
      //@   verbose: false,
      //@ }
      //@ ```

      const os = require$$0;
      const fs = require$$1;
      const glob = requireGlob();
      const { _register } = require_register();

      const shellMethods = Object.create(shell);
      exports.shellMethods = shellMethods;

      common.extend = Object.assign;

      // Check if we're running under electron
      const isElectron = Boolean(process.versions.electron);

      // Module globals (assume no execPath by default)
      const DEFAULT_CONFIG = {
        fatal: false,
        globOptions: {},
        maxdepth: 255,
        noglob: false,
        silent: false,
        verbose: false,
        execPath: null,
        bufLength: 64 * 1024, // 64KB
      };

      const config = {
        reset() {
          Object.assign(this, DEFAULT_CONFIG);
          if (!isElectron) {
            this.execPath = process.execPath;
          }
        },
        resetForTesting() {
          this.reset();
          this.silent = true;
        },
      };

      config.reset();
      common.config = config;

      // Note: commands should generally consider these as read-only values.
      const state = {
        error: null,
        errorCode: 0,
        currentCmd: 'shell.js',
      };
      common.state = state;

      delete process.env.OLDPWD; // initially, there's no previous directory

      // Reliably test if something is any sort of javascript object
      function isObject(a) {
        return typeof a === 'object' && a !== null;
      }
      common.isObject = isObject;

      function log(...args) {
        /* istanbul ignore next */
        if (!config.silent) {
          console.error(...args);
        }
      }
      common.log = log;

      // Converts strings to be equivalent across all platforms. Primarily responsible
      // for making sure we use '/' instead of '\' as path separators, but this may be
      // expanded in the future if necessary
      function convertErrorOutput(msg) {
        if (typeof msg !== 'string') {
          throw new TypeError('input must be a string');
        }
        return msg.replace(/\\/g, '/');
      }
      common.convertErrorOutput = convertErrorOutput;

      // An exception class to help propagate command errors (e.g., non-zero exit
      // status) up to the top-level. {@param value} should be a ShellString.
      class CommandError extends Error {
        constructor(value) {
		  this.returnValue = value;
		}
      }

      common.CommandError = CommandError; // visible for testing

      // Shows error message. Throws if fatal is true (defaults to config.fatal, overridable with options.fatal)
      function error(msg, _code, options) {
        // Validate input
        if (typeof msg !== 'string') throw new Error('msg must be a string');

        const DEFAULT_OPTIONS = {
          continue: false,
          code: 1,
          prefix: `${state.currentCmd}: `,
          silent: false,
          fatal: config.fatal,
        };

        if (typeof _code === 'number' && isObject(options)) {
          options.code = _code;
        } else if (isObject(_code)) { // no 'code'
          options = _code;
        } else if (typeof _code === 'number') { // no 'options'
          options = { code: _code };
        } else if (typeof _code !== 'number') { // only 'msg'
          options = {};
        }
        options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (!state.errorCode) state.errorCode = options.code;

        const logEntry = convertErrorOutput(options.prefix + msg);
        state.error = state.error ? `${state.error}\n` : '';
        state.error += logEntry;

        // Throw an error, or log the entry
        if (options.fatal) throw new Error(logEntry);
        if (msg.length > 0 && !options.silent) log(logEntry);

        if (!options.continue) {
          throw new CommandError(new ShellString('', state.error, state.errorCode));
        }
      }
      common.error = error;

      //@
      //@ ### ShellString(str)
      //@
      //@ Examples:
      //@
      //@ ```javascript
      //@ var foo = new ShellString('hello world');
      //@ ```
      //@
      //@ This is a dedicated type returned by most ShellJS methods, which wraps a
      //@ string (or array) value. This has all the string (or array) methods, but
      //@ also exposes extra methods: [`.to()`](#shellstringprototypetofile),
      //@ [`.toEnd()`](#shellstringprototypetoendfile), and all the pipe-able methods
      //@ (ex. `.cat()`, `.grep()`, etc.). This can be easily converted into a string
      //@ by calling `.toString()`.
      //@
      //@ This type also exposes the corresponding command's stdout, stderr, and
      //@ return status code via the `.stdout` (string), `.stderr` (string), and
      //@ `.code` (number) properties respectively.
      function ShellString(stdout, stderr, code) {
        let that;
        if (stdout instanceof Array) {
          that = stdout;
          that.stdout = stdout.join('\n');
          if (stdout.length > 0) that.stdout += '\n';
        } else {
          that = new String(stdout);
          that.stdout = stdout;
        }
        that.stderr = stderr;
        that.code = code;
        // A list of all commands that can appear on the right-hand side of a pipe
        // (populated by calls to common.wrap())
        pipeMethods.forEach(cmd => {
          that[cmd] = shellMethods[cmd].bind(that);
        });
        return that;
      }

      common.ShellString = ShellString;

      // Returns {'alice': true, 'bob': false} when passed a string and dictionary as follows:
      //   parseOptions('-a', {'a':'alice', 'b':'bob'});
      // Returns {'reference': 'string-value', 'bob': false} when passed two dictionaries of the form:
      //   parseOptions({'-r': 'string-value'}, {'r':'reference', 'b':'bob'});
      // Throws an error when passed a string that does not start with '-':
      //   parseOptions('a', {'a':'alice'}); // throws
      function parseOptions(opt, map, errorOptions = {}) {
        // Validate input
        if (typeof opt !== 'string' && !isObject(opt)) {
          throw new TypeError('options must be strings or key-value pairs');
        } else if (!isObject(map)) {
          throw new TypeError('parseOptions() internal error: map must be an object');
        } else if (!isObject(errorOptions)) {
          throw new TypeError(
              'parseOptions() internal error: errorOptions must be object'
          );
        }

        if (opt === '--') {
          // This means there are no options.
          return {};
        }

        // All options are false by default
        const options = {};
        Object.keys(map).forEach(letter => {
          const optName = map[letter];
          if (optName[0] !== '!') {
            options[optName] = false;
          }
        });

        if (opt === '') return options; // defaults

        if (typeof opt === 'string') {
          if (opt[0] !== '-') {
            throw new Error("Options string must start with a '-'");
          }

          // e.g. chars = ['R', 'f']
          const chars = opt.slice(1).split('');

          chars.forEach(c => {
            if (c in map) {
              const optionName = map[c];
              if (optionName[0] === '!') {
                options[optionName.slice(1)] = false;
              } else {
                options[optionName] = true;
              }
            } else {
              error(`option not recognized: ${c}`, errorOptions);
            }
          });
        } else { // opt is an Object
          Object.keys(opt).forEach(key => {
            if (key[0] === '-') {
              // key is a string of the form '-r', '-d', etc.
              const c = key[1];
              if (c in map) {
                const optionName = map[c];
                options[optionName] = opt[key]; // assign the given value
              } else {
                error(`option not recognized: ${c}`, errorOptions);
              }
            } else if (key in options) {
              // key is a "long option", so it should be the same
              options[key] = opt[key];
            } else {
              error(`option not recognized: {${key}:...}`, errorOptions);
            }
          });
        }
        return options;
      }
      common.parseOptions = parseOptions;

      function globOptions() {
        // TODO(nfischer): if this changes glob implementation in the future, convert
        // options back to node-glob's option format for backward compatibility.
        return config.globOptions;
      }

      // Expands wildcards with matching (ie. existing) file names.
      // For example:
      //   expand(['file*.js']) = ['file1.js', 'file2.js', ...]
      //   (if the files 'file1.js', 'file2.js', etc, exist in the current dir)
      function expand(list) {
        if (!Array.isArray(list)) {
          throw new TypeError('must be an array');
        }
        let expanded = [];
        list.forEach(listEl => {
          // Don't expand non-strings
          if (typeof listEl !== 'string') {
            expanded.push(listEl);
          } else {
            let ret;
            try {
              ret = glob.sync(listEl, globOptions());
              // if nothing matched, interpret the string literally
              ret = ret.length > 0 ? ret : [listEl];
            } catch (e) {
              // if glob fails, interpret the string literally
              ret = [listEl];
            }
            expanded = expanded.concat(ret);
          }
        });
        return expanded;
      }
      common.expand = expand;

      // Normalizes Buffer creation, using Buffer.alloc if possible.
      // Also provides a good default buffer length for most use cases.
      const buffer = typeof Buffer.alloc === 'function' ?
        len => {
          return Buffer.alloc(len || config.bufLength);
        } :
        len => {
          return new Buffer(len || config.bufLength);
        };
      common.buffer = buffer;

      // Normalizes _unlinkSync() across platforms to match Unix behavior, i.e.
      // file can be unlinked even if it's read-only, see https://github.com/joyent/node/issues/3006
      function unlinkSync(file) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          // Try to override file permission
          /* istanbul ignore next */
          if (e.code === 'EPERM') {
            fs.chmodSync(file, '0666');
            fs.unlinkSync(file);
          } else {
            throw e;
          }
        }
      }
      common.unlinkSync = unlinkSync;

      // wrappers around common.statFollowLinks and common.statNoFollowLinks that clarify intent
      // and improve readability
      function statFollowLinks(...args) {
        return fs.statSync(...args);
      }
      common.statFollowLinks = statFollowLinks;

      function statNoFollowLinks(...args) {
        return fs.lstatSync(...args);
      }
      common.statNoFollowLinks = statNoFollowLinks;

      // e.g. 'shelljs_a5f185d0443ca...'
      function randomFileName() {
        function randomHash(count) {
          if (count === 1) {
            return parseInt(16 * Math.random(), 10).toString(16);
          }
          let hash = '';
          for (let i = 0; i < count; i++) {
            hash += randomHash(1);
          }
          return hash;
        }

        return `shelljs_${randomHash(20)}`;
      }
      common.randomFileName = randomFileName;

      // Common wrapper for all Unix-like commands that performs glob expansion,
      // command-logging, and other nice things
      function wrap(cmd, fn, options = {}) {
        return function () {
          let retValue = null;

          state.currentCmd = cmd;
          state.error = null;
          state.errorCode = 0;

          try {
            let args = [].slice.call(arguments, 0);

            // Log the command to stderr, if appropriate
            if (config.verbose) {
              console.error(...[cmd].concat(args));
            }

            // If this is coming from a pipe, let's set the pipedValue (otherwise, set
            // it to the empty string)
            state.pipedValue = (this && typeof this.stdout === 'string') ? this.stdout : '';

            if (options.unix === false) { // this branch is for exec()
              retValue = fn.apply(this, args);
            } else { // and this branch is for everything else
              if (isObject(args[0]) && args[0].constructor.name === 'Object') {
                // a no-op, allowing the syntax `touch({'-r': file}, ...)`
              } else if (args.length === 0 || typeof args[0] !== 'string' || args[0].length <= 1 || args[0][0] !== '-') {
                args.unshift(''); // only add dummy option if '-option' not already present
              }

              // flatten out arrays that are arguments, to make the syntax:
              //    `cp([file1, file2, file3], dest);`
              // equivalent to:
              //    `cp(file1, file2, file3, dest);`
              args = args.reduce((accum, cur) => {
                if (Array.isArray(cur)) {
                  return accum.concat(cur);
                }
                accum.push(cur);
                return accum;
              }, []);

              // Convert ShellStrings (basically just String objects) to regular strings
              args = args.map(arg => {
                if (isObject(arg) && arg.constructor.name === 'String') {
                  return arg.toString();
                }
                return arg;
              });

              // Expand the '~' if appropriate
              const homeDir = os.homedir();
              args = args.map(arg => {
                if (typeof arg === 'string' && arg.slice(0, 2) === '~/' || arg === '~') {
                  return arg.replace(/^~/, homeDir);
                }
                return arg;
              });

              // Perform glob-expansion on all arguments after globStart, but preserve
              // the arguments before it (like regexes for sed and grep)
              if (!config.noglob && options.allowGlobbing === true) {
                args = args.slice(0, options.globStart).concat(expand(args.slice(options.globStart)));
              }

              try {
                // parse options if options are provided
                if (isObject(options.cmdOptions)) {
                  args[0] = parseOptions(args[0], options.cmdOptions);
                }

                retValue = fn.apply(this, args);
              } catch (e) {
                /* istanbul ignore else */
                if (e instanceof CommandError) {
                  retValue = e.returnValue;
                } else {
                  throw e; // this is probably a bug that should be thrown up the call stack
                }
              }
            }
          } catch (e) {
            /* istanbul ignore next */
            if (!state.error) {
              // If state.error hasn't been set it's an error thrown by Node, not us - probably a bug...
              e.name = 'ShellJSInternalError';
              throw e;
            }
            if (config.fatal || options.handlesFatalDynamically) throw e;
          }

          if (options.wrapOutput &&
              (typeof retValue === 'string' || Array.isArray(retValue))) {
            retValue = new ShellString(retValue, state.error, state.errorCode);
          }

          state.currentCmd = 'shell.js';
          return retValue;
        };
      } // wrap
      exports.wrap = wrap;
      common.wrap = wrap;

      // This returns all the input that is piped into the current command (or the
      // empty string, if this isn't on the right-hand side of a pipe
      function _readFromPipe() {
        return state.pipedValue;
      }
      common.readFromPipe = _readFromPipe;

      const DEFAULT_WRAP_OPTIONS = {
        allowGlobbing: true,
        canReceivePipe: false,
        cmdOptions: null,
        globStart: 1,
        handlesFatalDynamically: false,
        pipeOnly: false,
        wrapOutput: true,
        unix: true,
      };
      exports.DEFAULT_WRAP_OPTIONS = DEFAULT_WRAP_OPTIONS;

      // This is populated during plugin registration
      var pipeMethods = [];
      exports.pipeMethods = pipeMethods;

      common.register = _register;
      module.exports = common;
    })(common$2, common$2.exports);
	return common$2.exports;
}

const commonExports = requireCommon();
const common = /*@__PURE__*/getDefaultExportFromCjs(commonExports);
export const { shell } = commonExports;
export { common as default };

export const plugin = {
	error,        // For signaling errors from within commands
	parseOptions, // For custom option parsing
	readFromPipe, // For commands with the .canReceivePipe attribute
	register,     // For registering plugins
} = common;
