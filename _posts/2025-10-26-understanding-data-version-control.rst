---
layout: post
title: "Understanding Data Version Control (DVC)"
date: 2025-10-24 00:00:00 +0530
categories: [Machine Learning, MLOps, Tools]
tags: [DVC, version control, data management, reproducibility, pipelines]
pin: false
toc: true
comments: false
math: true
mermaid: false
description: "A comprehensive and practical guide to DVC (Data Version Control), covering how to manage datasets, models, and ML pipelines effectively."
image:

  path: /attachments/posts/2025-10-26-understanding-data-version-control/images/dvc.png
  alt: "DVC"
allow_edit: true
---



Understanding DVC — Data Version Control for Machine Learning
=============================================================

Machine Learning experiments generate large datasets, models, and results that evolve quickly.
Traditional version control systems like Git work well for code but fail when dealing with **large files**, **binary data**, and **data-driven pipelines**.

**DVC (Data Version Control)** fills this gap. It extends Git for machine learning workflows, allowing you to version, share, and reproduce data, models, and experiments efficiently.

This guide explains what DVC is, how it works, and how ML engineers use it to maintain clean, reproducible, and collaborative workflows.


Why DVC Exists
--------------

**Machine learning development faces unique versioning challenges**

- Data files too large for Git

- Model artifacts changing frequently

- Non-deterministic pipelines that are hard to reproduce

- Collaboration between data scientists, engineers, and DevOps teams


**DVC solves these issues by combining**

- **Git for versioning control and history**

- **External storage for large data files**

- **Pipeline definitions for reproducibility**


In essence, DVC makes **data and model management as easy as Git makes code management**.


Core Concepts of DVC
--------------------

**1. Data Versioning**

   - DVC tracks large datasets and model files **without storing them in Git**.

   - Instead, it stores lightweight metadata files (`.dvc` files) in Git.

   - The actual data lives in external storage like S3, Google Drive, Azure Blob, or a shared server.


**2. Pipelines**

   - DVC defines ML pipelines declaratively.

   - Each stage specifies inputs, outputs, and commands in a `dvc.yaml` file.

   - When data or code changes, DVC automatically rebuilds affected stages.


**3. Reproducibility**

   - Every experiment can be re-run exactly from code and DVC metadata.

   - No hidden dependencies — everything from raw data to model is traceable.


**4. Remote Storage**

**- DVC supports remote data repositories for sharing across teams**
     - Amazon S3

     - Google Drive

     - Azure Blob

     - SSH or NFS servers

     - Local network storage


**5. Experiment Tracking**
   - DVC integrates with `dvc exp` to track model metrics and compare runs.

   - Integrates with MLflow or CML for visualization and CI/CD automation.



Installing DVC
--------------

**DVC can be installed using pip**

.. code-block:: bash

   pip install dvc


**Or with specific storage support (e.g., AWS or GCP)**

.. code-block:: bash

   pip install "dvc[s3]"  # for Amazon S3
   pip install "dvc[gdrive]"  # for Google Drive


**To initialize DVC in your Git repository**

.. code-block:: bash

   git init
   dvc init


This creates a `.dvc/` directory and adds configuration files for tracking.


Tracking Data with DVC
----------------------

Let’s start with a dataset `data/train.csv`.

.. code-block:: bash

   dvc add data/train.csv


**This command**

- Creates a small file `data/train.csv.dvc` with metadata and hash.

- Moves the actual `train.csv` to the DVC cache directory.

- Keeps a pointer to it for Git tracking.


**Commit these changes to Git**

.. code-block:: bash

   git add data/train.csv.dvc .gitignore
   git commit -m "Add training data with DVC"


Your Git repo now tracks **data version metadata**, not the raw data itself.


Setting Up Remote Storage
-------------------------

**Add a remote location to store large data files**

.. code-block:: bash

   dvc remote add -d myremote s3://mlproject-storage
   dvc push


`dvc push` uploads all tracked data to the remote storage.

**Others can retrieve it by cloning the repo and running**

.. code-block:: bash

   git clone https://github.com/user/mlproject
   dvc pull


Now the dataset is fetched automatically from the remote.


Defining ML Pipelines
---------------------

DVC pipelines are defined in a `dvc.yaml` file.
Each stage represents a step such as preprocessing, training, or evaluation.

**Example**

.. code-block:: yaml

   stages:

     preprocess:

       cmd: python src/preprocess.py data/raw data/processed

**deps**
         - src/preprocess.py

         - data/raw

**outs**
         - data/processed


     train:

       cmd: python src/train.py data/processed model.pkl
**deps**
         - src/train.py

         - data/processed

**outs**
         - model.pkl

**metrics**
         - metrics.json


**Run the pipeline**

.. code-block:: bash

   dvc repro


DVC executes only changed stages, caching results from previous runs — similar to **Makefile** or **Snakemake**, but for ML data.


