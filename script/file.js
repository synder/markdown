/**
 * Created by synder on 16/6/15.
 */

const fs = require('fs');
const path = require('path');
const async = require('async');

var traverseDir = function(dir, handler){

    var files = fs.readdirSync(dir);

    files.forEach(function (file) {
        var tmpPath = path.join(dir, file);

        if(fs.statSync(tmpPath).isDirectory()){
            traverseDir(tmpPath, handler);
        }else{
            handler(null, tmpPath);
        }
    });

};

var readFile = function (file, options, callback) {
    fs.readFile.apply(fs, arguments);
};

var readFiles = function (files, options, callback) {

    var taskCount = 0;
    var flag = 0;

    var results = {};
    var error = null;

    var readFile = function (path, key) {
        fs.readFile(path, options, function (err, content) {
            flag++;

            if (err) {
                error = err;
            } else {
                results[key] = content;
            }

            if (flag >= taskCount) {
                if (error) {
                    return callback(error);
                }

                callback(null, results);
            }
        });
    }

    if (Array.isArray(files)) {

        taskCount = files.length;

        for (var i = 0; i < files.length; i++) {
            readFile(files[i], i);
        }

    } else if (typeof files == 'object') {

        taskCount = Object.getOwnPropertyNames(files).length;

        for (var key in files) {
            readFile(files[key], key);
        }

    } else {
        callback(new Error('files must array | object'));
    }
};

var copyFile = function (src, des, callback) {
    var readStream = fs.createReadStream(src);
    var writeStream = fs.createWriteStream(des);
    if(callback){
        writeStream.on('close', callback);
    }
    readStream.pipe(writeStream);
};

var makeDir = function (dir, opts, func, made) {
    const _0777 = parseInt('0777', 8);
    if (typeof opts === 'function') {
        func = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') {
        opts = {mode: opts};
    }

    var mode = opts.mode;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    var cb = func || function () {
        };
    dir = path.resolve(dir);

    fs.mkdir(dir, mode, function (er) {
        if (!er) {
            made = made || dir;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                makeDir(path.dirname(dir), opts, function (er, made) {
                    if (er) {
                        cb(er, made);
                    } else {
                        makeDir(dir, opts, cb, made);
                    }
                });
                break;
            default:
                fs.stat(dir, function (er2, stat) {
                    if (er2 || !stat.isDirectory()) {
                        cb(er, made)
                    } else {
                        cb(null, made);
                    }
                });
                break;
        }
    });
}

var copyDir = function (src, des, callback) {

    //判断源地址是否存在
    if (!fs.existsSync(src)) {
        return callback &&callback(new Error('src path is not exists'));
    }

    var taskCount = 0;
    var flag = 0;
    var error = null;

    traverseDir(src, function (err, filepath) {

        if(err){
            return callback && callback(err);
        }

        var relativePath = path.relative(src, filepath);
        var desPath = path.join(des, relativePath);
        var desDirPath = path.dirname(desPath);

        makeDir(desDirPath, function (err) {
            if(err){
                return error = err;
            }

            taskCount++;

            copyFile(filepath, desPath, function (err) {
                flag++;
                if(flag >= taskCount){
                    return callback && callback();
                }
            });
        });
    });
};

var saveFile = function (filename, content, callback) {
    fs.writeFile(filename, content, callback);
};


exports.readFile = readFile;
exports.readFiles = readFiles;
exports.copyFile = copyFile;
exports.makeDir = makeDir;
exports.copyDir = copyDir;
exports.saveFile = saveFile;
