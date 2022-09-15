---
title: Defns
---
{{ collections.defnTerms | log }}
{% for key, value in collections.defnTerms %}
{{ key }} : {{ value }}
{% endfor %}

```cilkc
void qsort(int* begin, int* end) {
  if (begin < end) {
    int last = *(end - 1);                              // get last element
    int * middle = partition(begin, end - 1, last);     // partition and return ptr to first elem >= last
    swap((end - 1), middle);                            // move pivot to middle

    qsort(middle+1, end);                               // sort lower partition
    qsort(begin, middle);                               // sort upper partition (excluding pivot)

  }
}
```

```cilkc
void m_mult(m_t A, m_t B, m_t C) {
    for (int i = 0; i < A.rows; ++i) {
        for (int j = 0; j < B.cols; ++j) {
            for (int k = 0; k < A.cols; ++k)
                C[i][j] += A[i][k] * B[k][j];
        }
    }
} 
```

```cilkc
void p_m_mult(m_t A, m_t B, m_t C) {
    cilk_for (int i = 0; i < A.rows; ++i) {
     cilk_for (int j = 0; j < B.cols; ++j) {
      for (int k = 0; k < A.cols; ++k)
        C[i][j] += A[i][k] * B[k][j];
        }
    }
} 
```