.. meta::
    :author: Cask Data, Inc.
    :description: HTTP RESTful Interface to the Cask Data Application Platform
    :copyright: Copyright © 2014-2016 Cask Data, Inc.

.. _http-restful-api-metrics:

========================
Metrics HTTP RESTful API
========================

.. highlight:: console

Use the CDAP Metrics HTTP RESTful API to retrieve the metrics created and saved by CDAP.

As applications process data, CDAP collects metrics about the application’s behavior and
performance. Some of these metrics are similar for every application |---| how many events are
processed, how many data operations are performed, etc. |---| and are thus called **system** or CDAP
metrics.

Other metrics are **user-defined** and differ from application to application. 
For details on how to add metrics to your application, see the section  
:ref:`Administration Manual: User-Defined Metrics <operations-metrics>`.

.. Base URL explanation
.. --------------------
.. include:: base-url.txt


Metrics Data
============

Metrics data is identified by a combination of **context** and **name**.

A **metrics context** consists of a collection of tags. 
Each tag is composed of a *tag name* and a *tag value*.

Metrics contexts are hierarchal, rooted in the CDAP instance, and extend through
namespaces, applications, and down to the individual components.

For example, the metrics context::

  namespace:default app:PurchaseHistory flow:PurchaseFlow
  
is a context that identifies a flow. It has a parent context,
``namespace:default app:PurchaseHistory``, which identifies the parent application.

Each level of the context is described by a pair |---| composed of a tag name and a value
|---| such as:

- ``namespace:default`` (tag name: *namespace*, value: *default*)
- ``app:PurchaseHistory`` (tag name: *app*, value: *PurchaseHistory*)
- ``flow:PurchaseFlow`` (tag name: *flow*, value: *PurchaseFlow*)

A **metrics name** is either a name generated by CDAP, and pre-pended with ``system``, or 
is a name set by a developer when writing an application, which are pre-pended with ``user``.

The **system metrics** vary depending on the context; a list is available of :ref:`common
system metrics <available-system-metrics>` for different contexts. 

**User metrics** are defined by the application developer and thus are completely
dependent on what the developer sets.

In both cases, searches using this API will show |---| for a given context |---| all
available metrics.


Available Contexts
------------------
The context of a metric is typically enclosed into a hierarchy of contexts. For example,
the flowlet context is enclosed in the flow context, which in turn is enclosed in the
application context. A metric can always be queried (and aggregated) relative to any
enclosing context. 

The *consumer* context relates to entities that are a recipient of events, typically a
flowlet. A consumer flowlet is the recipient of a queue. Conversely, *producers* are
entities that emits events, such as a stream or a flowlet. Flowlets can at the same time
be both consumers and producers. The difference between the total of a producer's events and the
consumed events is the :ref:`pending events <http-restful-api-metrics-pending>`.

These are the available application contexts of CDAP:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - System Metric
     - Context
   * - One Run of a flowlet
     - ``namespace:<namespace-id> app:<app-id> flow:<flow-id> flowlet:<flowlet-id> run:<run-id>``
   * - One flowlet of a flow
     - ``namespace:<namespace-id> app:<app-id> flow:<flow-id> flowlet:<flowlet-id>``
   * - All flowlets of a flow
     - ``namespace:<namespace-id> app:<app-id> flow:<flow-id>``
   * - All flowlets of all flows of an application
     - ``namespace:<namespace-id> app:<app-id> flow:*``
   * - All Mappers of a MapReduce
     - ``namespace:<namespace-id> app:<app-id> mapreduce:<mapreduce-id> tasktype:m``
   * - All Reducers of a MapReduce
     - ``namespace:<namespace-id> app:<app-id> mapreduce:<mapreduce-id> tasktype:r``
   * - One Run of a MapReduce
     - ``namespace:<namespace-id> app:<app-id> mapreduce:<mapreduce-id> run:<run-id>``
   * - One MapReduce
     - ``namespace:<namespace-id> app:<app-id> mapreduce:<mapreduce-id>``
   * - All MapReduce of an application
     - ``namespace:<namespace-id> app:<app-id> mapreduce:*``
   * - One service
     - ``namespace:<namespace-id> app:<app-id> service:<service-id>``
   * - All services of an application
     - ``namespace:<namespace-id> app:<app-id> service:*``
   * - One Spark program
     - ``namespace:<namespace-id> app:<app-id> spark:<spark-id>``
   * - All Spark programs of an application
     - ``namespace:<namespace-id> app:<app-id> spark:*``
   * - One worker
     - ``namespace:<namespace-id> app:<app-id> worker:<worker-id>``
   * - All workers of an application
     - ``namespace:<namespace-id> app:<app-id> workers:*``
   * - All components of an application
     - ``namespace:<namespace-id> app:<app-id>``
   * - All components of all applications
     - ``namespace:<namespace-id> app:*``

