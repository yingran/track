const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractCSS = new ExtractTextPlugin("style.css?[contentHash]");

module.exports = {
    context: __dirname,
    entry: {
        app: "./src/app.ts"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "build")
    },

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
    },

    module: {
        loaders: [
            { 
                test: /\.less$/, 
                loader: extractCSS.extract("css!csso!less") 
            }, { 
                test: /\.ts?$/, 
                exclude: [ 
                    path.resolve(__dirname, "node_modules")
                ], 
                loader: "ts" 
            }, { 
                test: /\.html?$/, 
                loader: "file?name=[name].html" 
            }, { 
                test: /\.(png|jpg|gif)?$/, 
                loader: "file?name=assets/[name].[ext]?[hash]" 
            }
        ]
    },

    plugins: [
        extractCSS,
        function() {
            this.plugin("done", function(stats){
                let chunks = stats.toJson().chunks,
                    key, file;
                file = fs.readFileSync(path.join(__dirname, "src", "index.html"), "utf8");
                chunks.forEach(function(chunk) {
                    chunk.files.forEach(function(filename){
                        let names = /^([^?]+)\??(.*)$/.exec(filename);
                        let name = filename;
                        if (!names[2]) {
                            name = `${names[1]}?${chunk.hash}`;
                        }
                        file = file.replace(names[1], name);
                    });
                });
                if (!fs.existsSync(path.join(__dirname, "build"))) {
                    fs.mkdirSync(path.join(__dirname, "build"));
                }
                fs.writeFileSync(path.join(__dirname, "build", "index.html"), file, "utf8");
            });
        }
    ],
    
    externals: {
        "three": "THREE",
        "ammo.js": "Ammo",
        "socket.io-client": "io"
    }
};