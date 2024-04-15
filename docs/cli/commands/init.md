# hazel init

init a single hazel script file.

### Options

| Name                   | Type      | Default | Description                                                                   |
|------------------------|-----------|---------|-------------------------------------------------------------------------------|
| `--version-exclusive`  | `boolean` | `false` | Make the script exclusive for current version.                                |
| `-n, --name <filename>`| `string`  |         | File name or file path. If did not specify, console will prompt the question. |

### Examples
```shell
hazel init

hazel init -n test-script
```