Stream metrics are only available at the stream level and the only available context is:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Stream Metric
     - Context
   * - A single stream
     - ``namespace:<namespace-id> stream:<stream-id>``

Dataset metrics are available at the dataset level, but they can also be queried down to the
flowlet, worker, service, Mapper, or Reducer level:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Dataset Metric
     - Context
   * - A single dataset in the context of a single flowlet
     - ``namespace:<namespace-id> dataset:<dataset-id> app:<app-id> flow:<flow-id> flowlet:<flowlet-id>``
   * - A single dataset in the context of a single flow
     - ``namespace:<namespace-id> dataset:<dataset-id> app:<app-id> flow:<flow-id>``
   * - A single dataset in the context of a specific application
     - ``namespace:<namespace-id> dataset:<dataset-id> app:<app-id>``
   * - A single dataset
     - ``namespace:<namespace-id> dataset:<dataset-id>``
   * - All datasets
     - ``namespace:<namespace-id> dataset:*``

.. _available-system-metrics:

Available System Metrics
------------------------
**Note:** A user metric may have the same name as a system metric; they are distinguished 
by prepending the respective prefix when querying: ``user`` or ``system``.

These metrics are available in a dataset context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Dataset Metric
     - Description
   * - ``system.dataset.store.bytes``
     - Number of bytes written
   * - ``system.dataset.store.ops``
     - Operations (reads and writes) performed
   * - ``system.dataset.store.reads``
     - Read operations performed
   * - ``system.dataset.store.writes``
     - Write operations performed

These metrics are available in a flowlet context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Flowlet Metric
     - Description
   * - ``system.process.errors``
     - Number of errors while processing
   * - ``system.process.events.processed``
     - Number of events/data objects processed
   * - ``system.process.events.in``
     - Number of events read in by the flowlet
   * - ``system.process.events.out``
     - Number of events emitted by the flowlet
   * - ``system.process.tuples.read``
     - Number of tuples read by the flowlet
   * - ``system.dataset.store.bytes``
     - Number of bytes written to datasets
   * - ``system.dataset.store.ops``
     - Operations (writes and read) performed on datasets
   * - ``system.dataset.store.reads``
     - Read operations performed on datasets
   * - ``system.dataset.store.writes``
     - Write operations performed on datasets

These metrics are available in a Mappers or Reducers context (specify whether a Mapper or
Reducer context is desired, as shown above):

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Mappers or Reducers Metric
     - Description
   * - ``system.process.completion``
     - A number from 0 to 100 indicating the progress of the Map or Reduce phase
   * - ``system.process.entries.in``
     - Number of entries read in by the Map or Reduce phase
   * - ``system.process.entries.out``
     - Number of entries written out by the Map or Reduce phase

These metrics are available in a service context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Service Metric
     - Description
   * - ``system.requests.count``
     - Number of requests made to the service
   * - ``system.response.successful.count``
     - Number of successful requests completed by the service
   * - ``system.response.server.error.count``
     - Number of failures seen by the service

These metrics are available in a Spark context, where ``<spark-id>``
depends on the Spark program being queried:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Spark Metric
     - Description
   * - ``system.<spark-id>.driver.BlockManager.disk.diskSpaceUsed_MB``
     - Disk space used by the Block Manager
   * - ``system.<spark-id>.driver.BlockManager.memory.maxMem_MB``
     - Maximum memory given to the Block Manager
   * - ``system.<spark-id>.driver.BlockManager.memory.memUsed_MB``
     - Memory used by the Block Manager
   * - ``system.<spark-id>.driver.BlockManager.memory.remainingMem_MB``
     - Memory remaining to the Block Manager
   * - ``system.<spark-id>.driver.DAGScheduler.job.activeJobs``
     - Number of active jobs
   * - ``system.<spark-id>.driver.DAGScheduler.job.allJobs``
     - Total number of jobs
   * - ``system.<spark-id>.driver.DAGScheduler.stage.failedStages``
     - Number of failed stages
   * - ``system.<spark-id>.driver.DAGScheduler.stage.runningStages``
     - Number of running stages
   * - ``system.<spark-id>.driver.DAGScheduler.stage.waitingStages``
     - Number of waiting stages

