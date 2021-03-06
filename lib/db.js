'use strict'

var pg = require('pg')
var config = require('./config')
var log = require('./log')
var pool = exports.pool = new pg.Pool(config.pg)

/**
 * Query the postgres database that's configured via config/*.json or with
 * environment variables..
 *
 * @param  {String}   sql     Query SQL (with tokens like $1).
 * @param  {Array}    values  Values for placeholder tokens.
 * @param  {Function} fn      Errback function: `fn(error, result)`.
 */
exports.query = function query (sql, values, fn) {
  pool.connect(function (error, client) {
    if (error) {
      // Connection errors should log, even if it's an ignorable error from the
      // consumer's point of view.
      log.error(error)
      return fn(error)
    }
    client.query(sql, values, function (error, result) {
      if (error) {
        error.message +=
          '\nSQL: ' + sql +
          '\nValues: ' + JSON.stringify(values)
      }
      fn(error, result)
      client.end(function (error) {
        if (error) {
          log.error(error)
        }
      })
    })
  })
}
