# Changelog
All notable changes to this project will be documented in this file.

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
