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
const appFiles = require('./helpers/appFiles')
const packageContent = require('./helpers/package')

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
      const expectedFilesCount = 28

      run(dir, [], (err, stdout) => {
        if (err) return done(err); // not sure what it does for us?
        files = parseCreatedFiles(stdout, dir);
        output = stdout;
        expect(files.length).to.equal(expectedFilesCount)
        done();
      });
    });


    appFiles.forEach(file => {
      it(`is expected to include folder/file: ${file}`, () => {
        expect(files.indexOf(file)).to.not.equal(-1)
      });
    })

    it('is expected to have a package.json file', () => {
      const file = path.resolve(dir, 'package.json');
      const content = fs.readFileSync(file, 'utf8');
      expect(JSON.parse(content)).to.deep.equal(packageContent(dir))
    });

    it('is expected to have installable dependencies', (done) => {
      npmInstall(dir, done)
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
        .expect(404, /Cannot GET \//, done);
    });

    it('is expected to generate a 404', (done) => {
      let file = path.resolve(dir, 'app.js');
      let app = require(file);

      request(app)
        .get('/does_not_exist')
        .expect(404, /Cannot GET \/does_not_exist/, done);
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
      const expectedFilesCount = 29

      run(dir, ['--git'], (err, stdout) => {
        if (err) return done(err);
        files = parseCreatedFiles(stdout, dir);
        expect(files.length).to.equal(expectedFilesCount)
        done();
      });
    });

    [...appFiles, '.gitignore'].forEach(file => {
      it(`is expected to include folder/file: ${file}`, () => {
        expect(files.indexOf(file)).to.not.equal(-1)
      });
    })
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