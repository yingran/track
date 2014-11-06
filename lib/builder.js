var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn,
    config = require("./builder-config");
    
var port = config.port;
var server = http.createServer(function (req, res){
    try {
        var hostname = /[^:]+/g.exec(req.headers.host)[0],
            pathname = url.parse(req.url).pathname,
            directory = config.hosts[hostname],
            basepath = config.path + directory + "/",
            match = /.*\/([^/]+)\/dist\/(?:js|css)\/([^/]+)\.(?:js|css)/gi.exec(pathname),
            project, filename;
        if (!match || !match[2]){
            writeError('no file:'+pathname, res);
        }
        project = match[1];
        filename = match[2];
        if (hostname = "127.0.0.1") {
            hostname = /\/([^/]+).+/gi.exec(pathname);
            if (hostname && hostname[1]){
                hostname = hostname[1];
                directory = config.hosts[hostname];
                basepath = config.path + directory + "/";
            } else {
                writeError('no file:'+pathname, res);
                res.end();
            }
        }
        basepath = config.path + directory + "/";
        if (/\.js$/g.test(pathname)){
            res.writeHead(200, "OK");
            readJsConf(project, filename, basepath, pathname, req, res);
        } else if (/\.css$/g.test(pathname)) {
            res.writeHead(200, "OK");
            compileLess(basepath, project, filename, res);
        } else {
            res.writeHead(404, "404");
            res.write(fs.readFileSync(config.path + "lib/404.html", "utf8"));
            res.end();
        }
    } catch (e){
        res.writeHead(502, "502");
        res.end();
    }
    
});

function readJsConf(project, filename, basepath, pathname, req, res){
    var match, confpath, devpath, minpath, temppath, temp, compressFn = compressJs;
    match = /.*\/([^/]+)\/dist\/js\/([^/]+)\.js/gi.exec(pathname);
    devpath = basepath + project + "/dev/js/";
    minpath = basepath + project + "/dist/js/";
    temppath = basepath + project + "/temp/";
    confpath = devpath + "conf/" + filename + ".json";
    path.exists(confpath, function(isExists){
        var conf=[], requires=[], r1, r2, i, j, len, len2, fname, data=[], taskData=[], parsed = {},
            uglifyjs;
        if (isExists){
            try {
                conf = JSON.parse(fs.readFileSync(confpath, "utf8"));
                len = conf.length;
                for (i=0; i<len; i++){
                    r1 = getModule("task/" + conf[i], devpath, parsed, res);
                    r2 = [];
                    len2 = r1.length;
                    for (j=0; j<len2; j++){
                        if (requires.indexOf(r1[j])<0){
                            r2.push(r1[j]);
                        }
                    }
                    requires = requires.concat(r2);
                    temp = devpath + "task/" + conf[i];
                    if (path.existsSync(temp)){
                        taskData.push(fs.readFileSync(temp, "utf8"));
                    } else {
                        writeError("no file:" + pathname, res);
                    }
                }
                res.writeHead(200, "OK");
                len = requires.length;
                for (i=0; i<len; i++){
                    fname = requires[i].trim();
                    if (/^\/.+\.(?:js|coffee)$/gi.test(fname)){
                        temp = basepath + fname;
                    } else {
                        temp = devpath + fname;
                    }
                    if (path.existsSync(temp)){
                        data.push(fs.readFileSync(temp, "utf8"));
                    } else {
                        writeError("no file:" + pathname, res);
                    }
                }
                data = data.concat(taskData).join('\n');
                if (!fs.existsSync(minpath)) {
                    fs.mkdirSync(minpath);
                }
                if (!fs.existsSync(temppath)) {
                    fs.mkdirSync(temppath);
                }
                if (conf[0] && /\w+\.coffee/gi.test(conf[0])){
                    compressFn = compileCoffee;
                }
                compressFn(req, data, minpath, temppath, filename, function(){
                    data = fs.readFileSync(temppath + "/" + filename + ".js", "utf8");
                    res.write(data, "utf8");
                    res.end();
                });
            } catch(err){
                writeError("error:" + err.message, res);
            }
        } else {
            writeError('no file:'+pathname, res);
        }
    });
}

