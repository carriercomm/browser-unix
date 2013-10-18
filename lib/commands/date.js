var strftime = require('strftime');
var resumer = require('resumer');
var minimist = require('minimist');

module.exports = function (fs, args, opts) {
    var tr = resumer();
    var argv = minimist(args);
    var date, tz;
    if (/^TZ=/.test(argv.date)) {
        var m = argv.date.match(
            /^TZ='((?:\\'|[^'])+)'|^TZ="((?:\\"|[^"])+)"|TZ=((?:\\\s|[^\s])+)/
        );
        tz = m[1] || m[2] || m[3];
        date = argv.date.slice(tz.length).replace(/^\s+/, '');
    }
    else {
        date = argv.date ? new Date(argv.date) : new Date;
    }
    if (!tz) tz = opts.env.TZ;
    // TODO: timezones
    
    var format = '%c %T %Z %Y';
    for (var i = 0; i < argv._.length; i++) {
        if (/^\+/.test(argv._[i])) {
            format = argv._[i].replace(/^\+/, '');
            break;
        }
    }
    format = format.replace(/(^|[^%])%c/g, '%a %b %_d');
    tr.queue(strftime(format, date) + '\n');
    tr.queue(null);
    return tr;
};
