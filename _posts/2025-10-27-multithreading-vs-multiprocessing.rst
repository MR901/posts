---
layout: post
title: "Multithreading vs Multiprocessing — Choosing the Right Concurrency Model"
date: 2025-10-27 00:00:00 +0530
categories: [Python, Concurrency, Performance]
tags: [multithreading, multiprocessing, concurrency, parallelism, GIL, CPU-bound, I/O-bound]
pin: false
toc: true
comments: false
math: true
mermaid: false
description: "A practical guide comparing multithreading and multiprocessing (Python focus): GIL, I/O- vs CPU-bound workloads, examples, pitfalls, and decision checklist."
image:
  path: /attachments/posts/2025-10-27-multithreading-vs-multiprocessing/images/multi-threading-multi-processing.png
  alt: "Multithreading vs Multiprocessing overview"
allow_edit: true
---



Multithreading vs Multiprocessing — How to Choose (Python Focus)
================================================================

If your program needs to do many things at once, you have two main options: **multithreading** and **multiprocessing**. Picking the right one depends on whether your workload is **I/O-bound** (waiting on network/disk) or **CPU-bound** (intense computation), and in Python, on how the **GIL** behaves.


TL;DR
-----

- **Use multithreading** for I/O-bound tasks (HTTP requests, file reads, DB calls). In Python, threads do not speed up pure CPU-bound code because of the GIL.

- **Use multiprocessing** for CPU-bound tasks (numerical computation, image/video processing, compression, ML feature transforms).

- **Mix** them for real apps: threads for I/O; a process pool for heavy CPU steps.



Concurrency vs Parallelism
--------------------------

- **Concurrency**: Structuring a program as multiple tasks that make progress independently (often interleaved on a single core). Great for I/O.

- **Parallelism**: Executing tasks at the same time on multiple cores. Needed to speed up CPU-heavy work.



The Python GIL (Global Interpreter Lock)
----------------------------------------

Python’s main C implementation (CPython) has a **GIL**, which allows only one thread to execute Python bytecode at a time per process.

- Threads in Python can run concurrently but not in parallel for CPU-bound Python code.

- Threads release the GIL during blocking I/O; thus, threads are excellent for I/O-bound workloads.

- To achieve true parallelism for CPU-bound Python code, use **multiprocessing** or external native extensions that release the GIL (NumPy, Numba, C/C++ extensions).



When to Use Multithreading
--------------------------

Best for I/O-bound workloads: web scraping, calling external APIs, reading/writing files, waiting on DB/network.

**Minimal example with `concurrent.futures.ThreadPoolExecutor`**

.. code-block:: python

   import time
   from concurrent.futures import ThreadPoolExecutor, as_completed
   import requests

   URLS = [

       "https://example.com",
       "https://httpbin.org/delay/1",
       "https://httpbin.org/delay/2",
   ]

   def fetch(url: str) -> tuple[str, int]:

       resp = requests.get(url, timeout=5)
       return url, resp.status_code

   start = time.perf_counter()
   with ThreadPoolExecutor(max_workers=8) as pool:

       futures = [pool.submit(fetch, u) for u in URLS]
       for fut in as_completed(futures):

           print(fut.result())
   print(f"threads elapsed: {time.perf_counter() - start:.2f}s")


**Notes**

- Use a **bounded** number of threads; too many wastes memory and context-switching time.

- For thousands of sockets, consider **asyncio** instead of threads.



When to Use Multiprocessing
---------------------------

Best for CPU-bound workloads: compute-heavy loops, data transforms, parsing, simulations.

**Minimal example with `concurrent.futures.ProcessPoolExecutor`**

.. code-block:: python

   import math
   import time
   from concurrent.futures import ProcessPoolExecutor

   def is_prime(n: int) -> bool:

       if n < 2:

           return False
       if n % 2 == 0:

           return n == 2
       r = int(math.sqrt(n))
       f = 3
       while f <= r:

           if n % f == 0:

               return False
           f += 2
       return True

   nums = [10_000_019, 10_000_079, 10_000_103, 10_000_129]
   start = time.perf_counter()
   with ProcessPoolExecutor() as pool:

       results = list(pool.map(is_prime, nums))
   print(results)
   print(f"processes elapsed: {time.perf_counter() - start:.2f}s")


**Notes**

- Processes achieve true parallelism across cores, bypassing the GIL.

