# simple-react-dts-generator

[![npm version](https://badge.fury.io/js/simple-react-dts-generator.svg)](https://badge.fury.io/js/simple-react-dts-generator)

Simple generation of React d.ts

legacy: https://github.com/katai5plate/tds-gen

## Usage

```
npm i -D simple-react-dts-generator
node -e "require('simple-react-dts-generator')('<module_name>')"
node -e "require('simple-react-dts-generator')('<module_name>', '<dist_dir>')"
```

## Features

- Output the camel case function as React.ComponentType <any>, and output the processing contents as a comment immediately below it.
- A function that is not camel case is output as function f (x: any, y: any): any, and the processing contents are output as a comment immediately below it.
- The object is output as {}, but the details of the element are output as a comment immediately below it.
- number, string, boolean are automatically detected and output.
- Decompose the array as [number, string, boolean] and output it.

## Bugs

- May crash process when converting classes.

## Logs

### 1.0.0

- Operation check complete
- Addition of explanation

### 0.0.1

- Release
