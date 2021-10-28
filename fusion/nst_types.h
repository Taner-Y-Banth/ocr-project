#ifndef NST_TYPES_H
#define NST_TYPES_H
#include <float.h>
#include <math.h>

#define MAX_OUTPUT_EVENTS 16
#define NST_EVENT_MAX_VALUES_COUNT 16

#define MAX(x, y) (((x) > (y)) ? (x) : (y))
#define MIN(x, y) (((x) < (y)) ? (x) : (y))

typedef struct {
    double timestamp;
    unsigned int id;
    int values_count;
    double values[NST_EVENT_MAX_VALUES_COUNT];
} nst_event_t;


typedef struct {
    double threshold;
} nst_data_t;



#endif