These metrics are available in a stream context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Stream Metric
     - Description
   * - ``system.collect.events``
     - Number of events collected by the stream
   * - ``system.collect.bytes``
     - Number of bytes collected by the stream


These metrics are available for services, for the system services component context or the user services context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Request and Response Metric
     - Description
   * - ``system.request.received``
     - Number of requests received for the service
   * - ``system.response.successful``
     - Number of successful responses sent
   * - ``system.response.{server-error, client-error}``
     - Number of ``server-error`` or ``client-error`` responses sent


These metrics are available for every application context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Application Logging Metric
     - Description
   * - ``system.app.log.{error, info, warn}``
     - Number of ``error``, ``info``, or ``warn`` log messages logged by the application


These metrics are available for the system services, in the system component context:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - System Services Logging Metric
     - Description
   * - ``system.services.log.{error, info, warn}``
     - Number of ``error``, ``info``, or ``warn`` log messages logged by the system services

These metrics are available for the CDAP transaction service:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - Transaction Metric
     - Description
   * - ``system.start.{short, long}``
     - Number of ``short`` or ``long`` transactions started
   * - ``system.start.{short, long}.latency``
     - Time taken (in milliseconds) to start ``short`` or ``long`` transactions
   * - ``system.wal.append.count``
     - Number of transaction edits added to the write-ahead log
   * - ``system.{canCommit, commit, committed, inprogress, invalidate, abort}``
     - Number of transactions in a specified transaction state
   * - ``system.{canCommit, commit, committed, inprogress, invalidate, abort}.latency``
     - Time taken (in milliseconds) to perform a specified transaction state update
   * - ``system.{invalid, committing, committed, inprogress}.size``
     - Number of transactions of a specified type that are active

These metrics are available for the YARN cluster resources:

.. list-table::
   :header-rows: 1
   :widths: 60 40

   * - YARN Cluster Metric
     - Description
   * - ``system.resources.{total, available, used}.memory``
     - Size (in megabytes) of total, available, or used cluster memory
   * - ``system.resources.{total, available, used}.vcores``
     - Number of total, available, or used cluster virtual cores

Searches and Queries
====================

The process of retrieving a metric involves these steps:

1. Obtain (usually through a search) the correct context for a metric;
#. Obtain (usually through a search within the context) the available metrics;
#. Querying for a specific metric, supplying the context and any parameters.

.. _http-restful-api-metrics-search-for-contexts:

Search for Contexts
-------------------

To search for the available contexts, perform an HTTP request::

  POST /v3/metrics/search?target=tag[&tag=<context>]

The optional ``<context>`` defines a metrics context to search within. If it is not
provided, the search is performed across all data. The available contexts that are returned
can be used to query for a lower-level of contexts.

You can also define the query to search in a given context across all values of one or
more tags provided in the context by specifying ``*`` as a value for a tag. See the
examples below for its use.

**Note:** An earlier version of this API (introduced in CDAP 2.8.0) has been deprecated, and
should be replaced, as it will be removed in a later version of CDAP::

  POST /v3/metrics/search?target=childContext[&context=<context>]

.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``context`` *[Optional]*
     - Metrics context to search within. If not provided, the search is provided across
       all contexts. Consists of a collection of tags.
       
.. rubric:: Examples

.. list-table::
   :widths: 20 80
   :stub-columns: 1

   * - HTTP Method
     - ``POST /v3/metrics/search?target=tag``
   * - Returns
     - ``[{"name":"namespace","value":"default"},{"name":"namespace","value":"system"}]``
   * - Description
     - Returns all first-level tags; in this case, two namespaces.
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/search?target=tag&tag=namespace:default``
   * - Returns
     - | ``[{"name":"app","value":"HelloWorld"},{"name":"app","value":"PurchaseHistory"},``
       | `` {"name":"component","value":"gateway"},{"name":"dataset","value":"frequentCustomers"},``
       | `` {"name":"dataset","value":"history"},{"name":"dataset","value":"purchases"},``
       | `` {"name":"dataset","value":"userProfiles"},{"name":"dataset","value":"whom"},``
       | `` {"name":"stream","value":"purchaseStream"},{"name":"stream","value":"who"}]``
   * - Description
     - Returns all tags of the of the given parent context; in this case, all entities in the default namespace.
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/search?target=tag&tag=``
       ``namespace:default&tag=app:PurchaseHistory&tag=flow:PurchaseFlow&tag=run:*``
   * - Returns
     - ``[{"name":"flowlet","value":"collector"},{"name":"flowlet","value":"reader"}]``
   * - Description
     - Queries all available contexts within the *PurchaseHistory*'s *PurchaseFlow* for any run; 
       in this case, it returns all available flowlets.

