# Emoji catalog

ScheduleBud uses the Color SVG artwork from
[Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), licensed
under MIT. The bundled license is available at
`public/emojis/fluent/LICENSE.txt`.

`catalog.ts` is application-wide data. The sticker catalog adapts it for the
current sticker picker, while future features such as emoji background patterns
can consume it directly without depending on the sticker system.

The catalog follows Unicode's CLDR keyboard order and standard groups/subgroups
from `source-data/unicode/emoji-test.txt`. Search is also reusable: `search.ts`
ranks real names first, followed by upstream keywords, semantic aliases, and
category metadata. A query searches across all emoji categories in the picker.

To refresh the catalog, clone the upstream repository and run:

```powershell
node scripts/import-fluent-emoji-assets.mjs <path-to-fluentui-emoji> <commit-sha>
```

The importer replaces `public/emojis`, copies every available Color SVG
(including skin-tone variants), reads Microsoft’s CLDR names, applies Unicode's
recommended keyboard organization, and regenerates the catalog and provenance
files.
