#include "nst_main.h"
#include <math.h>
#include <stdio.h>

void algorithm_init()
{
  printf("algorithm_init");
}

void algorithm_update(const nst_event_t input_event, nst_event_t output_events[MAX_OUTPUT_EVENTS], int *output_events_count)
{
  printf("algorithm_update");
}
