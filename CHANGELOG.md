# Changelog
Further documentation can be found at this url
<a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/triamudomcmc/hazel/main/docs/modules.html">Documentation is here :)</a>

## [0.0.1] - 2024-04-15
### Added
- CLI support for basic command <br/> (more detail at [CLI's documentation](docs/cli/index.md))
    #### [ReferableMapEntity\<T>](https://htmlpreview.github.io/?https://raw.githubusercontent.com/triamudomcmc/hazel/main/docs/lib/classes/ReferableMapEntity.html)
    - ReferableMapEntity.<b>synthesized</b> attribute for determining whether the object is newly created in script or retrieved from the existing source.<br/><br/>
      (in-script created ReferableMapEntity will always be marked as synthesized and will be created when push to the database)
    #### [Runtime](https://htmlpreview.github.io/?https://raw.githubusercontent.com/triamudomcmc/hazel/main/docs/lib/classes/Runtime.html)
    - Runtime options can be now configure through process environment
### Changed
- Testing script changed from run to exec. You may use `yarn run exec` instead.
### Fixed
- Improper Collection data fetching sequence.

## [0.0.2] - 2024-04-15
### Fixed
- CLI library reference issue

## [0.0.3] - 2024-05-13
### Added
- Add built-in types for **ClubDisplay** and **UserRef (ref)** collection

## [0.0.4] - 2024-05-13
### Fixed
- CLI version bug

## [0.0.5] - 2024-05-13
### Fixed
- unexported built-in types

## [0.0.6] - 2024-05-13
### Fixed
- modules import namespace bug

## [0.0.7] - 2024-05-14
### Fixed
- firebase specified ID docs creation bug

## [0.0.8] - 2024-05-14
### Added
- version operator (=, <=, >=, <, >)

## [0.0.9] - 2024-07-19
### Added
- updated club IDs according to the system