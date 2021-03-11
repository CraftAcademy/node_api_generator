const fs = require('fs');
const request = require('supertest');

const expect = require('chai').expect
const {
  run,
  path,
  createEnvironment,
  cleanup,
  parseCreatedFiles,
  npmInstall } = require('./helpers')

describe('node-api', () => {
  describe('(no args)', () => {
    before((done) => {
      createEnvironment((err, newDir) => {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    after((done) => {
      cleanup(dir, done);
    });
    let dir, files, output;


    it('is expected to create a basic app', (done) => {
      run(dir, [], (err, stdout) => {
        if (err) return done(err); // not sure what it does for us?
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        expect(files.length).to.equal(7)
        done();
      });
    });

    it('is expected to have basic files', () => {
      expect(files.indexOf('bin/www')).to.not.equal(-1)
      expect(files.indexOf('app.js')).to.not.equal(-1)
      expect(files.indexOf('package.json')).to.not.equal(-1)
    });

    it('is expected to have a package.json file', function () {
      const file = path.resolve(dir, 'package.json');
      const content = fs.readFileSync(file, 'utf8');
      const expectedContent = '{\n'
        + '  "name": ' + JSON.stringify(path.basename(dir)) + ',\n'
        + '  "version": "0.0.0",\n'
        + '  "private": true,\n'
        + '  "scripts": {\n'
        + '    "start": "node ./bin/www"\n'
        + '  },\n'
        + '  "dependencies": {\n'
        + '    "body-parser": "~1.13.2",\n'
        + '    "cookie-parser": "~1.3.5",\n'
        + '    "express": "~4.13.1"\n'
        + '  }\n'
        + '}'

      expect(content).to.equal(expectedContent)
    });

    it('is expected to have installable dependencies', (done) => {
      npmInstall(dir, done);
    });

    it('is expected to export an express app from app.js', function () {
      const file = path.resolve(dir, 'app.js');
      const app = require(file);
      expect(typeof (app)).to.equal('function')
      expect(typeof (app.handle)).to.equal('function')
    });

    it('is expected to respond to HTTP request', (done) => {
      const file = path.resolve(dir, 'app.js');
      const app = require(file);

      request(app)
        .get('/')
        .expect(404, 'Cannot GET /\n', done);
    });

    it('is expected to generate a 404', (done) => {
      let file = path.resolve(dir, 'app.js');
      let app = require(file);

      request(app)
        .get('/does_not_exist')
        .expect(404, 'Cannot GET /does_not_exist\n', done);
    });
  });

  describe('--git', () => {

    before((done) => {
      createEnvironment((err, newDir) => {
        if (err) return done(err);
        dir = newDir;
        done();
      });
    });

    after((done) => {
      cleanup(dir, done);
    });

    let dir, files;

    it('is expected to create basic app with git files', (done) => {
      run(dir, ['--git'], (err, stdout) => {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        expect(files.length).to.equal(8)
        done();
      });
    });

    it('is expected to have basic files including .gitignore', () => {
      expect(files.indexOf('bin/www')).to.not.equal(-1)
      expect(files.indexOf('app.js')).to.not.equal(-1)
      expect(files.indexOf('package.json')).to.not.equal(-1)
      expect(files.indexOf('.gitignore')).to.not.equal(-1)
    });

  });

  describe('-h', () => {
    let dir, output, files;

    before((done) => {
      createEnvironment((err, newDir) => {
        if (err) return done(err);
        dir = newDir;
      });
      run(dir, ['-h'], (err, stdout) => {
        if (err) return done(err);
        output = stdout
        files = parseCreatedFiles(stdout, dir);
        done();
      })
    });

    after((done) => {
      cleanup(dir, done);
    });

    it('is NOT expected to create any new files', () => {
      expect(files.length).to.equal(0)

    });

    it('is expected to include text on general usage', () => {
      expect(output).to.contain('Usage: node_api_generator [options] [dir]')
    });

    it('is expected to include Options text', () => {
      expect(output).to.contain('Options:')
    });

    it('is expected to include --help text', () => {
      expect(output)
      .to.contain('-h, --help')
      .and.contain('output usage information')
    });

    it('is expected to include --version text', () => {
      expect(output)
      .to.contain('-V, --version')

    });

    it('is expected to include --git text', () => {
      expect(output)
      .to.contain('--git')
      .and.contain('add .gitignore')
    });

    it('is expected to include --force text', () => {
      expect(output)
      .to.contain('-f, --force')
      .and.contain('force on non-empty directory')
    });
  });

});



// function createEnvironment(callback) {
//   var num = process.pid + Math.random();
//   var dir = path.join(tempDir, ('app-' + num));

//   mkdirp(dir, function ondir(err) {
//     if (err) return callback(err);
//     callback(null, dir);
//   });
// }

// function npmInstall(dir, callback) {
//   exec('npm install', { cwd: dir }, function (err, stderr) {
//     if (err) {
//       err.message += stderr;
//       callback(err);
//       return;
//     }

//     callback();
//   });
// }

// function parseCreatedFiles(output, dir) {
//   var files = [];
//   var lines = output.split(/[\r\n]+/);
//   var match;

//   for (var i = 0; i < lines.length; i++) {
//     if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
//       var file = match[1];

//       if (dir) {
//         file = path.resolve(dir, file);
//         file = path.relative(dir, file);
//       }

//       file = file.replace(/\\/g, '/');
//       files.push(file);
//     }
//   }

//   return files;
// }

// function run(dir, args, callback) {
//   var argv = [binPath].concat(args);
//   var exec = process.argv[0];
//   var stderr = '';
//   var stdout = '';

//   var child = spawn(exec, argv, {
//     cwd: dir
//   });

//   child.stdout.setEncoding('utf8');
//   child.stdout.on('data', function ondata(str) {
//     stdout += str;
//   });
//   child.stderr.setEncoding('utf8');
//   child.stderr.on('data', function ondata(str) {
//     process.stderr.write(str);
//     stderr += str;
//   });

//   child.on('close', onclose);
//   child.on('error', callback);

//   function onclose(code) {
//     var err = null;

//     try {
//       expect(stderr).to.deep.equal('')
//       // assert.equal(stderr, '');
//       expect(code).to.equal(0)
//       // assert.strictEqual(code, 0);
//     } catch (e) {
//       err = e;
//     }

//     callback(err, stdout.replace(/\x1b\[(\d+)m/g, '_color_$1_'));
//   }
// }
