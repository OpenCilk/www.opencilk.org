---
title: Installing OpenCilk v1.1
tags: install
sidebar: Documentation
eleventyNavigation:
  key: Installing OpenCilk
images:
  placement: feature # options: feature, background
  feature: flow-760x400.jpg
  feature-height: h-1/1
---

## Requirements

OpenCilk v1.1 runs on Intel x86 64-bit processors (Haswell and newer), AMD x86 64-bit processors (Excavator and newer), and Apple M1 and other 64-bit ARM processors. It has been tested on the following operating systems:
 - Ubuntu (18.04, 20.04)
 - FreeBSD (13)
 - Fedora (32)
 - macOS (10.15, 11.2)

## Download

Use the links below to download the appropriate OpenCilk installation script (<code>.sh</code>) and binary files (<code>.tar.gz</code>).

**Linux**
 - [OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh)
 - [OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.tar.gz)

**macOS**
 - [OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.sh](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.sh)
 - [OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.tar.gz)

**Docker**
 - [docker-opencilk-v1.1.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/docker-opencilk-v1.1.tar.gz)

## Install

Execute the script to install OpenCilk into the current directory.

```bash
> do something
```

## Test

Your OpenCilk installation includes the following components:

 - Compiler
 - Runtime scheduler
 - Race detector
 - Scalability analyzer

### Test the compiler

```bash
> do compiler thing
```

### Test the runtime scheduler

```bash
> do runtime thing
```

### Test the race detector

```bash
> do race detector thing
```

### Test the scalability analyzer

```bash
> do scalability thing
```

## Next Steps

Something about code libraries and development resources?

Link to getting started with OpenCilk.


See also: **[Building OpenCilk from source](../building-opencilk-from-source)**