.. _http-restful-api-metrics-search-for-metrics:

Search for Metrics
------------------

To search for the available metrics within a given context, perform an HTTP POST request::

  POST /v3/metrics/search?target=metric&tag=<context>


.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``context``
     - Metrics context to search within. Consists of a collection of tags.
     
**Note:** An earlier version of this API (introduced in CDAP 2.8.0) has been deprecated, and
should be replaced, as it will be removed in a later version of CDAP::

  POST /v3/metrics/search?target=metric&context=<context>

.. rubric:: Example

.. list-table::
   :widths: 20 80
   :stub-columns: 1

   * - HTTP Method
     - ``POST /v3/metrics/search?target=metric&tag=namespace:default&tag=app:PurchaseHistory``
   * - Returns
     - | ``["system.process.events.in","system.process.events.processed","system.process.instance",``
       | `` "system.process.tuples.attempt.read","system.process.tuples.read"]``
   * - Description
     - Returns all metrics in the context of the application *PurchaseHistory* of the
       *default* namespace; in this case, returns a list of system and (possibly) user-defined metrics.
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/search?target=metric&tag=namespace:default&tag=app:HelloWorld&tag=service:Greeting``
   * - Returns
     - | ``["system.dataset.store.ops","system.dataset.store.reads","system.requests.count",``
       | `` "system.response.successful.count",``
       | `` "user.greetings.count.jane_doe"]``
   * - Description
     - Returns all metrics in the context of the service *Greeting* of the application *HelloWorld* of the
       *default* namespace; in this case, returns a list of system and user-defined metrics.
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/search?target=metric&tag=namespace:default&tag=app:HelloWorld&tag=flow:WhoFlow&tag=flowlet:saver``
   * - Returns
     - | ``["system.dataset.store.bytes","system.dataset.store.ops","system.dataset.store.writes",``
       | `` "system.process.events.in","system.process.events.processed","system.process.instance",``
       | `` "system.process.tuples.attempt.read","system.process.tuples.read","system.store.bytes",``
       | `` "system.store.ops","system.store.writes","user.names.bytes"]``
   * - Description
     - Returns all metrics in the context of the flowlet *saver* of the application *HelloWorld* of the
       *default* namespace; in this case, returns a list of system and user-defined metrics.

.. _http-restful-api-metrics-querying-a-metric:

Querying a Metric
=================

Once you know the context and the metric to query, you can formulate a request for the
metrics data. 

In general, a metrics query is performed by making an HTTP POST request, with parameters
supplied either in the URL or in the body of the request. If you submit the parameters in
the body, you can make multiple queries with a single request.

Metric parameters include:

- tag values for filtering by context;
- metric names (multiple metric names can be queried in each request);
- time range or ``aggregate=true`` for an aggregated result; and
- tag values for grouping results (optional)

To query a metric within a given context, perform an HTTP POST request::

  POST /v3/metrics/query?tag=<context>&metric=<metric>&<time-range>[&groupBy=<tags>]

.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Parameter
     - Description
   * - ``context``
     - Metrics context to search within, a collection of tags
   * - ``metric``
     - Metric(s) being queried, a collection of metric names
   * - ``time-range``
     - A :ref:`time range <http-restful-api-metrics-time-range>` or ``aggregate=true`` for 
       all since the application was deployed
   * - ``tags`` *(optional)*
     - :ref:`Tag list <http-restful-api-metrics-groupby>` by which to group results (optional)

**Note:** An earlier version of this API (introduced in CDAP 2.8.0) has been deprecated, and
should be replaced, as it will be removed in a later version of CDAP::

  POST /v3/metrics/query?context=<context>[&groupBy=<tags>]&metric=<metric>&<time-range>

Query Examples
--------------

