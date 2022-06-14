---
title: Install OpenCilk
tags: install
excerpt: It's as easy as one, two, three.
eleventyNavigation:
  order: -3
---

## Requirements

OpenCilk 1.1 runs on Intel x86 64-bit processors (Haswell and newer), AMD x86
64-bit processors (Excavator and newer), and Apple M1 and other 64-bit
ARM processors.  It has been tested on the following operating systems:

 - Ubuntu (18.04, 20.04), including via WSL2 (Windows Subsystem for Linux 2)
 - FreeBSD (13)
 - Fedora (32)
 - macOS (10.15, 11.2)

## Download

Use the links below to download the appropriate OpenCilk precompiled shell
archive (`.sh`), tarball (`.tar.gz`), or Docker image.

You can also [build OpenCilk from source](../build-opencilk-from-source).

### Linux
 
 - [OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh)
   (749 MB)
 - [OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.tar.gz)
   (749 MB)

### macOS

 - [OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.sh](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.sh)
   (736 MB)
 - [OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/OpenCilk-1.1-LLVM-12.0.0-Darwin-arm64.tar.gz)
   (736 MB)

> ***Note for macOS users:*** Unless you are using the OpenCilk Docker image,
> you must also install [XCode](https://developer.apple.com/support/xcode/) or
> the [XCode Command Line
> Tools](https://mac.install.guide/commandlinetools/index.html), which provide
> standard system libraries and header files needed by the OpenCilk compiler.

### Docker

 - [docker-opencilk-v1.1.tar.gz](https://github.com/OpenCilk/opencilk-project/releases/download/opencilk%2Fv1.1/docker-opencilk-v1.1.tar.gz)
   (814 MB)

## Install

### Shell archive

Execute the shell script to extract OpenCilk 1.1 into the current directory.

```bash
$ sh OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh
```

You will be prompted to accept the OpenCilk license and whether or not to
append a version-specific subdirectory to the installation prefix (by default
the current directory).

Optionally, you can select a different installation directory by passing the
option `--prefix=/path/to/install/dir` to the script.  To see all options, pass
the `--help` argument to the script.

The OpenCilk C (or C++) compiler can be invoked via `bin/clang` (or
`bin/clang++`) from within the installation directory.

#### Example

The following shows the process of installing OpenCilk into a version-specific
subdirectory within `/opt/opencilk/`.

```shell-session
$ sh OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.sh --prefix=/opt/opencilk
OpenCilk Installer Version: 12.0.0, Copyright (c) OpenCilk
This is a self-extracting archive.
The archive will be extracted to: /opt/opencilk

If you want to stop extracting, please press <ctrl-C>.

[...license text omitted...]

Do you accept the license? [yn]:
y

By default the OpenCilk will be installed in:
  "/opt/opencilk/OpenCilk-12.0.0-Linux"
Do you want to include the subdirectory OpenCilk-12.0.0-Linux?
Saying no will install in: "/opt/opencilk" [Yn]:
y

Using target directory: /opt/opencilk/OpenCilk-12.0.0-Linux
Extracting, please wait...

Unpacking finished successfully
```

The OpenCilk C compiler can now be run as
`/opt/opencilk/OpenCilk-12.0.0-Linux/bin/clang`.  Or you can add
`/opt/opencilk/OpenCilk-12.0.0-Linux/bin` to your `PATH` environment variable
and invoke the OpenCilk C/C++ compiler simply as `clang` or `clang++`.

### Tarball

As an alternative to using the self-extracting shell archive above, you can
extract OpenCilk 1.1 from the `.tar.gz` tarball.  For example,

```bash
$ tar xvzf OpenCilk-1.1-LLVM-12.0.0-Ubuntu-20.04-x86_64.tar.gz
```

will extract the OpenCilk installation into a subdirectory
`OpenCilk-12.0.0-Linux/` within the current working directory.

> Extracting the tarball as above is equivalent to running the corresponding
> shell script with options `--skip-license --include-subdir`.

### Docker image

OpenCilk 1.1 is also available as a Docker image based on Ubuntu 20.04.  The
OpenCilk C and C++ compilers are available as `clang` and `clang++` in the
image.  To use the OpenCilk 1.1 Docker image, download the
`docker-opencilk-v1.1.tar.gz` file, load the image, and run a container.  For
example:

```bash
$ docker load -i docker-opencilk-v1.1.tar.gz
$ docker run -it opencilk:v1.1 /bin/bash
```

## Test

The OpenCilk 1.1 installation includes LLVM 12 with the following OpenCilk
components:

 - OpenCilk compiler (with the `clang` and `clang++` front-ends)
 - OpenCilk runtime library
 - Cilksan race detector 
 - Cilkscale scalability analyzer and visualization script

See [Getting started](/doc/users-guide/getting-started) for steps to verify
that your installation is working.

## Additional resources

### External OpenCilk-powered libraries

The following third-party libraries are known to work with OpenCilk out of the
box for parallel execution.

- [SG-t-SNE-Π](https://github.com/fcdimitr/sgtsnepi): Low-dimensional embedding
  of sparse stochastic graphs.
- [FGLT](https://github.com/ailiop/fglt): Fast graphlet transform.
- [RecFMM](https://github.com/zhang416/recfmm): Adaptive fast multipole method.

### Miscellaneous developer tools

- [cilk-mode.el](https://github.com/ailiop/cilk-mode/): Emacs minor mode for
  Cilk source code.
