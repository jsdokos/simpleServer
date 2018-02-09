"use strict";

// PORT definition
const PORT = 3000;

// Import the HTTP library
const http = require('http');

// Import the fs library 
const fs = require('fs');

const path2 = require('path');

const cache = {};
cache['openhouse.html'] = fs.readFileSync('public/openhouse.html');
cache['openhouse.css'] = fs.readFileSync('public/openhouse.css');
cache['openhouse.js'] = fs.readFileSync('public/openhouse.js');

function serveIndex(path, res, req) {
    fs.readdir(path, function(err, files)
    {
        if(err) 
        {
            console.error(err);
            res.statusCode = 500;
            res.end("Server Error");
        }
        var indexExists = false;
        for(let test of files)
        {
            console.log("Test: " + test);
            if (test === 'index.html')
            {
                console.log("Success!!: " + test);
                serveFile(path2.join('public' + req.url + '/' + test), res);
                indexExists = true;
            }
        }
        if (!indexExists)
        {
            var html = "<p>Index of " + path + "</p>";
            html += "<ul>";
            html += files.map(function(item)
            {            
                if (path === '/')
                {
                    return "<li><a href='" + item + "'>" + item + 
                "</a></li>";
                }
                else
                {
                    return "<li><a href='" + path2.join(req.url + '/' + item) + "'>" + item + 
                "</a></li>";
                }
            }).join("");
            html += "</ul>";
            res.end(html);
        }
    });
}

/** @function serveFile
 * Serves the specified file with the provided response object
 * @param {string} path - specifies the file path to read 
 * @param {http.serverResponse} res - the http response object
 */
function serveFile(path, res) {
    fs.readFile(path, function(err, data) 
    {
        if(err) 
        {
          console.error(err);
          res.statusCode = 500;
          res.end("Server Error: Could not read file");
          return;
        }
        res.setHeader('Content-Type',findExtension(path));
        res.end(data);
        
    });
}

function findExtension(path)
{
    switch (path2.extname(path))
    {
        case '.html':
            return "text/html";
            break;
        case '.css':
            return "text/css";
            break;
        case '.js':
            return "text/js";
            break;
        case '.jpeg':
        case '.jpg':
            return "image/jpeg";
            break;
        case '.png':
            return "image/png";
            break;
        default:
            return "";
    }
}

/** @function handleRequest 
 * Request handler for our http server 
 * @param {http.ClientRequest} req - the http request object
 * @param {http.ServerResponse} res - the http response object
 */
function handleRequest(req, res) 
{
    fs.stat('public' + req.url, function(err, stats)
    {
        if (err) 
        {
            res.statusCode = 404;
            res.end("File Not Found");
            return;
        }

       if (stats.isDirectory())
       {
           
            console.log("Folder of " + req.url);
            serveIndex(path2.join('public' + req.url), res, req);
       }
       
       if (stats.isFile())
       {
            console.log(req.url);
            serveFile(path2.join('public' + req.url), res);
       }
    });
    

}

// Create the web server
var server = http.createServer(handleRequest);

// Start listening on port PORT
server.listen(PORT, function(){
    console.log("Listening on port " + PORT);
});