.. list-table::
   :widths: 20 80
   :stub-columns: 1

   * - HTTP Method
     - ``POST /v3/metrics/query?tag=namespace:default&tag=app:HelloWorld&tag=flow:WhoFlow``
       ``&tag=flowlet:saver&metric=system.process.events.processed&aggregate=true``
   * - Returns
     - ``{"startTime":0,"endTime":1429327964,"series":[{"metricName":"system.process.events.processed","grouping":{},"data":[{"time":0,"value":1}]}]}``
   * - Description
     - Using a *System* metric, *system.process.events.processed*
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/query?tag=namespace:default&tag=app:HelloWorld&tag=flow.WhoFlow``
       ``&tag=run:13ac3a50-a435-49c8-a752-83b3c1e1b9a8&tag=flowlet:saver&metric=user.names.bytes&aggregate=true``
   * - Returns
     - ``{"startTime":0,"endTime":1429328212,"series":[{"metricName":"user.names.bytes","grouping":{},"data":[{"time":0,"value":8}]}]}``
   * - Description
     - Querying the *User-defined* metric *names.bytes*, of the flowlet *saver*, by its run-ID
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/query?tag=namespace:default&tag=app:HelloWorld&tag=flow:WhoFlow&metric=user.names.bytes``
   * - Returns
     - ``{"startTime":0,"endTime":1429475995,"series":[]}``
   * - Description
     - Using a *User-defined* metric, *names.bytes* in a service's Handler, called before any data entered, returning an empty series
   * - 
     - 
   * - HTTP Method
     - ``POST /v3/metrics/query?tag=namespace:default&tag=app:HelloWorld&tag=flow:WhoFlow&metric=user.names.bytes``
   * - Returns
     - ``{"startTime":0,"endTime":1429477901,"series":[{"metricName":"user.names.bytes","grouping":{},"data":[{"time":0,"value":44}]}]}``
   * - Description
     - Using a *User-defined* metric, *names.bytes* in a service's Handler


Query Results
-------------

Results from a query are returned as a JSON string, in the format::

  {"startTime":<start-time>, "endTime":<end-time>, "series":<series-array>}

.. list-table::
   :widths: 20 80
   :header-rows: 1

   * - Name
     - Description
   * - ``start-time``
     - Start time, in seconds, with 0 being from the beginning of the query records
   * - ``metric``
     - End time, in seconds
   * - ``series-array``
     - An array of metric results, which can be one series, a multiple time series, or
       none (an empty array)

If a particular metric has no value, a query will return an empty array in the
``"series"`` of the results, such as::

  {"startTime":0,"endTime":1429475995,"series":[]}
    
You can also receive such a result from querying a metric that does not exist, either
because it does not exist at the context given or if the query is incorrectly
formulated:
  
  ``...metric=user.names.bytes?aggregate=true``
  
will return the empty result, as the metric name will be interpreted as
``"user.names.bytes?aggregate=true"`` instead of ``"user.names.bytes"``.


.. _http-restful-api-v3-metrics-multiple:
.. _http-restful-api-metrics-multiple:

Querying for Multiple Metrics
-----------------------------

Retrieving multiple metrics at once can be accomplished by issuing an HTTP POST request
with a JSON list as the request body that enumerates the name and attributes for each
metric. The format of the request and the JSON body depends on whether the metrics share
the same context or are being called for different contexts. 

Multiple Metrics with the Same Context
......................................
Retrieving multiple metrics at once for the same contexts can be accomplished by issuing a
request as in previous examples, but providing the additional metrics. For example::

  POST /v3/metrics/query?tag=flow:CountRandom&metric=system.process.events.processed
    &metric=system.dataset.store.bytes&start=now-5s&count=5

The result (pretty-printed to fit) would be::

  {"startTime":1429487786,
   "endTime":1429487791,
   "series":[{"metricName":"system.process.events.processed",
              "grouping":{},
              "data":[{"time":1429487786,"value":1268},
                      {"time":1429487787,"value":1324},
                      {"time":1429487788,"value":1206},
                      {"time":1429487789,"value":1125},
                      {"time":1429487790,"value":1035}]},
             {"metricName":"system.dataset.store.bytes",
              "grouping":{},
              "data":[{"time":1429487786,"value":15600},
                      {"time":1429487787,"value":14998},
                      {"time":1429487788,"value":13712},
                      {"time":1429487789,"value":12246},
                      {"time":1429487790,"value":9924}]
              }]
  }

Multiple Metrics with Different Contexts
........................................
Retrieving multiple metrics at once for different contexts can be accomplished by issuing
a request with a JSON list as the request body that enumerates the name, attributes and
context for each metric. Use an HTTP POST request:: 

  POST /v3/metrics/query

with the arguments as a JSON string in the body. The format of the JSON follows this
structure (pretty-printed)::

  { “query1”: {
        tags: {“namespace”: “default”, “app”: “PurchaseHistory”}, 
        metrics: [“metric1”, “metric2”],
        groupBy: [“app”, “dataset”],
        timeRange: {“aggregate”: “true”}
        },
    “query2”: {
        tags: {“namespace”: “default”},
        metrics: [“metric1”, “metric2”],
        timeRange: {“start”: “now­2s”, “end”: “now”}
        }
  }

