var http = require('http'), 
    url = require('url'),
    fs = require('fs'),
    sys = require('sys'),
    path = require('path'),
    client = require('./lib/redis-client').createClient(),
    router = require('./lib/node-router'),
    server = router.getServer(),
    mustache = require('./lib/mustache');

var hostname = "http://scotty.tomusher.com/";

function get_user_url(user, callback) { 
    client.exists(user, function(err, value) {
        if(err) throw err;
        if(value==1) {
            client.get(user, callback);
        } else {
            callback(new Error("No URL for user", null));
        }
    });
}


function get(req, res, user) {
    var view = {content: ""};
    get_user_url(user, function(err, value) {
        if(err) {
            view.content = "No user set";
            render_with(res, 'base.html', view, output_to);
        } else {
            res.writeHead(302, {"Location": value});
            res.end();
        }
    });
}

function set(req, res, user, url) {
    var isUrl = new RegExp('^((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))');
    res.writeHead(200, {"Content-Type": "text/plain"});
    url = decodeURIComponent(url);
    var view = {content: ""};
    if(isUrl.test(url)) {
        client.set(user, url, function(err, value) {
            if(value) {
                view.status = 'Saved!';
            } else {
                view.status = error;
            }
        });
    } else {
        view.status = 'Invalid address';
    }
    render_with(res, 'panel.html', view, output_to);
}

function user(req, res, user) {
    get_user_url(user, function(err, value) {
        var view = {username: user};
        view.url = value;
        render_with(res, 'user.html', view, function(res, output) {
            view = {content: output};
            render_with(res, 'base.html', view, output_to);
        });
    });
}

function panel(req, res, user, url) {
    var view = {get_link: hostname + user + "/get",
                set_link: hostname + user + "/set/" + url}
    render_with(res, 'panel.html', view, output_to);
}

function home(req, res) {
    var parsed_url = url.parse(req.url, true);
    if (parsed_url.query && parsed_url.query.username) {
        redirect_to(res, parsed_url.query.username);
    }    
    var view = {};
    render_with(res, 'home.html', view, function(res, output) {
        view = {content: output};
        render_with(res, 'base.html', view, output_to);
    });
}

function render_with(res, template, context, callback) {
    fs.readFile(__dirname + '/templates/' + template, function(err, template) {
        if (err) throw err;
        callback(res, mustache.to_html(template.toString(), context));
    });
}

function output_to(res, content) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(content);
    res.end();
}

function redirect_to(res, location) {
    res.writeHead(302, {"Location": location});
    res.end();
}


server.get(new RegExp("^/(\\w+)/set/(.*)$"), set);
server.get(new RegExp("^/(\\w+)/get$"), get);
server.get(new RegExp("^/(\\w+)/panel/(.*)?$"), panel);
server.get(new RegExp("^/(\\w+)/?$"), user);
server.get(new RegExp("^/$"), home);
server.post(new RegExp("^/$"), home);
server.get(new RegExp("^(\/.+\.(js|css|png|jpg|ico))$"), router.staticDirHandler(__dirname + "/static"));

server.listen(8080);

