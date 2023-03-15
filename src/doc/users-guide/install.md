---
title: Install OpenCilk
tags: install
eleventyNavigation:
  order: -3
download:
  host: https://github.com/OpenCilk/opencilk-project/
  release: opencilk/v2.0
  ubuntu_2004_x86: 
    shell: OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04.sh
    binary: OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04.tar.gz
    size: 764 MB
  ubuntu_2204_x86: 
    shell: OpenCilk-2.0.0-x86_64-Linux-Ubuntu-22.04.sh
    binary: OpenCilk-2.0.0-x86_64-Linux-Ubuntu-22.04.tar.gz
    size: 782 MB
  macos_x86: 
    shell: OpenCilk-2.0.0-x86_64-Apple-Darwin.sh
    binary: OpenCilk-2.0.0-x86_64-Apple-Darwin.tar.gz
    size: 767 MB
  macos_arm:
    shell: OpenCilk-2.0.0-arm64-Apple-Darwin.sh
    binary: OpenCilk-2.0.0-arm64-Apple-Darwin.tar.gz
    size: 695 MB
  docker: 
    binary: docker-opencilk-v2.0.tar.gz
    size: 1.05 GB
---

## System requirements

OpenCilk 2.0 runs on Intel x86 64-bit processors (Haswell and newer), AMD x86
64-bit processors (Excavator and newer), and Apple M1 and other 64-bit
ARM processors.  It has been tested on the following operating systems:

 - Ubuntu (18.04, 20.04, 22.04), including via WSL2 (Windows Subsystem for Linux 2)
 - FreeBSD (13)
 - Fedora (34, 36)
 - macOS (10.15, 11.6, 12.4)

{% alert "note", "Prerequisites:" %}
The OpenCilk binaries assume that system header files and system libraries
are already installed on the system.
- On Linux, we recommend installing GCC (or equivalent) to provide these necessary system files.
- On macOS, you must install [XCode](https://developer.apple.com/support/xcode/) or
the [XCode Command Line Tools](https://mac.install.guide/commandlinetools/index.html) to get
the necessary system files. 
{% endalert %}

## Methods of installation

Precompiled binaries for OpenCilk 2.0 can be installed in several ways:
- Using a [shell archive (`.sh`)](#installing-using-a-shell-archive) built for the target hardware and operating system.
- Using a [tarball (`.tar.gz`)](#installing-using-a-tarball) built for the target hardware and operating system.
- Using a [docker image](#docker-image).

You can also [build OpenCilk from source](../build-opencilk-from-source),
which is the recommended approach for Ubuntu 18.04 and other operating systems for
which precompiled binaries are not available.

## Installing using a shell archive

To install OpenCilk 2.0 using a shell archive, first download the appropriate shell
archive for your system, then follow the installation instructions.

### Download

Download the appropriate shell archive for your system using one of the following links:

***Linux:***
 - [{{ download.ubuntu_2004_x86.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2004_x86.shell }})
   ({{ download.ubuntu_2004_x86.size }})
 - [{{ download.ubuntu_2204_x86.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2204_x86.shell }})
   ({{ download.ubuntu_2204_x86.size }})
 
***macOS:***
 - [{{ download.macos_arm.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.macos_arm.shell }})
   ({{ download.macos_arm.size }})
 - [{{ download.macos_x86.shell }}]({{ download.host }}releases/download/{{ download.release }}/{{ download.macos_x86.shell }})
   ({{ download.macos_x86.size }})

### Install

Execute the shell script to extract OpenCilk 2.0 into the current directory.  For example:

```shell-session
$ sh OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04.sh
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
process on Ubuntu 20.04 to install OpenCilk into `/opt/opencilk` without adding
a version-specific subdirectory.  The installation and setup process is
analogous for macOS and other Linux systems.

- Download the precompiled [OpenCilk shell
archive](/doc/users-guide/install/#installing-using-a-shell-archive) for your
system.  
- Make directory `/opt/opencilk` if it does not already exist, and execute the shell script to install OpenCilk into the directory.

```shell-session
$ mkdir -p /opt/opencilk
$ sh OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04.sh --prefix=/opt/opencilk --exclude-subdir
OpenCilk Installer Version: 2.0.0, Copyright (c) OpenCilk
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

To install OpenCilk 2.0 using a tarball, first download the appropriate tarball
for your system, then follow the installation instructions.

### Download

Download the appropriate tarball for your system using one of the following links:

***Linux:***
 - <a id="{{ download.release }} ubuntu 2004 x86" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2004_x86.binary }}">{{ download.ubuntu_2004_x86.binary }}</a>
   ({{ download.ubuntu_2004_x86.size }})
 - <a id="{{ download.release }} ubuntu 2204 x86" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.ubuntu_2204_x86.binary }}">{{ download.ubuntu_2204_x86.binary }}</a>
   ({{ download.ubuntu_2204_x86.size }})
 
***macOS:***
 - <a id="{{ download.release }} macos arm" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.macos_arm.binary }}">{{ download.macos_arm.binary }}</a>
   ({{ download.macos_arm.size }})
 - <a id="{{ download.release }} macos x86" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.macos_x86.binary }}">{{ download.macos_x86.binary }}</a>
   ({{ download.macos_x86.size }})
 
### Install

Extract OpenCilk 2.0 from the downloaded tarball.  For example:
```shell-session
$ tar xvzf OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04.tar.gz
```
will extract the OpenCilk installation into a subdirectory
`OpenCilk-2.0.0-x86_64-Linux-Ubuntu-20.04/` within the current working directory.

{% alert "Note", "Note:" %}
Extracting the tarball as above is equivalent to running the corresponding
shell archive with options `--skip-license --include-subdir`.  Installing using this method,
or by passing `--skip-license` to the shell archive, implies that you accept OpenCilk's
software license.
{% endalert %}

## Docker image

OpenCilk 2.0 is also available as a [docker](https://www.docker.com/) image based on Ubuntu 20.04.
You can download the docker image here:

- <a id="{{ download.release }} docker" href="{{ download.host }}releases/download/{{ download.release }}/{{ download.docker.binary }}">{{ download.docker.binary }}</a>
   ({{ download.docker.size }})

The OpenCilk C and C++ compilers are available as `clang` and `clang++` in the
image.  To use the OpenCilk 2.0 Docker image, download the
`docker-opencilk-v2.0.tar.gz` file, load the image, and run a container.  For
example:

```shell-session
$ docker load -i docker-opencilk-v2.0.tar.gz
$ docker run -it opencilk:v2.0 /bin/bash
```

## Next steps

The OpenCilk 2.0 installation includes LLVM 14 with the following OpenCilk
components:

 - OpenCilk compiler (with the `clang` and `clang++` front-ends)
 - OpenCilk runtime library
 - Cilksan race detector 
 - Cilkscale scalability analyzer and visualization script

See [Getting started](/doc/users-guide/getting-started) for steps to verify
that your installation is working and to start using OpenCilk.
