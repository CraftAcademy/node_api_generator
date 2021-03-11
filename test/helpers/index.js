const path = require('path');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const expect = require('chai').expect

const binPath = path.resolve(__dirname, '../../bin/node_api_generator');
const tempDir = path.resolve(__dirname, '../../temp');

const run = (dir, args, callback) => {
  const argv = [binPath].concat(args);
  const exec = process.argv[0];
  let stderr = '';
  let stdout = '';

  const child = spawn(exec, argv, {
    cwd: dir
  });

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function ondata(str) {
    stdout += str;
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function ondata(str) {
    process.stderr.write(str);
    stderr += str;
  });

  child.on('close', onclose);
  child.on('error', callback);

  function onclose(code) {
    let err = null;

    try {
      expect(code).to.equal(0)
    } catch (e) {
      err = e;
    }

    callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
  }
}

const createEnvironment = (callback) => {
  var num = process.pid + Math.random();
  var dir = path.join(tempDir, ('app-' + num));

  mkdirp(dir, function ondir(err) {
    if (err) return callback(err);
    callback(null, dir);
  });
}

const cleanup = (dir, callback) => {
  if (typeof dir === 'function') {
    callback = dir;
    dir = tempDir;
  }

  rimraf(tempDir, (err) => {
    callback(err);
  });
}

const npmInstall = (dir, callback) => {
  exec('npm install', { cwd: dir }, function (err, stderr) {
    if (err) {
      err.message += stderr;
      callback(err);
      return;
    }

    callback();
  });
}

const parseCreatedFiles = (output, dir) => {
  var files = [];
  var lines = output.split(/[\r\n]+/);
  var match;

  for (var i = 0; i < lines.length; i++) {
    if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
      var file = match[1];

      if (dir) {
        file = path.resolve(dir, file);
        file = path.relative(dir, file);
      }

      file = file.replace(/\\/g, '/');
      files.push(file);
    }
  }

  return files;
}

module.exports = { run, path, createEnvironment, tempDir, cleanup, parseCreatedFiles, npmInstall }