Queries are identified by a ``<query-id>`` (in the example above, *query1*, *query2*; in
the example below, *eventsIn*, *eventsOut*). The ``<query-id>`` is then used in the
returned result to identify the series.

For example, to retrieve multiple metrics using a ``curl`` call (command and results reformatted to fit)::

  $ curl -w'\n' -X POST 'http://localhost:11015/v3/metrics/query' -H 'Content-Type: application/json' \
      -d '{"eventsIn":{"tags": {"flow":"CountRandom"}, "metrics": ["system.process.events.in"], 
                       "timeRange": {"start":"now-5s", "count":"5"} }, 
           "eventsOut":{"tags": {"flow":"CountRandom"}, "metrics": ["system.process.events.out"],
                        "timeRange": {"start":"now-5s", "count":"5"} }
          }'

  {"eventsIn":{"startTime":1429593961,"endTime":1429593966,
               "series":[{"metricName":"system.process.events.in","grouping":{},
                          "data":[{"time":1429593961,"value":2828},
                                  {"time":1429593962,"value":3218},
                                  {"time":1429593963,"value":3419},
                                  {"time":1429593964,"value":3593},
                                  {"time":1429593965,"value":3990}]
                         }]
              },
   "eventsOut":{"startTime":1429593961,"endTime":1429593966,
                "series":[{"metricName":"system.process.events.out","grouping":{},
                           "data":[{"time":1429593961,"value":3211},
                                   {"time":1429593962,"value":3865},
                                   {"time":1429593963,"value":3919},
                                   {"time":1429593964,"value":3906},
                                   {"time":1429593965,"value":3993}]
                          }]
              }               
  }

If the context of the requested metric or metric itself doesn't exist, the system returns a
status 200 (OK) with JSON formed following the above description, with an empty ``series`` for values::

  {"query1":{"startTime":1429486465,"endTime":1429486470,"series":[]}}


.. _http-restful-api-metrics-groupby:

Querying for Multiple Time-series
---------------------------------

In a query, the optional ``groupBy`` parameter defines a list of tags whose values are
used to build multiple timeseries. All data points that have the same values in tags
specified in the ``groupBy`` parameter will form a single timeseries. You can define
multiple tags for grouping by providing a list, similar to a tag combination list.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Tag List
     - Description
   * - ``groupBy=app``
     - Retrieves the time series for each application
   * - ``groupBy=flowlet``
     - Retrieves the time series for each flowlet
   * - ``groupBy=app&groupBy=flow``
     - Retrieves a time series for each App and flow combination

An example method (re-formatted to fit)::

  POST /v3/metrics/query?tag=namespace:default&tag=app:PurchaseHistory&
    groupBy=flow&metric=user.customers.count&start=now-2s&end=now

returns the *user.customers.count* metric in the context of the application
*PurchaseHistory* of the *default* namespace, for the specified time range, and grouped by
``flow`` (results reformatted to fit)::

  {
    "startTime": 1421188775,
    "endTime": 1421188777,
    "series": [
      {
        "metricName": "user.customers.count",
        "grouping": { "flow": "PurchaseHistoryFlow" },
        "data": [
          { "time": 1421188776, "value": 3 },
          { "time": 1421188777, "value": 2 }
        ]
      },
      {
        "metricName": "user.customers.count",
        "grouping": { "flow": "PurchaseAnalysisFlow" },
        "data": [
          { "time": 1421188775, "value": 1 },
          { "time": 1421188777, "value": 2 }
        ]
      }
    ]
  }

.. _http-restful-api-metrics-time-range:

Querying by a Time Range
------------------------
The time range of a metric query can be specified in various ways: either
``aggregate=true`` to retrieve the total aggregated since the application was deployed
or |---| in the case of dataset metrics |---| since a dataset was created; 
or as a ``start`` and ``end`` to define a specific range and return a series of data points.

By default, queries without a time range retrieve a value based on ``aggregate=true``.

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Parameter
     - Description
   * - ``aggregate=true``
     - Total aggregated value for the metric since the application was deployed.
       If the metric is a gauge type, the aggregate will return the latest value set for 
       the metric.
   * - ``start=<time>&end=<time>``
     - Time range defined by start and end times, where the times are either in seconds
       since the start of the Epoch, or a relative time, using ``now`` and times added to it.
   * - ``count=<count>``
     - Number of time intervals since start with length of time interval defined by *resolution*. 
       If ``count=60`` and ``resolution=1s``, the time range would be 60 seconds in length.
   * - ``resolution=[1s|1m|1h|auto]``
     - Time resolution in seconds, minutes or hours; or if "auto", one of ``{1s, 1m, 1h}``
       is used based on the time difference.

