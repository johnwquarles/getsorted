/**
 * Created by bnebosen on 4/15/2014.
 */
var chalk = require('chalk');
var util = require('util');
var MenuItem = require(require('path').join(__dirname, 'menuitem'));
var MenuType = MenuItem.MenuType;

var NodeMenu = function() {
    var self = this;

    self.CLEAR_CODE = "\u001b[2J\u001b[0;0H";

    self.consoleOutput = console.log;
    self.menuItems = [];
    self.waitToContinue = false;
    self.itemNo = 0;
};

NodeMenu.prototype.addItem = function(title, handler, owner, args) {
    var self = this;
    self.menuItems.push(new MenuItem(MenuType.ACTION, ++self.itemNo, title, handler, owner, args));
};

NodeMenu.prototype.addDelimiter = function(delimiter, cnt, title) {
    var self = this;
    var menuItem = new MenuItem(MenuType.DELIMITER);
    if (delimiter) {
        menuItem.setDelimiter(delimiter, cnt, title);
    }

    self.menuItems.push(menuItem);
}

NodeMenu.prototype.start = function() {
    var self = this;
    self.addItem('Quit', function() {
        process.stdin.end();
        process.exit();
    });

    self._printMenu();

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(text) {
        var args = self._parseInput(text);
        var item = null;
        if (args && ('itemNo' in args)) {
            for (var i = 0; i < self.menuItems.length; ++i) {
                if (self.menuItems[i].number == args.itemNo) {
                    item = self.menuItems[i];
                    break;
                }
            }
        }

        if (self.waitToContinue) {
            self._printMenu();
            self.waitToContinue = false;
            return;
        }

        if (!item) {
            self.consoleOutput('Command not found: ' + text);
        } else {
            var valid = item.validate(args.argv);
            if (!valid.lengthMatch) {
                self.consoleOutput('Invalid number of input parameters');
            } else if (!valid.typesMatch) {
                self.consoleOutput('Invalid types of input parameters');
            } else {
                item.handler.apply(item.owner, args.argv);
            }
        }

        self.consoleOutput('Press Enter to continue...');
        self.waitToContinue = true;
    });
};

NodeMenu.prototype._parseInput = function(text) {
    var self = this;

    var patt=/(".*?")|([^\s]{1,})/g;
    var match = text.match(patt);
    var res = null;

    if (match && match.length > 0) {
        if (isNaN(match[0])) {
            self.consoleOutput("Invalid item number");
            return res;
        }

        res = {};
        res.itemNo = parseInt(match[0]);
        res.argv = match.slice(1);
        for (var i = 0; i < res.argv.length; ++i) {
            res.argv[i] = res.argv[i].replace(/"/g, '');
            if (res.argv[i].trim != '') {
                var num = Number(res.argv[i]);
                if (!isNaN(num)) {
                    res.argv[i] = num;
                } else if (res.argv[i] === 'true' || res.argv[i] === 'false') {
                    res.argv[i] = (res.argv[i] === 'true');
                }
            }
        }
    }

    return res;
};

NodeMenu.prototype._printHeader = function() {
    console.log(chalk.cyan("\
 ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ \n\
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌\n\
▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀  ▀▀▀▀█░█▀▀▀▀ \n\
▐░▌          ▐░▌               ▐░▌     \n\
▐░▌ ▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄      ▐░▌     \n\
▐░▌▐░░░░░░░░▌▐░░░░░░░░░░░▌     ▐░▌     \n\
▐░▌ ▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀      ▐░▌     \n\
▐░▌       ▐░▌▐░▌               ▐░▌     \n\
▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄▄▄      ▐░▌     \n\
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌     ▐░▌     \n\
 ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀       ▀      \n\
                                       \n\
 ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄  \n\
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░▌ \n\
▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌ ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌\n\
▐░▌          ▐░▌       ▐░▌▐░▌       ▐░▌     ▐░▌     ▐░▌          ▐░▌       ▐░▌\n\
▐░█▄▄▄▄▄▄▄▄▄ ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄█░▌     ▐░▌     ▐░█▄▄▄▄▄▄▄▄▄ ▐░▌       ▐░▌\n\
▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░░░░░░░░░░░▌     ▐░▌     ▐░░░░░░░░░░░▌▐░▌       ▐░▌\n\
 ▀▀▀▀▀▀▀▀▀█░▌▐░▌       ▐░▌▐░█▀▀▀▀█░█▀▀      ▐░▌     ▐░█▀▀▀▀▀▀▀▀▀ ▐░▌       ▐░▌\n\
          ▐░▌▐░▌       ▐░▌▐░▌     ▐░▌       ▐░▌     ▐░▌          ▐░▌       ▐░▌\n\
 ▄▄▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌      ▐░▌      ▐░▌     ▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄█░▌\n\
▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌       ▐░▌     ▐░▌     ▐░░░░░░░░░░░▌▐░░░░░░░░░░▌ \n\
 ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀         ▀       ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀  \n\
                                                                              \n"));
};

NodeMenu.prototype._printMenu = function() {
    var self = this;

    console.log(self.CLEAR_CODE);
    var self = this;
    self._printHeader();
    for (var i = 0; i < self.menuItems.length; ++i) {
        var menuItem = self.menuItems[i];
        var printableMenu = menuItem.getPrintableString();
        if (menuItem.menuType === MenuType.ACTION) {
            self.consoleOutput(menuItem.number + ". " + printableMenu);
        } else if (menuItem.menuType === MenuType.DELIMITER) {
            self.consoleOutput(printableMenu + '\n');
        }
    }

    console.log(chalk.yellow('\nPlease enter your selection followed by the number of randomly arranged numbers to sort'));

    process.stdout.write("\n>> ");
};

module.exports = new NodeMenu();