Experiment Tracking
-------------------

DVC lets you track experiments and metrics using simple commands.

**Example**

.. code-block:: bash

   dvc exp run
   dvc exp show


`dvc exp run` executes a pipeline with modifications (like changed hyperparameters).
`dvc exp show` displays metrics across experiments in a tabular format.

**To persist a good experiment to Git**

.. code-block:: bash

   dvc exp apply <exp_id>
   git commit -am "Best model experiment"



Collaboration Workflow
----------------------

**Typical DVC collaboration flow**

1. One engineer adds data and pushes it to remote with `dvc add` and `dvc push`.

2. Another engineer clones the repo and runs `dvc pull` to get the data.

3. Both can reproduce the same pipeline using `dvc repro`.

4. Experiments and models stay in sync with code changes.



Versioning Models with DVC
--------------------------

**Model artifacts can also be tracked**

.. code-block:: bash

   dvc add models/random_forest.pkl
   git add models/random_forest.pkl.dvc
   git commit -m "Track model with DVC"


**Push model artifacts to remote**

.. code-block:: bash

   dvc push


You can switch between model versions using Git commits — DVC automatically retrieves the right model file.


Integrating DVC with MLflow
---------------------------

DVC focuses on **data and pipeline versioning**, while **MLflow** focuses on **experiment tracking** and **deployment**.
**They integrate well**

- DVC manages datasets, features, and model files.

- MLflow logs metrics, parameters, and artifacts.


**A practical setup**
- Use DVC for reproducible data pipelines.

- Use MLflow for experiment tracking and model registry.



DVC in CI/CD and Automation
---------------------------

DVC integrates with **Continuous Machine Learning (CML)** to automate ML workflows.
You can trigger model retraining, evaluation, and reporting directly in CI pipelines (e.g., GitHub Actions, GitLab CI).

**Example GitHub Action snippet**

.. code-block:: yaml

   name: Model Training
   on: [push]
   jobs:

     train:

       runs-on: ubuntu-latest

**steps**
         - uses: actions/checkout@v3

         - uses: iterative/setup-dvc@v1

         - name: Pull Data
           run: dvc pull

         - name: Train Model
           run: dvc repro

         - name: Push Results
           run: dvc push


This setup ensures reproducible model training in every code update.


Best Practices for Using DVC
----------------------------

- Store all large files (datasets, models, embeddings) using DVC, not Git.

- Always commit `.dvc` and `dvc.yaml` files.

- Keep the data cache folder out of version control.

- Use `dvc.lock` to track dependencies and output versions.

- Run `dvc repro` instead of manual re-runs to ensure reproducibility.

- Configure consistent remote storage for your team.

- Periodically clean old caches with `dvc gc`.



Common Pitfalls
---------------

- Forgetting to run `dvc push` after `git commit`.

- Misconfigured remote causing missing data for collaborators.

- Committing large raw data directly to Git.

- Ignoring dependency updates in `dvc.yaml` (stale pipeline stages).

- Not locking dependencies with `dvc.lock`.



Advanced Features
-----------------

**For experienced ML engineers, DVC offers**

- **Data registry**: Shared datasets across multiple projects.

- **Metrics tracking** with `dvc metrics diff` and `dvc plots`.

- **Parameterized pipelines** for grid searches or tuning.

- **Studio Integration (Iterative.ai)** for visual comparison of experiments.

- **Custom remotes** (SSH, NFS, or even HTTP servers).

- **Push hooks** for automated data uploads.


**Example for metrics diff**

.. code-block:: bash

   dvc metrics diff HEAD~1


This compares model metrics between commits to detect regression or improvement.


Ecosystem and Integrations
--------------------------

**DVC fits well with common ML toolchains**

- **Data**: pandas, Spark, Arrow, DuckDB

- **ML frameworks**: scikit-learn, PyTorch, TensorFlow

- **Experiment tools**: MLflow, Weights & Biases

- **Pipelines**: Airflow, Prefect, Dagster

- **CI/CD**: GitHub Actions, GitLab CI, Jenkins



Conclusion
----------

DVC bridges the gap between **software engineering discipline** and **machine learning experimentation**.
**It empowers teams to**

- Version datasets and models alongside code

- Reproduce experiments easily

- Share consistent pipelines across environments

- Keep Git repositories lightweight and clean


In short, DVC makes data science workflows **traceable, reproducible, and collaborative** — three pillars of serious ML engineering.


Resources
---------

- `DVC Official Documentation <https://dvc.org/doc>`_

- `GitHub Repository <https://github.com/iterative/dvc>`_

- `Iterative.ai Blog <https://iterative.ai/blog>`_

- `CML (Continuous Machine Learning) <https://cml.dev>`_

- `DVC Studio <https://studio.iterative.ai>`_