With a specific time range, a ``resolution`` can be included to retrieve a series of data
points for a metric. By default, 1 second resolution is used. Acceptable values are noted
above. If ``resolution=auto``, the resolution will be determined based on a time
difference calculated between the start and end times:

- ``(endTime - startTime) > 36000 seconds`` (ten hours), resolution will be 1 hour; 
- ``(endTime - startTime) >  600 seconds`` (ten minutes), resolution will be 1 minute; 
- otherwise, resolution will be 1 second.

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Time Range
     - Description
   * - ``start=now-30s&end=now``
     - The last 30 seconds. The start time is given in seconds relative to the current time.
       You can apply simple math, using ``now`` for the current time, 
       ``s`` for seconds, ``m`` for minutes, ``h`` for hours and ``d`` for days. 
       For example: ``now-5d-12h`` is 5 days and 12 hours ago.
   * - ``start=1385625600&`` ``end=1385629200``
     - From ``Thu, 28 Nov 2013 08:00:00 GMT`` to ``Thu, 28 Nov 2013 09:00:00 GMT``,
       both given as since the start of the Epoch.
   * - ``start=1385625600&`` ``count=3600&`` ``resolution=1s``
     - The same as before, the count given as a number of time intervals, each 1 second.
   * - ``start=1385625600&`` ``end=1385629200&`` ``resolution=1m``
     - From ``Thu, 28 Nov 2013 08:00:00 GMT`` to ``Thu, 28 Nov 2013 09:00:00 GMT``,
       with 1 minute resolution, will return 61 data points with metrics aggregated for each minute.
   * - ``start=1385625600&`` ``end=1385632800&`` ``resolution=1h``
     - From ``Thu, 28 Nov 2013 08:00:00 GMT`` to ``Thu, 28 Nov 2013 10:00:00 GMT``,
       with 1 hour resolution, will return 3 data points with metrics aggregated for each hour.

Example::

  POST /v3/metrics/query?tag=namespace:default&tag=app:CountRandom&
    metric=system.process.events.processed&start=now-1h&end=now&resolution=1m

This will return the value of the metric *system.process.events.processed* for the last
hour at one-minute intervals.

For aggregates, you cannot specify a time range. As an example, to return the total number
of input objects processed since the application *CountRandom* was deployed, assuming that
CDAP has not been stopped or restarted::

  POST /v3/metrics/query?tag=namespace:default&tag=app:CountRandom
    &metric=system.process.events.processed&aggregate=true

If a metric is a gauge type, the aggregate will return the latest value set for the metric.
For example, this request will retrieve the completion percentage for the map-stage of the MapReduce
``PurchaseHistoryBuilder`` (reformatted to fit)::

  POST /v3/metrics/query?tag=namespace:default&tag=app:PurchaseHistory
    &tag=mapreduce:PurchaseHistoryBuilder&tage=tasktype:m&metric=system.process.completion&aggregate=true
    
  {"startTime":0,"endTime":1429497700,"series":[{"metricName":"system.process.completion",
   "grouping":{},"data":[{"time":0,"value":100}]}]} 

 
.. _http-restful-api-metrics-querying-by-run-id:

Querying by Run-ID
------------------
Each execution of an program (flow, MapReduce, Spark, service, worker) has an :ref:`associated 
run-ID <rest-program-runs>` that uniquely identifies that program's run. We can query 
metrics for a program by its run-ID to retrieve the metrics for a particular run. Please see 
the :ref:`Run Records and Schedule <rest-program-runs>` on retrieving active and historical
program runs.

When querying by ``run-ID``, it is specified in the context |---| in the collection of tags |---|
after the ``program-id`` with the tag ``run``::

  ...app:<app-id>&tag=<program-type>:<program-id>&tag=run:<run-id>

