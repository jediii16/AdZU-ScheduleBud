param(
  [string]$SourceDirectory = "source-assets/emojis",
  [string]$PublicDirectory = "public/emojis",
  [string]$CatalogPath = "src/data/emojis/catalog.generated.json",
  [string]$NameMapPath = "src/data/emojis/catalog.names.json"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$source = (Resolve-Path -LiteralPath $SourceDirectory).Path
$public = Join-Path (Get-Location) $PublicDirectory
$catalog = Join-Path (Get-Location) $CatalogPath
$nameMapFile = Join-Path (Get-Location) $NameMapPath
New-Item -ItemType Directory -Force -Path $public | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $catalog) | Out-Null

$archiveCategories = @{
  "IOS EMOJI VECTOR_SVG (Community).zip" = [ordered]@{ id = "emojis-people"; label = "Emojis & People"; order = 0 }
  "IOS EMOJI VECTOR_SVG (Community) (1).zip" = [ordered]@{ id = "animals-nature"; label = "Animals & Nature"; order = 1 }
  "IOS EMOJI VECTOR_SVG (Community) (2).zip" = [ordered]@{ id = "flags"; label = "Flags"; order = 2 }
  "IOS EMOJI VECTOR_SVG (Community) (3).zip" = [ordered]@{ id = "food-drinks"; label = "Food & Drinks"; order = 3 }
  "IOS EMOJI VECTOR_SVG (Community) (4).zip" = [ordered]@{ id = "others"; label = "Others"; order = 4 }
}
$nameMap = @{}
if (Test-Path -LiteralPath $nameMapFile) {
  foreach ($item in (Get-Content -Raw -LiteralPath $nameMapFile | ConvertFrom-Json)) {
    $nameMap[$item.id] = $item
  }
}

$definitions = [System.Collections.Generic.List[object]]::new()
$sha = [System.Security.Cryptography.SHA256]::Create()

foreach ($archiveFile in Get-ChildItem -LiteralPath $source -Filter "*.zip" | Sort-Object Name) {
  $emojiCategory = $archiveCategories[$archiveFile.Name]
  if (-not $emojiCategory) {
    Write-Warning "Skipping unrecognized emoji archive: $($archiveFile.Name)"
    continue
  }
  $archive = [System.IO.Compression.ZipFile]::OpenRead($archiveFile.FullName)
  try {
    foreach ($entry in $archive.Entries | Where-Object { $_.Name -match "\.svg$" -and $_.Length -gt 0 }) {
      $hashStream = $entry.Open()
      try {
        $hash = [Convert]::ToHexString($sha.ComputeHash($hashStream)).ToLowerInvariant()
      } finally {
        $hashStream.Dispose()
      }

      $id = "ios-emoji-$($hash.Substring(0, 16))"
      $filename = "$id.svg"
      $destination = Join-Path $public $filename
      if (-not (Test-Path -LiteralPath $destination)) {
        $inputStream = $entry.Open()
        $outputStream = [System.IO.File]::Create($destination)
        try {
          $inputStream.CopyTo($outputStream)
        } finally {
          $outputStream.Dispose()
          $inputStream.Dispose()
        }
      }

      $stem = [System.IO.Path]::GetFileNameWithoutExtension($entry.Name)
      $numberMatch = [regex]::Match($stem, "^sticker(?: \((\d+)\))?(?: 1)?$")
      $glyph = if ($numberMatch.Success) { $null } else { $stem -replace "-\d+$", "" }
      $metadata = $nameMap[$id]
      $label = if ($metadata) {
        $metadata.label
      } elseif ($glyph) {
        $glyph
      } elseif ($numberMatch.Groups[1].Success) {
        "Emoji $($numberMatch.Groups[1].Value)"
      } else {
        "iOS Emoji"
      }
      $keywords = [System.Collections.Generic.List[string]]::new()
      $keywords.Add("emoji")
      $keywords.Add("ios")
      $keywords.Add($emojiCategory.label)
      if ($metadata) {
        foreach ($keyword in $metadata.keywords) { $keywords.Add($keyword) }
      }
      if ($numberMatch.Groups[1].Success) {
        $keywords.Add($numberMatch.Groups[1].Value)
      }

      $definition = [ordered]@{
        id = $id
        label = $label
        category = $emojiCategory.id
        src = "/emojis/$filename"
        keywords = @($keywords)
        intrinsicWidth = 871
        intrinsicHeight = 871
      }
      if ($metadata.glyph) { $definition.glyph = $metadata.glyph }
      elseif ($glyph) { $definition.glyph = $glyph }
      $definition.categoryOrder = $emojiCategory.order
      $definitions.Add([pscustomobject]$definition)
    }
  } finally {
    $archive.Dispose()
  }
}

$seen = [System.Collections.Generic.HashSet[string]]::new()
$unique = @($definitions | Where-Object { $seen.Add($_.id) })
$ordered = @($unique | Sort-Object `
  @{ Expression = { $_.categoryOrder } }, `
  @{ Expression = { $_.label } })
foreach ($definition in $ordered) { $definition.PSObject.Properties.Remove("categoryOrder") }
$json = $ordered | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($catalog, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
Write-Output "Imported $($ordered.Count) unique emoji SVGs into $PublicDirectory."