- Each process has its own memory; large data must be serialized (copying cost) unless using shared memory.



APIs You’ll Use
---------------

- **Threads**: `threading`, `queue`, `concurrent.futures.ThreadPoolExecutor`

- **Processes**: `multiprocessing`, `concurrent.futures.ProcessPoolExecutor`, `multiprocessing.shared_memory`

- **Async I/O**: `asyncio` for massive I/O concurrency with single-threaded event loops



Data Sharing and Communication
------------------------------

- **Threads** share memory. Use `queue.Queue` for safe communication; protect shared state with locks when needed.

- **Processes** do not share memory by default. Use `multiprocessing.Queue`, `Pipe`, `Manager`, or `shared_memory`.


**Thread-safe queue example**

.. code-block:: python

   import threading
   import queue

   work = queue.Queue()
   for i in range(100):

       work.put(i)

   def worker():

       while True:

           try:

               item = work.get_nowait()
           except queue.Empty:

               break
           # process item
           work.task_done()

   threads = [threading.Thread(target=worker) for _ in range(4)]
   for t in threads: t.start()
   for t in threads: t.join()



Performance Considerations
--------------------------

- **Startup overhead**: processes are heavier than threads; prefer process pools for repeated tasks.

- **Serialization cost**: sending large objects between processes can dominate runtime.

- **Oversubscription**: do not exceed number of cores with CPU-bound tasks; use `max_workers=os.cpu_count()`.

- **Vectorized libs**: NumPy, PyTorch, OpenCV often release the GIL; threads can speed these cases.

- **Pinning and affinity**: advanced tuning for low-latency, usually not needed for most apps.



Common Pitfalls
---------------

- **Deadlocks**: circular waiting on locks or queues. Keep lock scope minimal; prefer message passing.

- **Race conditions**: unsynchronized access to shared state in threads.

- **Fork on macOS/Windows**: prefer `spawn` start method on macOS/Windows. Guard entry points with `if __name__ == "__main__":`.

- **Pickling errors**: process targets and data must be picklable; avoid lambdas/closures as targets.

- **Global state**: processes do not share globals; initialize per process.



Hybrid Patterns (Thread + Process)
----------------------------------

- Use threads to fetch data (I/O) and a process pool to crunch it (CPU):
  1) Threaded producers enqueue payloads
  2) Process pool consumes payloads for CPU-heavy work


.. code-block:: python

   from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor


**def fetch(url)**

       ...  # network I/O
       return payload

**def crunch(payload)**

       ...  # CPU-bound work
       return result

   with ThreadPoolExecutor() as tpool, ProcessPoolExecutor() as ppool:

       payloads = list(tpool.map(fetch, urls))
       results = list(ppool.map(crunch, payloads))


Beyond One Machine
------------------

- **Ray** and **Dask** scale Python across cores and machines with familiar futures/maps.

- **Joblib** integrates with scikit-learn parallel backends.

- For big-data pipelines, consider **Spark** or **Flink**.



Quick Decision Checklist
------------------------

- Mostly waiting on network/disk? → **Threads** (or **asyncio**)

- Mostly crunching CPU? → **Processes** (size pool to core count)

- Mixed workload? → **Threads** for I/O + **Process pool** for CPU

- Need distributed? → **Ray/Dask**



Minimal Cheatsheet
------------------

**Thread pool**

.. code-block:: python

   from concurrent.futures import ThreadPoolExecutor
   with ThreadPoolExecutor(max_workers=8) as pool:

       list(pool.map(func, inputs))


**Process pool**

.. code-block:: python

   from concurrent.futures import ProcessPoolExecutor
   if __name__ == "__main__":

       with ProcessPoolExecutor() as pool:

           list(pool.map(func, inputs))



Resources
---------

- `Python threading <https://docs.python.org/3/library/threading.html>`_

- `Python multiprocessing <https://docs.python.org/3/library/multiprocessing.html>`_

- `concurrent.futures <https://docs.python.org/3/library/concurrent.futures.html>`_

- `asyncio <https://docs.python.org/3/library/asyncio.html>`_

- `PEP 703: Making the Global Interpreter Lock Optional in CPython <https://peps.python.org/pep-0703/>`_

- `Ray Documentation <https://docs.ray.io/>`_

- `Dask Documentation <https://docs.dask.org/en/stable/>`_