Examples of using a run-ID (with both commands and results reformatted to fit)::

  POST /v3/metrics/query?tag=namespace:default&tag=app:PurchaseHistory&tag=flow:PurchaseFlow
      &tag=run:364-789-1636765&metric=system.process.events.processed
  
  {"startTime":0,"endTime":1429498228,"series":[{"metricName":"system.process.events.processed",
   "grouping":{},"data":[{"time":0,"value":10}]}]}
  
  POST /v3/metrics/query?tag=namespace:default&tag=app:PurchaseHistory&tag=mapreduce:
      PurchaseHistoryBuilder&tag=run:453-454-447683&tag=tasktype:m&metric=system.process.completion

  {"startTime":0,"endTime":1429498425,"series":[{"metricName":"system.process.completion",
   "grouping":{},"data":[{"time":0,"value":100}]}]}
   
  
  POST /v3/metrics/query?tag=namespace:default&tag=app:CountRandom&tag=flow:CountRandom&tag=run:
    bca50436-9650-448e-9ab1-f1d186eb2285&tag=flowlet:splitter&metric=system.process.events.processed&aggregate=true

The last example will return (where ``"time"=0`` means aggregated total number, and ``endTime`` is
the time of the query) something similar to::

  {"startTime":0,"endTime":1421188775,"series":[{"metricName":"system.process.events.processed",
   "grouping":{},"data":[{"time":0,"value":11188}]}]}

Query Tips
----------

- To retrieve the number of input data objects (“events”) processed by the flowlet named *splitter*,
  in the flow *CountRandom* of the example application *CountRandom*, over the last 5 seconds, you can issue an HTTP
  POST method::

    POST /v3/metrics/query?tag=namespace:default&tag=app:CountRandom&tag=flow:CountRandom
      &tag=flowlet:splitter&metric=system.process.events.processed&start=now-5s&count=5

  This returns a JSON response that has one entry for every second in the requested time interval. It will have
  values only for the times where the metric was actually emitted (shown here "pretty-printed")::

    {
      "startTime": 1427225350,
      "endTime": 1427225354,
      "series": [
        {
          "metricName": "system.process.events.processed",
          "grouping": { },
          "data": [
            {
              "time": 1427225350,
              "value": 760
            },
            {
              "time": 1427225351,
              "value": 774
            },
            {
              "time": 1427225352,
              "value": 792
            },
            {
              "time": 1427225353,
              "value": 756
            },
            {
              "time": 1427225354,
              "value": 766
            }
          ]
        }
      ]
    }
    
- If a run-ID is not specified, CDAP aggregates the events processed for all the runs of a flow.
  The resulting timeseries will represent aggregated values for the context specified.
  Currently, summation is used as the aggregation function.
  
  For example, if you query for the ``system.process.events.processed`` metric for a flow
  |---| and thus across all flowlets |---| since this metric was actually emitted at the
  flowlet level, the resulting values retrieved will be a sum across all flowlets of the flow.

- To see events processed by all flowlets of a flow in an application, instead of querying
  for each individual flowlet of the flow, you can perform a single query, using 
  ``groupBy=flowlet``.

  For example, to request the information for each of the flowlets of the
  *PurchaseHistory* application, this query will return a multiple series, each grouped by
  flowlet and with the returned value being the number of events processed (command and
  result reformatted to fit)::

    POST /v3/metrics/query?tag=namespace:default&tag=app:PurchaseHistory
      &tag=flow:PurchaseFlow&groupBy=flowlet&metric=system.process.events.processed

    {"startTime":0,
     "endTime":1429756509,
     "series":[{"metricName":"system.process.events.processed",
                "grouping":{"flowlet":"collector"},
                "data":[{"time":0,"value":5}]},
               {"metricName":"system.process.events.processed",
                "grouping":{"flowlet":"reader"},
                "data":[{"time":0,"value":5}]}
              ]
    }

- User-defined metrics are always prefixed with the word ``user``, and must be queried by 
  using that prefix with the metric name.

  For example, to request the user-defined metric *names.byte* for the *HelloWorld*
  application's *WhoFlow* flow::

    POST /v3/metrics/query?tag=namespace:default&tag=app:HelloWorld
      &tag=flow:WhoFlow&tag=flowlet:saver&metric=user.names.bytes&aggregate=true

.. _http-restful-api-metrics-pending:

- The point-in-time pending metric is the difference between the number of events added to
  the queue and the number of events consumed, within a given interval.  For example, if the
  first flowlet in a flow emits 750 events in one second, and the second flowlet consumes
  500, the pending count is 250 events.

  To retrieve the cumulative pending count, you can run a metrics query without a start and end time range. 
  By default, metrics are aggregated across all available time. Your query (using the CDAP example
  :ref:`Count Random <examples-count-random>`) could look like::

    POST /v3/metrics/query?tag=namespace:default&tag=app:CountRandom&tag=flow:CountRandom
      &tag=consumer:counter&tag=producer:splitter&tag=queue:queue&metric=system.queue.pending
