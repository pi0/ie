// ----------------------------------------------------------------------------------------------
// Home Class
// ----------------------------------------------------------------------------------------------
var Home = function (url) {
    d('Initializing home');
    this.url = url;
    ajax(url, this.parseXML.bind(this));
};

Home.prototype.parseXML = function (xml) {

    xml = dom_tag(xml, 'home');

    // Header
    var header = dom_tag(xml, 'header');
    this.header = {};
    this.header.background = dom_tag_val(header, 'background');
    this.header.pwd = dom_tag_val(header, 'pwd');
    this.header.gameicon = {};
    this.header.gameicon.color = dom_tag_attr(header, 'gameicon', 'color');
    this.header.gameicon.hover = dom_tag_attr(header, 'gameicon', 'hover');
    this.header.gameicon.game_color = dom_tag_attr(header, 'game', 'color');
    this.header.gameicon.game_hover = dom_tag_attr(header, 'game', 'hover');

    // Games
    this.games = {};
    this.games.max = {};
    this.games.max.background = dom_tag_attr(xml, 'games', 'max-onlines-background');
    this.games.max.width = dom_tag_attr(xml, 'games', 'max-onlines-border-width');
    this.games.max.color = dom_tag_attr(xml, 'games', 'max-onlines-border-color');
    this.games.max.style = dom_tag_attr(xml, 'games', 'max-onlines-border-style');

    // Game Items
    this.games.items = {};
    var games = dom_tag(xml, 'games').children;
    for (var i = 0; i < games.length; i++) {
        var g = {};
        g.active = games[i].getAttribute('active') == 'true';
        g.name = dom_tag_val(games[i], 'name');
        g.image = dom_tag_val(games[i], 'image');
        g.url = dom_tag_val(games[i], 'url');
        g.onlines = parseInt(dom_tag_val(games[i], 'onlines'));
        g.text = dom_tag_val(games[i], 'text');
        g.textColor = dom_tag_attr(games[i], 'text', 'color');
        g.textHover = dom_tag_attr(games[i], 'text', 'hover');

        this.games.items[g.name] = g;
    }

    // Show this
    this.show();

};

Home.prototype.show = function () {
    var c = ei('main-container');
    c.innerHTML = "";

    // Pwd & Home
    ei('pwd').innerHTML = 'Home';
    ei('pwd').style.color = this.header.pwd;
    ei('home-icon').style.display = 'none';
    ei('home-icon').onclick = (function () {
        this.show();
    }).bind(this);
    dom_tag(document, 'header').style.backgroundColor = this.header.background;

    // Game Icon
    var gameIcon = ei('games').firstElementChild;
    //setHoverColor(gameIcon, this.header.gameicon.color,this.header.gameicon.hover);

    gameIcon.onclick = function () {
        var active_games = ei('games');
        for (var i = 0; i < active_games.childElementCount; i++) {
            var c = active_games.children[i];
            c.style.display = c.style.display ? null : 'inline';
        }
    };

    var headerItemsInit = ei('games').children.length != 1;

    // Show game items
    var max = 0, maxG;
    for (var game_name in this.games.items) {
        var game = this.games.items[game_name];
        if (game.onlines > max) {
            max = game.onlines;
            maxG = game_name;
        }
        var gameBlock = document.createElement('div');
        var gameImg = document.createElement('div');
        var gi = document.createElement('img');
        var title = document.createElement('p');
        gameImg.appendChild(gi);
        gameBlock.appendChild(gameImg);
        gameBlock.appendChild(title);
        gameBlock.setAttribute('class', 'game-block');
        gameBlock.setAttribute('data-onlines', game.onlines);
        gameBlock.setAttribute('id', game.name + '-block');
        gameBlock.game = game.name;
        gameImg.className = 'game-image-container';
        gi.src = game.image;
        title.innerHTML = game.text;
        //setHoverColor(gameBlock, game.textColor, game.textHover); TODO
        c.appendChild(gameBlock);

        gameBlock.onclick = (function (game) {
            this.play(game.name);
        }).bind(this, game);

        if (!headerItemsInit && game.active) {
            // Add to header
            //setHoverColor(activeItem, this.header.gameicon.game_color,this.header.gameicon.game_hover);
            var activeItem = document.createElement('li');
            activeItem.innerHTML = game.name;
            activeItem.id = game.name + '-item';
            activeItem.onclick = gameBlock.onclick;
            activeItem.onmouseup = gameIcon.onclick;
            ei('games').appendChild(activeItem);
        }
    }

    // Highlight Max Online Game
    var maxBlock = ei(maxG + '-block');
    maxBlock.style.backgroundColor = this.games.max.background;
    maxBlock.style.borderWidth = this.games.max.width;
    maxBlock.style.borderColor = this.games.max.color;
    maxBlock.style.borderStyle = this.games.max.style;

};

Home.prototype.play = function (gameName) {
    var game = this.games.items[gameName];
    ei('pwd').innerHTML = gameName;
    ei('home-icon').style.display = null;
    var c = ei('main-container');
    c.innerHTML = "Loading ...";
    if (game.name == 'chess') {

        if (this.chess == null) {
            ajax(game.url, (function (xml) {
                this.chess = new Chess(xml);
                this.chess.show();
            }).bind(this));
        } else {
            this.chess.show();
        }

    } else if (game.name == 'sudoku') {

        if (this.sudoku == null) {
            ajax(game.url, (function (xml) {
                this.sudoku = new Sudoku(xml);
                this.sudoku.show();
            }).bind(this));
        } else {
            this.sudoku.show();
        }

    } else {
        // Not implemented
        c.innerHTML = "<p>This game is not implemented yet !</p>";
    }

};

// ----------------------------------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------------------------------

// Logging

function d(msg) {
    console.log(msg);
}

// Math

function abs(a) {
    return a < 0 ? -1 * a : a;
}

// Ajax
function ajax(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.overrideMimeType("application/xml");
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4)
            callback(this.responseXML);
    };
    xmlhttp.open('GET', url);
    xmlhttp.send();
}

// Dom

function dom_tag(e, tag) {
    return e.getElementsByTagName(tag)[0];
}

function dom_tag_val(e, tag) {
    return dom_tag(e, tag).innerHTML;
}

function dom_tag_attr(e, tag, attr) {
    return dom_tag(e, tag).getAttribute(attr);
}

function ei(id, e) {
    if (e == null)
        e = document;
    return e.getElementById(id);
}

// Global helpers


// ----------------------------------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------------------------------

window.onload = function () {
    window.home = new Home('./xml/home.xml');//http://ie.ce-it.ir/hw3/xml/home.xml
};