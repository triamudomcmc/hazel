# hazel run

Run a provided single hazel script file.

### Arguments

| Name                   | Type      | Default     | Description                    |
|------------------------|-----------|-------------|--------------------------------|
| `<file>` or `<string>` | `string`  | `*required` | file name, or script as string |


### Options

| Name           | Type      | Default | Description                                                       |
|----------------|-----------|---------|-------------------------------------------------------------------|
| `-f, --force`  | `boolean` | `false` | Force version exclusive scripts to run with incompatible version. |
| `-s, --string` | `boolean` | `false` | Run the script as string instead of file.                         |

### Examples
```shell
hazel run script.ts

hazel run script.ts -f

hazel run -s '/*------Hazel Typescript Header-------
--------------PROPERTIES--------------
env_file = ""
skip_yes_no = false
version = "any"
------------END-PROPERTIES------------
Do not remove the heading otherwise
....'
```