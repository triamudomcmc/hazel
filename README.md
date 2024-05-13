# Hazel—Clubs Data Processing Framework

Use Hazel to deal with complex data without hustle.

## Prerequisite
<p>
Current built-in data source is Firebase Firestore. To establish the connection <b>.env</b> is required with the format as shown below.
</p>

### .env File

```dotenv
FCERT_CLIENT_EMAIL=
FCERT_PROJECT_ID=
FCERT_PRIVATE_KEY=
```

### Important note
<p>
Default exported data directory is ./resource, which git ignored by default. To avoid accidentally exposing any data, this directory should not be added to the public repository.
</p>

## Installation
Install the package globally using any package manager.
```shell
npm install --global @tucmc/hazel
```
Some examples can be found here.<br/>
🗒️ [Examples](src/examples)<br/>

To start create a script, please take a look at cli documentation.

## Hazel CLI
Hazel is now available as a CLI.<br/>

You can now access the framework mainly from behind the CLI. 
If you want to use **hazel** in your node project you can install the library again locally.
#### Try using
```shell
hazel --help
```
CLI can be used to run or init single-file hazel script without the creation of node project.

Further documentation about Hazel CLI can be found here. [CLI Documentation](docs/cli/index.md)
## Documentation
Library documentation can be found here.<br/>
<a href="https://htmlpreview.github.io/?https://raw.githubusercontent.com/triamudomcmc/hazel/main/docs/lib/modules.html">Documentation is here :)</a>

<br/>
Made with ♥ by TUCMC

