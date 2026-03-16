---
title: Install OpenCilk
tags: install
eleventyNavigation:
  order: -3
download:
  host: https://github.com/OpenCilk/opencilk-project/
  release: opencilk/v3.0
  ubuntu_2404_x86: 
    shell: opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04.sh
    binary: opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04.tar.gz
    size: 1.31 GB
  macos_arm:
    shell: opencilk-3.0.0-arm64-apple-darwin24.3.0.sh
    binary: opencilk-3.0.0-arm64-apple-darwin24.3.0.tar.gz
    size: 1.22 GB
  docker: 
    binary: docker-opencilk-v3.0.tar.gz
    size: 1.69 GB
---

## System requirements

OpenCilk 3.0 runs on Intel x86 64-bit processors (Haswell and newer), AMD x86
64-bit processors (Excavator and newer), and various 64-bit ARM processors, including Apple Silicon. It has been tested on the following operating systems:

 - Recent versions of Ubuntu, including via the Windows Subsystem for Linux v2 (WSL2)
 - Recent versions of macOS
 - FreeBSD 13
 - Recent versions of Fedora

{% alert "note", "Prerequisites:" %}
The OpenCilk binaries assume that system header files and system libraries
are already installed on the system.
- On Linux, we recommend installing GCC (or equivalent) to provide these necessary system files.
- On macOS, you must install [XCode](https://developer.apple.com/support/xcode/) or
the [XCode Command Line Tools](https://mac.install.guide/commandlinetools/index.html) to get
the necessary system files. 
{% endalert %}

## Methods of installation

Precompiled binaries for OpenCilk 3.0 can be installed in several ways:
- Using a [shell archive (`.sh`)](#installing-using-a-shell-archive) built for the target hardware and operating system.
- Using a [tarball (`.tar.gz`)](#installing-using-a-tarball) built for the target hardware and operating system.
- Using a [docker image](#docker-image).

You can also [build OpenCilk from source](../build-opencilk-from-source),
which we recommend for operating systems for
which precompiled binaries are not available.

## Installing using a shell archive

To install OpenCilk 3.0 using a shell archive, first download the appropriate shell
archive for your system, then follow the installation instructions.

### Download

Download the appropriate shell archive for your system using one of the following links:

***Linux:***
 - [{{ download.ubuntu_2404_x86.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2404_x86.shell }})
   ({{ download.ubuntu_2404_x86.size }})
 
***macOS:***
 - [{{ download.macos_arm.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.macos_arm.shell }})
   ({{ download.macos_arm.size }})

### Install

Execute the shell script to extract OpenCilk 3.0 into the current directory.  For example:

```shell-session
$ sh opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04.sh
```

You will be prompted to accept the OpenCilk license and whether or not to
append a version-specific subdirectory to the installation prefix (by default
the current directory).

Optionally, you can select a different installation directory by passing the
option `--prefix=/path/to/install/dir` to the script.  (You will need to make
sure that installation directory exists before running the shell archive with
`--prefix`.)  To see all options, pass
the `--help` argument to the script.

The OpenCilk C (or C++) compiler can be invoked via `bin/clang` (or
`bin/clang++`) from within the installation directory.
Optionally, you can configure your system so that `clang` and `clang++` point to the OpenCilk C and C++
compilers (e.g., by setting your `PATH` environment variable or installing system-wide symbolic links).

{% alert "Note", "<span id='example'>Example:</span>" %}

The following example shows the
process on Ubuntu 24.04 to install OpenCilk into `/opt/opencilk` without adding
a version-specific subdirectory.  The installation and setup process is
analogous for macOS and other Linux systems.

- Download the precompiled [OpenCilk shell
archive](/doc/users-guide/install/#installing-using-a-shell-archive) for your
system.  
- Make directory `/opt/opencilk` if it does not already exist, and execute the shell script to install OpenCilk into the directory.

```shell-session
$ mkdir -p /opt/opencilk
$ sh opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04.sh --prefix=/opt/opencilk --exclude-subdir
OpenCilk Installer Version: 3.0.0, Copyright (c) OpenCilk
This is a self-extracting archive.
The archive will be extracted to: /opt/opencilk 
Using target directory: /opt/opencilk
Extracting, please wait... 
Unpacking finished successfully
```

- The OpenCilk C/C++ compiler can now be run as `/opt/opencilk/bin/clang` or `/opt/opencilk/bin/clang++`.
- Optionally, set `clang` and `clang++` to point to the OpenCilk C and C++
compilers.  This can be achieved in numerous ways, such as by setting your
`PATH` environment variable to look in `/opt/opencilk/bin/` or by installing
system-wide symbolic links.
{% endalert %}

## Installing using a tarball

To install OpenCilk 3.0 using a tarball, first download the appropriate tarball
for your system, then follow the installation instructions.

### Download

Download the appropriate tarball for your system using one of the following links:

***Linux:***
 - <a id="{{ download.release }} ubuntu 2204 x86" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2404_x86.binary }}">{{ download.ubuntu_2404_x86.binary }}</a>
   ({{ download.ubuntu_2404_x86.size }})
 
***macOS:***
 - <a id="{{ download.release }} macos arm" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.macos_arm.binary }}">{{ download.macos_arm.binary }}</a>
   ({{ download.macos_arm.size }})
 
### Install

Extract OpenCilk 3.0 from the downloaded tarball.  For example:
```shell-session
$ tar xvzf opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04.tar.gz
```
will extract the OpenCilk installation into a subdirectory
`opencilk-3.0.0-x86_64-linux-gnu-ubuntu-24.04/` within the current working directory.

{% alert "Note", "Note:" %}
Extracting the tarball as above is equivalent to running the corresponding
shell archive with options `--skip-license --include-subdir`.  Installing using this method,
or by passing `--skip-license` to the shell archive, implies that you accept OpenCilk's
software license.
{% endalert %}

## Docker image

OpenCilk 3.0 is also available as a [docker](https://www.docker.com/) image based on Ubuntu 24.04.
You can download the docker image here:

- <a id="{{ download.release }} docker" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.docker.binary }}">{{ download.docker.binary }}</a>
   ({{ download.docker.size }})

The OpenCilk C and C++ compilers are available as `clang` and `clang++` in the
image.  To use the OpenCilk 3.0 Docker image, download the
`docker-opencilk-v3.0.tar.gz` file, load the image, and run a container.  For
example:

```shell-session
$ docker load -i docker-opencilk-v3.0.tar.gz
$ docker run -it opencilk:v3.0 /bin/bash
```

## Next steps

The OpenCilk 3.0 installation includes LLVM 19.1.7 with the following OpenCilk
components:

 - OpenCilk compiler (with the `clang` and `clang++` front-ends)
 - OpenCilk runtime library
 - Cilksan race detector 
 - Cilkscale scalability analyzer and visualization script

See [Getting started](/doc/users-guide/getting-started) for steps to verify
that your installation is working and to start using OpenCilk.
