var fs_ = require('level-fs-browser');
var path = require('path');
var nextTick = require('next-tick');

module.exports = function () {
    var keys = Object.keys(Object.getPrototypeOf(fs_));
    var fs = keys.reduce(function (acc, key) {
        acc[key] = function () { return fs_[key].apply(fs_, arguments) };
        return acc;
    }, {});
    
    var charDevs = {};
    var charDirs = {};
    
    fs._addCharDev = function (file, dev) {
        charDevs[file] = dev;
        var dir = path.dirname(file);
        if (!charDirs[dir]) charDirs[dir] = [];
        charDirs[dir].push(path.basename(file));
    };
    
    fs.readdir = function (dir, cb) {
        fs_.readdir(dir, function (err, files) {
            if (err) return cb(err)
            if (charDirs[dir]) files.push.apply(files, charDirs[dir]);
            cb(err, files);
        });
    };
    
    fs.exists = function (file, cb) {
        if (charDevs[file]) {
            nextTick(function () { cb(true) });
        }
        else fs_.exists(file, cb);
    };
    
    fs.createReadStream = function (file, opts) {
        if (charDevs[file] && charDevs[file].write) {
            return charDevs[file].write(opts);
        }
        return fs_.createReadStream(file, opts);
    };
    
    fs.createWriteStream = function (file, opts) {
        if (charDevs[file] && charDevs[file].read) {
            return charDevs[file].read(opts);
        }
        return fs_.createWriteStream(file, opts);
    };
    
    fs.stat = function (file, cb) {
        fs_.stat.call(fs_, file, function (err, stat) {
            if (stat && charDevs[file]) {
                stat.isCharacterDevice = function () { return true };
            }
            cb(err, stat);
        });
    };
    
    return fs;
};
