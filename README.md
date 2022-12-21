# regolith-vscode

This is an extension, that helps with developing Minecraft Bedrock Add-ons with [Regolith](https://github.com/Bedrock-OSS/regolith)

## Features

 - Schema checking for config.json
 - Schema checking for custom filter settings
 - Diagnostics for common issues
 - Quick commands for init, run, install-all and install regolith subcommands
 - Quick fixes for missing filters
 - Completion for filters and profiles

## Known Issues

1. After applying Quick Fix for filter not installed, the document is not updated.

## Prepare your Regolith filter for this extension

This extension allows filter developers to provide additional information to the user in following ways:

### Description

Add a `completion.md` file to the root of the filter folder. The contents will be displayed when you hover over the filter name in `config.json`.

### Settings schema

Add a `schema.json` file to the root of the filter folder. This file will be included as a schema for `settings` field for your filter.

## Release Notes

### 0.0.1

Initial release
