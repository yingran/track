var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    path = require("path"),
    yui = require("yui"),
    uglifyJS = require("uglify-js"),
    config = require("./yui-builder-config");


var port = config.port,
    Y = yui.YUI(),
    yuiModules = yui.YUI.Env[Y.version].modules,
    yuiCore = yui.YUI.Env.core,
    parsed = {};

var server = http.createServer(function (req, res){
    var hostname = /[^:]+/g.exec(req.headers.host)[0],
        pathname = url.parse(req.url).pathname,
        directory = config.hosts[hostname],
        basepath = config.path + directory + "/";
    if (/\.js/g.test(pathname)){
        res.writeHead(200, "OK");
        try {
            readConf(hostname, basepath, pathname, req, res);
        } catch (err){
            writeError("error:" + err.message, res);
        }
    } else {
        res.writeHead(200, "OK");
        res.write(fs.readFileSync(config.path + "lib/404.html", "utf8"));
        res.end();
    }
    
});


function readConf(hostname, basepath, pathname, req, res){
    var match, project, filename, confpath, devpath, minpath, temp;
    match = pathname.match(/.*\/([^/]+)\/([^/]+\.js)/gi);
    match = /.*\/([^/]+)\/([^/]+\.js)/gi.exec(pathname);
    if (match&&match[0]){
        project = match[1];
        filename =match[2];
        devpath = basepath + project + "/js/dev/";
        confpath = devpath + "conf/" + filename;
        minpath = basepath + project + "/js/min/";
        path.exists(confpath, function(isExists){
            var conf=[], requires=[], yuiRequires=[], r1, r2, i, j, len, len2, fname, data=[], taskData=[], yuiData={js:"", css:""}, compressed;
            if (isExists){
                try {
                    conf = JSON.parse(fs.readFileSync(confpath, "utf8"));
                } catch(err){
                    writeError("error:" + err.message, res);
                }
                len = conf.length;
                yuiRequires = yuiRequires.concat(yuiCore);
                for (i=0; i<len; i++){
                    r1 = getModule("task/" + conf[i], devpath, res);
                    r2 = [];
                    len2 = r1.length;
                    for (j=0; j<len2; j++){
                        if (yuiModules[r1[j]] && yuiRequires.indexOf(r1[j]) < 0){
                            yuiRequires.push(r1[j]);
                        } else if (!yuiModules[r1[j]] && requires.indexOf(r1[j])<0){
                            r2.push(r1[j]);
                        }
                    }
                    requires = requires.concat(r2);
                    temp = devpath + "task/" + conf[i];
                    if (path.existsSync(temp)){
                        taskData.push(fs.readFileSync(temp, "utf8"));
                    } else {
                        writeError("[error 68]none file:task/" + conf[i], res);
                    }
                }
                res.writeHead(200, "OK");
                /*
                yuiData = getYuiModules(yuiRequires);
                if (yuiData.css){
                    data.push(getYuiCss(yuiData.css, hostname, project, minpath, filename));
                }
                */
                data.push(yuiData.js);
                len = requires.length;
                for (i=0; i<len; i++){
                    fname = requires[i].trim();
                    temp = devpath + parsePath(fname) + ".js";
                    if (path.existsSync(temp)){
                        data.push(fs.readFileSync(temp, "utf8"));
                    } else {
                        writeError("[error 85]none file:" + pathname, res);
                    }
                }
                data = data.concat(taskData).join('\n');
                compressed = compress(data);
                if (/[?&]c=1/gi.test(url.parse(req.url).search)){
                    data = compressed;
                }
                if (!fs.existsSync(minpath)) {
                    fs.mkdirSync(minpath);
                }
                fs.writeFile((minpath + '/' + filename), compressed);
                res.write(data, "utf8");
                res.end();
            } else {
                writeError("[error 100]none file:" + pathname, res);
            }
        });
    } else {
        writeError("[error 104]none file:" + pathname, res);
    }
}

function getModule(mname, devpath, res){
    mname = mname.trim();
    if (yuiModules[mname]){
        return [];
    }
    if (mname&&parsed[mname]){
        return parsed[mname];
    }
    var filepath, file, match, moudles, i, j, len, len1, len2,
        requires = [], temp, temp1, index;
    try{

        if (/\w+\.js/gi.test(mname)){
            filepath = devpath + mname;
        } else {
            filepath = devpath + parsePath(mname) + ".js";
        }
        file = fs.readFileSync(filepath, "utf8");
        
        match = file.match(/requires:\[[^\]]+\]/g)||[];
        match = match.concat(file.match(/\.use\([\w'"\.,\- ]+, *function/g)||[]);
        if (match.length == 0){
            return [];
        }
        len1 = match.length;
        
        for (i=0; i<len1; i++){
            var temp = match[i].replace(/requires:\[(.+)\]/gi, '$1').replace(/\.use\(([\w'",\.\- ]+), *function/g, '$1').replace(/[\'\"]/gi, '').split(/\s*,\s*/g);
            len2 = temp.length;
            for (j=0; j<len2; j++){
                if (requires.indexOf(temp[j])<0 && mname!=temp[j]){
                    requires.push(temp[j]);
                }
            }
        }        
        
        len1 = requires.length;
        temp = [];
        for (i=0; i<len1; i++){
            temp2 = getModule(requires[i], devpath, res);
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
        writeError("error:" + err.message, res);
    }

    return requires;
}

function getYuiModules(yuiRequires){

    var loader = new Y.Loader({
        base: path.join(__dirname, "./node_modules/yui/"),
        ignoreRegistered: true,
        require: yuiRequires
    });
    
    var out = loader.resolve(true),
        str1 = [], str2 = [];

    out.js.forEach(function(file) {
        str1.push(fs.readFileSync(file, "utf8"));
    });
    
    out.css.forEach(function(file) {
        str2.push(fs.readFileSync(file, "utf8"));
    });
    
    return {"js": str1.join("\n"), "css": str2.join("\n")};
}

/*
function getYuiCss(str, hostname, project, minpath, filename){

    var filename = filename.replace(/\.js$/g, '.css'),
        url = "http://" + hostname + "/" + project + "/js/min/" + filename,
        code = "";
    fs.writeFileSync((minpath + '/' + filename), str);

    code = [
        "(function(){",
            "var head = document.getElementsByTagName(\"head\")[0];",
            "var css = document.createElement(\"link\");",
            "css.rel=\"stylesheet\";",
            "css.href = \"" + url + "\";",
            "head.appendChild(css);",
        "})();"
    ].join("");

    return code;
}
*/

function writeError(msg, res){
    res.writeHead(200, "OK");
    res.write(msg, "utf8");
    res.end();
}

function compress(orig_code){
    var result;
    try{
        result = uglifyJS.minify(orig_code, {fromString: true});
    }catch(err){
        result = {"code": err.message};
    }
    return result.code;
}

function parsePath(mname){
    var list = mname.split(".");
    //list.unshift("module");
    return list.join("/");
}

server.listen(port);