---
layout: layouts/page.njk
title: Tutorial for DPRNG
author: Timothy Kaler
date: 2022-12-09T21:21:12.291Z
attribution: true
---
OpenCilk 2.0 is a programming framework that supports both pedigrees and deterministic pseudorandom number generation (DPRNG). To enable these features in a Cilk program, simply link the program with the `-lopencilk-pedigrees` library. No recompiling is necessary.

There are three options for using DPRNG with OpenCilk 2.0:

1. Use the OpenCilk runtime's built-in DPRNG. To generate a pseudorandom number, call the `__cilkrts_get_dprand()` function. This function returns a 64-bit unsigned integer, although the return value will be one of 2^64-59 possible results. The pseudorandom number generator can be reseeded at the beginning of the program by calling `__cilkrts_dprand_set_seed(seed)`, where `seed` is a 64-bit unsigned integer. The `__cilkrts_get_dprand()` function is easy to use and fast, but it offers only limited control over the DPRNG.
2. Use an existing DPRNG library that uses pedigrees. The only known such library is the DotMix implementation from CilkPub. CilkPub is implemented entirely in C++, so it may not be useful for programs written in other languages.
3. Write your own DPRNG library that uses pedigrees. The library can read the pedigree of the current strand by calling `__cilkrts_get_pedigree()`, which returns the pedigree as a singly-linked list. This option allows for flexible implementation of a new DPRNG in C or C++, but it may be more complicated than necessary.

Here is a usage example for implementing DPRNG with OpenCilk 2.0 using the built-in pseudorandom number generator:

```cilkcpp#
#include <stdio.h>
#include <stdint.h>
#include <cilk/cilk.h>
#include <math.h>
#include <cilk/reducer_opadd.h>

// Generate a pseudorandom number using the built-in DPRNG in OpenCilk 2.0
uint64_t generate_random_number() {
  return __cilkrts_get_dprand();
}

// Reseed the built-in DPRNG in OpenCilk 2.0
void reseed_dprng(uint64_t seed) {
  __cilkrts_dprand_set_seed(seed);
}

// Identity function for the reducer
void zero(void *v) {
  *(int *)v = 0;
}

// Reduce function for the reducer
void plus(void *l, void *r) {
  *(int *)l += *(int *)r;
}

int main() {
  // Reseed the DPRNG with a value of 12345
  reseed_dprng(12345);

  // Set the number of iterations to use for the Monte Carlo simulation
  int num_iterations = 1000000;

  // Set the radius of the circle
  double radius = 1.0;

  // Create reducer objects for the counters for the number of points inside and outside the circle
  int cilk_reducer(zero, plus) inside_circle = 0;
  int cilk_reducer(zero, plus) outside_circle = 0;

  // Run the Monte Carlo simulation in parallel
  cilk_for(int i = 0; i < num_iterations; i++) {
    // Generate two pseudorandom numbers for the x and y coordinates
    double x = (double)generate_random_number() / UINT64_MAX;
    double y = (double)generate_random_number() / UINT64_MAX;

    // Compute the distance of the point from the origin
    double dist = sqrt(x * x + y * y);

    // Increment the counter for points inside or outside the circle based on the distance
    if (dist <= radius) {
      inside_circle++;
    } else {
      outside_circle++;
    }
  }

  // Compute the ratio of points inside the circle to
  // the total number of points
  double ratio = (double)inside_circle / (double)(inside_circle + outside_circle);

  // Use this ratio to compute an estimate of pi
  double pi_estimate = 4.0 * ratio;

  // Print the result
  printf("Estimate of pi: %.10f\n", pi_estimate);

  return 0;
}

```

The example above runs a Monte Carlo simulation to generate points in a two-dimensional plane. The points are generated using the `generate_random_number()` function, which uses the `__cilkrts_get_dprand()` function to generate pseudorandom numbers. The coordinates of the points are computed by scaling the pseudorandom numbers to the range $\[0, 1]$. The distance of each point from the origin is then computed, and the point is counted as inside or outside the circle with radius 1 based on its distance from the origin. After all points have been generated and counted, the ratio of points inside the circle to the total number of points is computed and used to estimate the value of $\pi$. The result is printed to the console.\
\
This example uses the `cilk_opadd_reducer` reducer type to avoid race conditions on the `inside_circle` and `outside_circle` counters. These counters are now declared as reducer objects, and the `++` operator is used to increment them in the parallel loop. The final value of the counters can be accessed by calling the `get_value()` method on the reducer objects. This ensures that the counters are updated atomically and that their values are consistent across all strands.