function getModule(mname, devpath, parsed, res){
    mname = mname.trim();
    if (mname&&parsed[mname]){
        return parsed[mname];
    }
    var filepath, file, match, moudles, i, j, len, len1, len2,
        requires = [], temp, temp1, index;
    
    if (/^\/.+\.(?:js|coffee)/gi.test(mname)){
        return requires;
    }
    
    try{
        filepath = devpath + mname;
        file = fs.readFileSync(filepath, "utf8");
        
        match = file.match(/ *(?:\/\/)?module from ['"]([^'"]+)['"];/g) || [];
        if (match.length == 0){
            return [];
        }
        len1 = match.length;
        
        for (i=0; i<len1; i++){
            var temp = match[i].replace(/^ *(?:\/\/)?module from ['"]([^'"]+)['"];/g, '$1').split(',');
            len2 = temp.length;
            for (j=0; j<len2; j++){
                if (requires.indexOf(temp[j])<0&&mname!=temp[j]){
                    requires.push(temp[j]);
                }
            }
        }        
        
        len1 = requires.length;
        temp = [];
        for (i=0; i<len1; i++){
            temp2 = getModule(requires[i], devpath, parsed, res);
            len2 = temp.length;
            for (j=len2-1; j>=0; j--){
                index = temp2.indexOf(temp[j]);
                if (index>=0){
                    temp2.splice(index, 1);
                }
            }
            
            temp = temp.concat(temp2);
        }
        

        len2 = temp.length;
        for (j=len2-1; j>=0; j--){
            index = requires.indexOf(temp[j]);
            if (index>=0){
                requires.splice(index, 1);
            }
        }
        

        requires = temp.concat(requires);
        parsed[mname] = requires;
    }catch(err){
        writeError(err.message, res);
    }

    return requires;
}

function compressJs(req, data, minpath, temppath, filename, fn){
    var uglifyjs;
    try {
        fs.writeFile((temppath + "/" + filename + ".js"), data);
        uglifyjs = spawn("uglifyjs", [temppath + "/" + filename + ".js", "-o", minpath + "/" + filename + ".js"]);
        uglifyjs.on('exit', fn);
    } catch (e) {
         writeError("compress js error", res);
    }
}


function compileCoffee(req, data, minpath, temppath, filename, fn){
    var coffee;
    fs.writeFile((temppath + "/" + filename + ".coffee"), data);
    coffee = spawn("coffee", ["-c", temppath + "/" + filename + ".coffee"]);
    coffee.on("exit", function(){
        checkUglify(req, minpath, temppath, filename, fn);
    });
}

function checkUglify(req, minpath, temppath, filename, fn){
    var uglifyjs;
    uglifyjs = spawn("uglifyjs", [temppath + "/" + filename + ".js", "-o", minpath + "/" + filename + ".js"]);
    uglifyjs.on('exit', fn);
}

function compileLess(basepath, project, filename, res){
    var less, data,
        minpath = basepath + project + "/dist/css/",
        devfile = basepath + project + "/dev/css/" + filename + ".less",
        minfile = minpath + filename + ".css";
    try {
        if (!fs.existsSync(devfile)) {
            devfile = basepath + project + "/dev/css/" + filename + ".css";
        }
        if (!fs.existsSync(minpath)) {
            fs.mkdirSync(minpath);
        }
        less = spawn("lessc", [devfile, minfile]);
        less.on("exit", function(){
            data = fs.readFileSync(minfile, "utf8");
            res.write(data, "utf8");
            res.end();
        });
    } catch (e) {
         writeError("compile less error", res);
    }
}

function writeError(msg, res){
    res.writeHead(502, "error");
    res.write(msg, "utf8");
    res.end();
}

server.listen(port);