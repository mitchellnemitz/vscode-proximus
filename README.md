## Proximus (Quick Open from Text)

Prefill the quick open dialog with the first text selection in the active editor, or with text extracted from around the current cursor position via configurable regex, with an optional set of transformations applied.

Available via right-click menu as `Quick Open from Text` or via platform-dependent keyboard shortcut:

| Platform  | Shortcut |
| ---       | ---      |
| `Windows` | `ctrl+win+p`  |
| `Mac`     | `cmd+alt+p`   |
| `Linux`   | `ctrl+meta+p` |

### Configuration

```json
{
    "proximus.regex": "[\\w\\-]+",
    "proximus.trimLeft": "",
    "proximus.trimRight": "",
    "proximus.transform": "none",
    "proximus.prefix": "",
    "proximus.suffix": ""
}
```

### How it Works

Proximus performs the following operations before showing the quick open dialog:

*1. Extract Text*

If one or more selections exist in the current editor, Proximus uses the first, otherwise it executes `proximus.regex` at the current cursor position and uses the resulting text.

Note: Regex strings provided in JSON likely require additional escaping to be correctly decoded and parsed. The default value of `[\\w\\-]+` is a good example, as each backslash used to escape the next character requires an escaping backslash to persist through the JSON decode process, which means the default value will become `[\w\-]+` when passed to the `Regex(...)` constructor.

*2. Trim Left*

Proximus sorts the list of strings provided in `proximus.trimLeft` from longest to shortest, then tests each against the extracted text. If the extracted text begins with the given string, the string is removed from the start of the extracted text and Proximus moves to the next stage.

Note: This stage only removes the _first_ matching string from the provided list, ordered by length.

*3. Trim Right*

Proximus sorts the list of strings provided in `proximus.trimRight` from longest to shortest, then tests each against the extracted text. If the extracted text ends with the given string, the string is removed from the end of the extracted text and Proximus moves to the next stage.

Note: This stage only removes the _first_ matching string from the provided list, ordered by length.

*4. Transform Case*

Proximus transforms the extracted text from its current case to the provided in `proximus.transform` by utilizing a subset of the [change-case](https://www.npmjs.com/package/change-case) library.

The available options for `proximus.transform` are as follows:

| Value        | Function |
| ---          | ---      |
| `none`       | N/A      |
| `camelCase`  | [camelCase](https://www.npmjs.com/package/change-case#camelcase)   |
| `PascalCase` | [pascalCase](https://www.npmjs.com/package/change-case#pascalcase) |
| `snake_case` | [snakeCase](https://www.npmjs.com/package/change-case#snakecase)   |
| `kebab-case` | [paramCase](https://www.npmjs.com/package/change-case#paramcase)   |
| `path/case`  | [pathCase](https://www.npmjs.com/package/change-case#pathcase)     |
| `dot.case`   | [dotCase](https://www.npmjs.com/package/change-case#dotcase)       |
| `no case`    | [noCase](https://www.npmjs.com/package/change-case#nocase)         |

Any invalid value will be treated as `none` and case transformation will be skipped.

*5. Add Prefix & Suffix*

Proximus adds the value of `proximus.prefix` to the start of the extracted text and the value of `proximus.suffix` to the end of the extracted text.
