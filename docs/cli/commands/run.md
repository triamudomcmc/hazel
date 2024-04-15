# hazel run

Run a provided single hazel script file.

### Arguments

| Name   | Type   | Default     | Description |
|--------|--------|-------------|-------------|
|`<file>`|`string`| `*required` | file name   |


### Options

| Name        | Type    | Default | Description                                                       |
|-------------|---------|---------|-------------------------------------------------------------------|
|`-f, --force`|`boolean`| `false` | Force version exclusive scripts to run with incompatible version. |

### Examples
```shell
hazel run script.ts

hazel run script.ts -f
```