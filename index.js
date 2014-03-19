/* jslint node: true */
'use strict';

//
// ## Simple db wrapper

// wrapper for mysql2 lib
// provides select and write functionality and creates a pool
// given a config
//
// * **config** see node-mysql documentation
//
var Db = function (config) {
  this.db = require('mysql2').createPool(config);
};

//
// ## Get connection
//
// Will give you a connection from the pool
//
// * **callback** function with arguments err and connection
//
// Example:
// this._getConnection(function (err, con)) {
//   con.query('SELECT STUFF')
// }
//
Db.prototype._getConnection = function (cb) {
  this.db.getConnection(cb);
}

//
// ## Select
// Accepts prepared statements with ? as placeholder for values
// Data should be an array with values in the same order as corresponding
// ? in the query
//
// result in callback will be an array containing objects, corresponding
// to rows in mysql
// example
// [
//    {field1: "data", field2: "data"},
//    {field1: "data2",field2: "data2"}
// ]
//
// fields contains metadata about the query performed
//
// * **query** Should be a proper select query
// * **data** [] sorted by appearance in query
// * **cb** function (err, result, fields)
//
Db.prototype.select = function select(query, data, cb) {
  this._getConnection(function (err, con) {
    if (err) {
      return cb(err, null);
    }

    con.execute(query, data, function(err, result, fields) {
      cb(err, result, fields);
      con.release();
    });
  });
};

//
// ## Stream select
// Useful for large chunks of data
//
// * **query** Should be a proper select query
// * **data** [] sorted by appearance in query
// * **rowHandler** function to handle each row
// * **finishHandler** handles the finish and should be able to handle given an error object
//
Db.prototype.stream = function stream(query, data, rowHandler, finishHandler) {
  this._getConnection(function (err, con) {
    if (err) {
      return finishHandler(err, null);
    }

    var res = con.execute(query, data);
    var save_err = null;

    // Bind streamers
    res
    .on('error', function (err) {
      save_err = err;
    })
    .on('result', function (row) {
      rowHandler(row);
    })
    .on('end', function () {
      finishHandler(save_err);
    });
  });
}

//
// ## Write
// All calls that change data on the server
// Prepared statements
//
// * **query** sql
// * **data** [] with values
// * **cb** callback(err, result)
//
Db.prototype.write = function write(query, data, cb) {
  this._getConnection(function (err, con) {
    if (err) {
      cb(err, null);
      return;
    }

    con.execute(query, data, function(err, result) {
      cb(err, result);
      con.release();
    });
  });
};

module.exports = function (config) {
  return new Db(config);
}
