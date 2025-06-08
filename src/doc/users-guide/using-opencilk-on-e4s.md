---
title: Using OpenCilk on E4S
tagline: This guide walks through the basic steps of using OpenCilk on E4S.
eleventyNavigation:
  order: -1
---

E4S, the Extreme-Scale Scientific Software Stack [https://e4s.io] provides an ecosystem for science. It is a curated collection of HPC and AI packages installed using the Spack package manager. To use E4S with Cilk, first download an E4S Singularity file:


```shell-session
$ wget https://oaciss.nic.uoregon.edu/e4s/images/24.11/e4s-cuda80-x86_64-24.11.sif
$ singularity run --nv e4s-cuda80-x86_64-24.11.sif
$ mkdir $HOME/packages
$ wget https://github.com/OpenCilk/opencilk-project/releases/download/opencilk/v2.1/opencilk-2.1.0-x86_64-linux-gnu-ubuntu-22.04.sh
$ sh opencilk-2.1.0-x86_64-linux-gnu-ubuntu-22.04.sh --prefix=$HOME/packages/opencilk-2.1.0
$ export PATH=$HOME/packages/opencilk-2.1.0/bin:$PATH
```

Then, cilk will be installed within the E4S Ubuntu Linux container. E4S provides over 100 HPC-AI tools installed with support for GPUs runtimes.

{% img "/img/e4s-singularity.png", "1200px" %}

E4S containers include the Codium [https://codium.org] Integrated Development Environment.

{% img "/img/e4s-codium.png", "1200px" %}

Cilk may be used with other numerical libraries provided by E4S. 

To install the TAU Performance System [https://tau.uoregon.edu] to measure the performance of programs written in Cilk, we use: 

```shell-session
$ git clone https://github.com/UO-OACISS/tau2
$ cd tau2
$ ./configure  -pthread -c++=clang++ -cc=clang -fortran=gfortran -bfd=download -unwind=download -iowrapper -dwarf=download -otf=download
$ make install -j
$ export PATH=`pwd`/x86_64/bin:$PATH 
$ CILK_NWORKERS=N tau_exec -T serial,clang,pthread -ebs ./a.out 
$ paraprof & 
```

To run the uninstrumented program with TAU.

{% img "/img/e4s-tau.png", "1200px" %}