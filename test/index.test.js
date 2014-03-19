var sinon = require('sinon');
var assert = require('assert');

var db = require('../index')({
  "user": "root",
  "password": "",
  "host": "127.0.0.1",
  "port": "3306"
});

describe('mysql', function () {
  describe('select', function () {
    it('should run a select', function (done) {
      db.select('SELECT "a" AS b', [], function (err, result, fields) {
        assert.equal(result[0]['b'], 'a');
        done();
      });
    });
  });
});
