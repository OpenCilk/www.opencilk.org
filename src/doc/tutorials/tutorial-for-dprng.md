---
layout: layouts/page.njk
title: Tutorial for DPRNG
author: Timothy Kaler
date: 2022-12-09T21:21:12.291Z
attribution: true
---
```
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

int main() {
  // Reseed the DPRNG with a value of 12345
  reseed_dprng(12345);

  // Set the number of iterations to use for the Monte Carlo simulation
  int num_iterations = 1000000;

  // Set the radius of the circle
  double radius = 1.0;

  // Create reducer objects for the counters for the number of points inside and outside the circle
  cilk::opadd_reducer<int> inside_circle;
  cilk::opadd_reducer<int> outside_circle;

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

// Compute the ratio of points inside the circle to the total number of points
double ratio = (double)inside_circle.get_value() / (double)(inside_circle.get_value() + outside_circle.get_value());

// Use this ratio to compute an estimate of pi
double pi_estimate = 4.0 * ratio;

// Print the result
printf("Estimate of pi: %.10f\n", pi_estimate);

return 0;
}

```