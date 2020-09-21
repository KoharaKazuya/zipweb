# Zip Web

A zip file creation service on web.

Creates zip files and avoids well known issues on Windows and macOS.

## Features

- Web service that can be used offline
- Generates the zip file from a directory
- No `Thumbs.db`, `__MACOSX`, `*.DS_Store`
- No file metadata (e.g.: Permission, Modified timestamp)
- Avoids mojibake: uses UTF-8 instead of Shift-JIS
- Never upload the zip content

## Acknowledgements

- <https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT>
- [ZIP の仕様を日本語でまとめる](https://gist.github.com/ysakasin/2edf8d3bf55c6ebf63f82851e302b030)
- [ZIP (ファイルフォーマット) - Wikipedia](<https://ja.wikipedia.org/wiki/ZIP_(%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88)>)
- [Reading and writing files and directories with the browser-nativefs library](https://web.dev/browser-nativefs/)
