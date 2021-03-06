# Changelog
All notable changes to this project will be documented in this file.

## [2.5.0] - 2018-11-22
### Changed
- Upgrade all dependencies

## [2.4.0] - 2018-11-01
### Added
- [DbConnection] Add `transactionQuery` command

## [2.3.0] - 2018-08-06
### Added
- [RedisConnection] Add `llen` command

## [2.2.0] - 2018-06-25
### Added
- [DbConnection] Ability to run query as a stream

## [2.1.0] - 2018-06-15
### Added
- [RedisConnection] Expose psubscribe command

## [2.0.2] - 2018-06-04
### Added
- [RedisConnection] Expose getset command

## [2.0.1] - 2018-06-04
### Changed
- Promisified all Redis calls to make the Redis connector behave exactly the same as the underlying client.

### Fixed
- Remove error warn and swallowing from subscribe method, because that's
not appropriate in a library.

## [2.0.0] - 2018-05-24
### Added
- Re-added Prometheus metrics module to top-level module and DbConnection
- [DbConnection] Export metrics and print out logs when key pool connection lifecycle events occur

### Fixed
- [DbConnection] Fix multi-statement query preparation when the `paramLabels` flag is set.

## [1.4.0] - 2018-05-23
### Changed
- Upgraded node-mysql2 module to include support for more pool connection lifecycle events

## [1.3.0] - 2018-05-16
### Added
- [DbConnection] Options parameter to multi-statement query to switch between labelled and positional parameters

### Changed
- [RedisConnection] Allow passing a single value to `lpush`, `rpush` and `subscribe` without wrapping it in an array.

## [1.2.0] - 2018-05-16
### Added
- Redis pub/sub commands:
  - publish
  - subscribe
  - listen

## [1.1.0] - 2018-05-15
### Added
- Add ability to suppress info logs for redis commands

## [1.0.3] - 2018-05-14
### Fixed
- Passes configurable port to mysql

## [1.0.2] - 2018-05-14
### Fixed
- Upgrade to node-app-base 0.4.13 to fix memory leak

## [1.0.1] - 2018-05-14
### Fixed
- Pass correct arguments to lpop and rpop redis commands

## [1.0.0] - 2018-05-09
### Added
- New Redis methods for lists
  - lpush
  - rpush
  - lpop
  - rpop
  - blpop
  - brpop

## [0.7.1] - 2018-05-09
### Fixed
- Correctly set Redis DB index
- Fixed linting error

## [0.7.0] - 2018-05-08
### Added
- [DbConnection] `connectionLimit` pool flag and increase default to a more reasonable (higher) value
- [DbConnection] Explain connection pool flags

## [0.6.0] - 2018-05-04
### Removed
- No longer accept metrics parameter when initialising the module
- Remove erroneous, non-generic metric logging from JSON API calls

## [0.5.0] - 2018-05-03
### Added
- [DbConnection] Add healthcheck function
- [RedisConnection] Add healtcheck function
- Add generic healthcheck callback function for node-app-base healthcheck listener

## [0.4.1] - 2018-05-02
### Fixed
- [DbConnection] Fix always using default pool connection options instead of the ones supplied by the client

## [0.4.0] - 2018-05-02
### Changed
- [DbConnection] Upgraded MySQL driver from `node-mysql` to `node-mysql2`, which is faster and fully API-compatible with the former.

## [0.3.2] - 2018-04-30
### Changed
- [DbConnection] Set default connection handling parameters

## [0.3.1] - 2018-04-18
### Added
- [RedisConnection] Add `get` and `mget` commands

### Changed
- [DbConnection] Allow user to specify pool/connection options
- [DbConnection] Multi-statement queries should always return an array
- [DbConnection] Add label (colon) query formatter to single-statement query function
- Expose connection logging flag which was previously hidden

### Security
- [DbConnection] Multiple statements are no longer enabled by default

## [0.3.0] - 2018-03-17
### Added
- Redis connector

### Changed
- Add optional label parameter to data query functions to increase log specificity

## [0.2.0] - 2018-03-06
### Added
- Add timers to connectors queries

### Changed
- [DbConnection] Allow query values to be passed into `query`

## [0.1.0] - 2018-02-26
### Added
- First release
    - MySQL (v1) client
    - HTTP Request client
    - JSON HTTP Request client

The format of this changelog is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

