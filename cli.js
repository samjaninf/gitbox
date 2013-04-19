// Generated by CoffeeScript 1.6.1
/*
	This is the CLI interface for using git-server.
*/

var CLI, EventEmitter, GITCLI, GitServer, Table, async, fs, mkdirp, path, repoDB, repoLocation, repoPort, repos, _c, _g,
  _this = this,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('events').EventEmitter;

CLI = require('cli-listener');

GitServer = require('./host.js');

mkdirp = require('mkdirp');

fs = require('fs');

async = require('async');

path = require('path');

Table = require('cli-table');

repoPort = 7000;

repoLocation = path.resolve('../repos/');

repoDB = path.resolve('../repos.db');

mkdirp.sync(repos);

if (fs.existsSync(repoDB)) {
  repos = JSON.parse(fs.readFileSync(repoDB));
} else {
  repos = {
    repos: [],
    users: []
  };
}

console.log(repos);

GITCLI = (function(_super) {

  __extends(GITCLI, _super);

  function GITCLI(gitServer, users) {
    var availableCalls, welcomeMessage,
      _this = this;
    this.gitServer = gitServer;
    this.users = users != null ? users : [];
    this.saveConfig = function() {
      return GITCLI.prototype.saveConfig.apply(_this, arguments);
    };
    this.listRepos = function(callback) {
      return GITCLI.prototype.listRepos.apply(_this, arguments);
    };
    this.listUsers = function(callback) {
      return GITCLI.prototype.listUsers.apply(_this, arguments);
    };
    this.columnPercentage = function(percentage) {
      return GITCLI.prototype.columnPercentage.apply(_this, arguments);
    };
    this.getUser = function(username) {
      return GITCLI.prototype.getUser.apply(_this, arguments);
    };
    this.addUserToRepo = function(callback) {
      return GITCLI.prototype.addUserToRepo.apply(_this, arguments);
    };
    this.createUser = function(callback) {
      return GITCLI.prototype.createUser.apply(_this, arguments);
    };
    this.createRepo = function(callback) {
      return GITCLI.prototype.createRepo.apply(_this, arguments);
    };
    this.askQuestions = function(questions) {
      if (questions == null) {
        questions = [];
      }
      return GITCLI.prototype.askQuestions.apply(_this, arguments);
    };
    availableCalls = {
      'create repo': this.createRepo,
      'create user': this.createUser,
      'list repos': this.listRepos,
      'list users': this.listUsers,
      'add user to repo': this.addUserToRepo
    };
    welcomeMessage = "Welcome to Git Server - Powered by NodeJS\n - Repo Location: 	" + repoLocation + "\n - Listening Port: 	" + repoPort + "\n - Repo Count: " + this.gitServer.repos.length + "\n - User Count: " + this.users.length;
    this.cli = new CLI('git-server', welcomeMessage, availableCalls);
    this.on('changedData', this.saveConfig);
  }

  GITCLI.prototype.askQuestions = function(questions) {
    if (questions == null) {
      questions = [];
    }
  };

  GITCLI.prototype.createRepo = function(callback) {
    var _this = this;
    return this.cli.ask({
      name: 'Repo Name: ',
      anonRead: 'Anonymous Access? [y,N] :: '
    }, function(err, results) {
      var anon, name;
      if (err) {
        throw err;
      }
      name = results.name.toLowerCase();
      anon = results.anonRead.toLowerCase();
      if (anon === 'y') {
        anon = true;
      } else {
        anon = false;
      }
      _this.gitServer.createRepo({
        name: name,
        anonRead: anon,
        users: []
      });
      _this.emit('changedData');
      return callback();
    });
  };

  GITCLI.prototype.createUser = function(callback) {
    var _this = this;
    return this.cli.ask({
      username: 'Users username: ',
      password: 'Users password: '
    }, function(err, answers) {
      var user, username;
      if (err) {
        throw err;
      }
      username = answers.username.toLowerCase();
      user = _this.getUser(username);
      if (user !== false) {
        console.log('This username already exists');
        return callback();
      } else {
        user = {
          username: username,
          password: answers.password
        };
        _this.users.push(user);
        _this.emit('changedData');
        return callback();
      }
    });
  };

  GITCLI.prototype.addUserToRepo = function(callback) {
    var _this = this;
    return this.cli.ask({
      repoName: 'Repo Name: ',
      username: 'Users username: ',
      permissions: 'Permissions (comma seperated: R,W ): '
    }, function(err, answers) {
      var permissions, repo, repoName, user, username;
      repoName = answers.repoName.toLowerCase();
      username = answers.username.toLowerCase();
      repo = _this.gitServer.getRepo(repoName + '.git');
      user = _this.getUser(username);
      permissions = answers.permissions.split(',');
      if (permissions.length === 0) {
        permissions = ['R'];
      }
      if (repo === false) {
        return console.log('Repo doesnt exist.');
      } else if (user === false) {
        return console.log('User doesnt exist.');
      } else {
        repo.users.push({
          user: user,
          permissions: permissions
        });
        _this.emit('changedData');
        return callback();
      }
    });
  };

  GITCLI.prototype.getUser = function(username) {
    var user, _i, _len, _ref;
    _ref = this.users;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      user = _ref[_i];
      if (user.username === username) {
        return user;
      }
    }
    return false;
  };

  /*
  		Get the number of columns needed from a % width
  		@param {Int} percentage Percentage of the console width
  */


  GITCLI.prototype.columnPercentage = function(percentage) {
    return Math.floor(process.stdout.columns * (percentage / 100));
  };

  GITCLI.prototype.listUsers = function(callback) {
    var repo, repoUser, table, user, users, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    users = this.users;
    _ref = this.users;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      user = _ref[_i];
      user.repos = [];
      _ref1 = this.gitServer.repos;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        repo = _ref1[_j];
        _ref2 = repo.users;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          repoUser = _ref2[_k];
          if (repoUser.user.username === user.username) {
            user.repos.push({
              name: repo.name,
              permissions: repoUser.permissions
            });
          }
        }
      }
    }
    table = new Table({
      head: ['Username', 'Password', 'Repos'],
      colWidths: [this.columnPercentage(40) - 1, this.columnPercentage(20) - 1, this.columnPercentage(40) - 1]
    });
    _ref3 = this.users;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      user = _ref3[_l];
      repos = (function() {
        var _len4, _m, _ref4, _results;
        _ref4 = user.repos;
        _results = [];
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          repo = _ref4[_m];
          _results.push("" + repo.name + " (" + (repo.permissions.join(',')) + ")");
        }
        return _results;
      })();
      table.push([user.username, user.password, repos.join('\n')]);
    }
    console.log(table.toString());
    return callback();
  };

  GITCLI.prototype.listRepos = function(callback) {
    var repo, table, user, users, _i, _len;
    repos = this.gitServer.repos;
    table = new Table({
      head: ['Repo Name', 'Anonymous Reads', 'Users'],
      colWidths: [this.columnPercentage(40) - 1, this.columnPercentage(20) - 1, this.columnPercentage(40) - 1]
    });
    for (_i = 0, _len = repos.length; _i < _len; _i++) {
      repo = repos[_i];
      users = (function() {
        var _j, _len1, _ref, _results;
        _ref = repo.users;
        _results = [];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          user = _ref[_j];
          _results.push("" + user.user.username + " (" + (user.permissions.join(',')) + ")");
        }
        return _results;
      })();
      table.push([repo.name, repo.anonRead, users.join('\n')]);
    }
    console.log(table.toString());
    return callback();
  };

  GITCLI.prototype.saveConfig = function() {
    var config;
    config = JSON.stringify({
      repos: this.gitServer.repos,
      users: this.users
    });
    return fs.writeFileSync(repoDB, config);
  };

  return GITCLI;

})(EventEmitter);

_g = new GitServer(repos.repos, true, repoLocation, repoPort);

_c = new GITCLI(_g, repos.users);
