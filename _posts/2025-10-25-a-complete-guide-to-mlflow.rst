---
layout: post
title: "A Complete Guide to MLflow"
date: 2025-10-25 00:00:00 +0530
categories: [Machine Learning, MLOps, Experimentation, Model Management]
tags: [MLflow, experiment tracking, model registry, deployment, reproducibility, projects, models]
pin: false
toc: true
comments: false
math: true
mermaid: false
description: "A practical, up-to-date guide to MLflow covering tracking, projects, models, the model registry, serving, GenAI integrations, and best practices for ML engineers."
image:

  path: /attachments/posts/2025-10-25-a-complete-guide-to-mlflow/images/mlflow.jpeg
  alt: "MLFlow"
allow_edit: true
---



A Complete Guide to MLflow
==========================

Machine Learning projects often start simple and grow into chaos: multiple versions of notebooks, model files scattered across folders, and no easy way to reproduce results.

This is where **MLflow** comes in.

MLflow is a **lightweight, open-source framework for managing the end-to-end machine learning lifecycle**. MLflow facilitates **MLOps** by providing tools to manage machine learning workflows consistently. It streamlines **experiment tracking, model versioning, reproduce runs, and reliable deployment**. It standardizes experimentation, promotes reproducibility, and enables **collaboration across teams**.

Learn more on the `official website <https://mlflow.org/>`_ and the `GitHub repository <https://github.com/mlflow/mlflow>`_.




1. Why MLflow Exists



**Machine learning systems are not just about training models. They require management. MLflow addresses the common challenges in ML lifecycle management**

- Reproducibility of experiments and results

- Consistent tracking of parameters, metrics, and artifacts

- Standardized model packaging, versioning and deployment workflows

- Clear promotion paths from experimentation to production

- Collaboration and governance across teams and environments


MLflow solves these problems by providing a consistent, framework-agnostic way to **track, package, and deploy** models, regardless of the underlying libraries or infrastructure.

**Its key features include**

- Track experiments, parameters, metrics, and artifacts

- Package ML code and dependencies for reproducibility

- Save and version models for deployment

- Centralized model registry for governance

- Ease of integration with popular ML frameworks like scikit-learn, PyTorch, TensorFlow, Hugging Face

- Works across local machines, servers, or cloud setups.




2. Core Components of MLflow



MLflow is composed of **four independent but connected components**.
You can use one, some, or all depending on your project needs.

**1. MLflow Tracking**
   - Logs experiments, parameters, metrics, artifacts, and model files during experiments.

   - Provides a web UI and APIs to visualize and compare experiments/runs in a local or remote UI.

   - Example: track hyperparameters, validation accuracy, and confusion matrices.


**2. MLflow Projects**
   - Packages ML code and dependencies (Standardizes your code) for reproducible experiments/runs

   - Defines dependencies (via Conda or Docker) and entry points (training, evaluation).

   - Enables consistent experiments execution across environments


**3. MLflow Models**
   - Platform-agnostic model storage

   - It packages the trained models into a standard format called *MLmodel*.

   - Supports multiple “flavors” (scikit-learn, PyTorch, TensorFlow, XGBoost, custom).

   - Allows deployment to diverse serving environments  through REST APIs, batch jobs, or cloud services.

   - Facilitates version control of trained models


**4. MLflow Model Registry**
   - Centralized repository/store for managing model versions, lifecycle stages, and metadata.

   - Tracks which model is in “Staging”, “Production”, or “Archived”, while also allowing Stage transitions (Development, Staging, Production)

   - Governance and approval workflows for production deployment

   - Encourages collaboration and auditability across teams.



Together, these components cover everything from **tracking** → **reproducibility** → **deployment** → **governance**.




3. Setting Up MLflow




**Step 1: Create a virtual environment**

.. code-block:: bash

   pip install virtualenv
   python -m venv mlflow_env
   source mlflow_env/bin/activate



**Step 2: Install MLflow**

**MLflow works with any Python environment. Install it using pip**

.. code-block:: bash

   pip install --upgrade pip
   pip install mlflow
   # Optional: extras for common frameworks
   pip install "mlflow[extras]"


.. note::

   `[extras]` installs optional dependencies for frameworks like TensorFlow, PyTorch, scikit-learn.


**Step 3: Start MLflow Tracking Server**

**To start the local tracking UI**

.. code-block:: bash

   mlflow ui --port 5000


Visit `http://localhost:5000` to access the UI.

This launches a lightweight web dashboard at `http://127.0.0.1:5000`, where you can browse experiment runs, parameters, metrics, and logged artifacts.


**Step 4: Configure Tracking URI**

By default, MLflow stores run metadata in a local `mlruns/` folder.
**You can point it to a remote backend database or artifact store using**

.. code-block:: bash

   export MLFLOW_TRACKING_URI=http://localhost:5000
   # export MLFLOW_TRACKING_URI="http://<remote-server>:5000"



This ensures all experiments log to the MLflow server.

**MLflow supports storage on**
- Local filesystem

- SQL databases (SQLite, PostgreSQL, MySQL)

- Cloud object stores (Amazon S3, Google Cloud Storage, Azure Blob)


This flexibility makes it suitable for both **personal projects** and **production pipelines**.


**Step 5: (Optional) Clone Repository for Examples**

.. code-block:: bash

   git clone https://github.com/mlflow/mlflow
   cd mlflow/examples




4. Tracking Experiments



**MLflow Tracking records metadata about your experiments**

- Parameters (e.g., learning rate, number of trees)

- Metrics (e.g., accuracy, F1, loss, latency)

- Artifacts (e.g., models, plots, logs)

- Tags (custom metadata like dataset version, git commit)


**Quickstart example**

.. code-block:: python

   import mlflow
   import mlflow.sklearn
   from sklearn.datasets import load_iris
   from sklearn.model_selection import train_test_split
   from sklearn.ensemble import RandomForestClassifier
   from sklearn.metrics import accuracy_score
   import matplotlib.pyplot as plt
   import seaborn as sns
   import pandas as pd

   X, y = load_iris(return_X_y=True)
   X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

   mlflow.sklearn.autolog()  # optional autologging

   with mlflow.start_run(run_name="rf_iris"):

       n_estimators = 100
       max_depth = 3
       mlflow.log_param("n_estimators", n_estimators)
       mlflow.log_param("max_depth", max_depth)

       model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
       model.fit(X_train, y_train)

       preds = model.predict(X_test)
       acc = accuracy_score(y_test, preds)
       mlflow.log_metric("accuracy", acc)

       cm = pd.crosstab(y_test, preds, rownames=["Actual"], colnames=["Predicted"])
       plt.figure(figsize=(4, 3))
       sns.heatmap(cm, annot=True, fmt="d")
       plt.tight_layout()
       plt.savefig("confusion_matrix.png")
       mlflow.log_artifact("confusion_matrix.png")

       mlflow.sklearn.log_model(model, artifact_path="rf_model")


**Organize runs into experiments**

.. code-block:: python

   import mlflow

   mlflow.set_experiment("Iris_Experiments")
**with mlflow.start_run(run_name="baseline_rf")**

       ...


**Autologging across frameworks**

.. code-block:: python

   mlflow.sklearn.autolog()
   mlflow.pytorch.autolog()       # PyTorch Lightning
   mlflow.tensorflow.autolog()    # TensorFlow / Keras
   mlflow.xgboost.autolog()
   mlflow.lightgbm.autolog()


**Nested runs (for hyperparameter sweeps)**

.. code-block:: python

   with mlflow.start_run(run_name="sweep"):

**for depth in [3, 5, 7]**

**with mlflow.start_run(run_name=f"depth_{depth}", nested=True)**

               ...  # train and log metrics


**Remote tracking**

.. code-block:: python

   mlflow.set_tracking_uri("postgresql://user:password@host:5432/mlflow_db")


**Tips**

- Prefer consistent parameter names across runs.

- Tag runs with dataset and code versions (``mlflow.set_tag``).

- Store artifacts in remote object stores for teams.




5. MLflow Projects (Reproducibility)



Package code, dependencies, and entry points so anyone can re-run your experiments consistently.

**MLproject**

.. code-block:: yaml

   name: iris_classifier
   conda_env: conda.yaml
   entry_points:

     main:

       parameters:

         n_estimators: {type: int, default: 100}
         max_depth: {type: int, default: 5}
       command: "python train.py --n_estimators {n_estimators} --max_depth {max_depth}"


**conda.yaml**

.. code-block:: yaml

   name: iris_env

**channels**
     - defaults

**dependencies**
     - python=3.10

     - scikit-learn

     - pandas

     - numpy

     - mlflow


**train.py** (excerpt)

.. code-block:: python

   import argparse
   import mlflow
   import mlflow.sklearn
   from sklearn.datasets import load_iris
   from sklearn.model_selection import train_test_split
   from sklearn.ensemble import RandomForestClassifier
   from sklearn.metrics import accuracy_score

   if __name__ == "__main__":

       parser = argparse.ArgumentParser()
       parser.add_argument("--n_estimators", type=int, default=100)
       parser.add_argument("--max_depth", type=int, default=5)
       args = parser.parse_args()

       with mlflow.start_run():

           X, y = load_iris(return_X_y=True)
           X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
           model = RandomForestClassifier(n_estimators=args.n_estimators, max_depth=args.max_depth)
           model.fit(X_train, y_train)
           acc = accuracy_score(y_test, model.predict(X_test))
           mlflow.log_params({"n_estimators": args.n_estimators, "max_depth": args.max_depth})
           mlflow.log_metric("accuracy", acc)
           mlflow.sklearn.log_model(model, "rf_model")


Run the project
^^^^^^^^^^^^^^^

.. code-block:: bash

   mlflow run . -P n_estimators=200 -P max_depth=10


Run from Git
^^^^^^^^^^^^

.. code-block:: bash

   mlflow run https://github.com/user/repo.git -P alpha=0.5


Programmatic run
^^^^^^^^^^^^^^^^

.. code-block:: python

   import mlflow.projects

   result = mlflow.projects.run(

       uri=".",
       entry_point="main",
       parameters={"n_estimators": 150, "max_depth": 8},
       experiment_name="iris_exp",
   )
   print("Run ID:", result.run_id)


**Environment managers**

- ``--env-manager=conda`` (default): create/reuse Conda envs automatically.

- ``--env-manager=docker``: run in Docker for maximum reproducibility.

- ``--env-manager=local``: use the current Python environment.


Tips: Use Conda for iteration and Docker for production-grade reproducibility.



6. MLflow Models (Packaging)



MLflow saves models in a standard folder structure with metadata and environment files.

**Directory structure**

.. code-block:: text

   my_model/
   ├── MLmodel
   ├── model.pkl
   ├── conda.yaml
   └── requirements.txt


**Flavors**

- mlflow.sklearn, mlflow.tensorflow, mlflow.pytorch, mlflow.xgboost, mlflow.lightgbm

- mlflow.transformers (Hugging Face), mlflow.pyfunc (generic Python function)


**Save and load**

.. code-block:: python

   import mlflow.sklearn

   mlflow.sklearn.save_model(model, path="models/rf_model")
   loaded = mlflow.sklearn.load_model("models/rf_model")


**Log with signature and example input**

.. code-block:: python

   from mlflow.models import infer_signature
   import pandas as pd

   signature = infer_signature(X_train, model.predict(X_train))
   example = pd.DataFrame(X_train[:2], columns=["f1","f2","f3","f4"])  # shape matches training

   with mlflow.start_run():

       mlflow.sklearn.log_model(

           model,
           artifact_path="rf_model",
           signature=signature,
           input_example=example,
       )


..

PyFunc (framework-agnostic interface)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: python

   import mlflow.pyfunc
   import pandas as pd

   class AddN(mlflow.pyfunc.PythonModel):

       def __init__(self, n: int):

           self.n = n
       def predict(self, context, model_input: pd.DataFrame):

           return model_input + self.n

   mlflow.pyfunc.save_model(path="add_n_model", python_model=AddN(5))
   loaded = mlflow.pyfunc.load_model("add_n_model")
   loaded.predict(pd.DataFrame({"x": [10]}))  # -> x=15




7. MLflow Model Registry (Governance)



Register and manage model versions with clear lifecycle stages.

**Register a model**

.. code-block:: python

   import mlflow

   result = mlflow.register_model(

       "runs:/<run_id>/model",
       "CustomerChurnModel"
   )
   print("Registered version:", result.version)


**Transition stages**

.. code-block:: python

   from mlflow.tracking import MlflowClient

   client = MlflowClient()
   client.transition_model_version_stage(

       name="CustomerChurnModel",
       version=3,
       stage="Production",
       archive_existing_versions=True,
   )


**Describe and tag**

.. code-block:: python

   client.update_model_version(

       name="CustomerChurnModel",
       version=3,
       description="Retrained on Q4 data; +3% F1."
   )
   client.set_model_version_tag(

       name="CustomerChurnModel",
       version=3,
       key="dataset",
       value="customer_data_2025_Q4",
   )


**Load by name and stage**

.. code-block:: python

   import mlflow.pyfunc

   model = mlflow.pyfunc.load_model("models:/CustomerChurnModel/Production")
   preds = model.predict(input_df)


**Automation (REST API)**

.. code-block:: bash

   curl -X POST http://127.0.0.1:5000/api/2.0/mlflow/model-versions/transition-stage \

        -H 'Content-Type: application/json' \
        -d '{

             "name": "CustomerChurnModel",
             "version": "3",
             "stage": "Production",
             "archive_existing_versions": "true"
           }'


Use with approval gates in CI/CD.



8. Deployment and Serving



Serve models locally, in containers, or on managed services.

**Local REST API**

.. code-block:: bash

   mlflow models serve -m runs:/<run_id>/model -p 5000


**Request format (DataFrame style)**

.. code-block:: bash

   curl -X POST http://127.0.0.1:5000/invocations \

        -H "Content-Type: application/json" \
        -d '{"columns":["a","b"],"data":[[1,2]]}'


**Serve a registered model**

.. code-block:: bash

   mlflow models serve -m "models:/CustomerChurnModel/Production" -p 5000


**Docker image**

.. code-block:: bash

   mlflow models build-docker -m "models:/CustomerChurnModel/Production" -n churn_model:latest
   docker run -p 5000:8080 churn_model:latest


**Batch inference with Spark**

.. code-block:: python

   from pyspark.sql import SparkSession
   import mlflow.pyfunc

   spark = SparkSession.builder.getOrCreate()
   df = spark.read.csv("data.csv", header=True, inferSchema=True)
   udf = mlflow.pyfunc.spark_udf(spark, "models:/CustomerChurnModel/Production")
   scored = df.withColumn("prediction", udf(*df.columns))
   scored.show()


**Custom FastAPI service**

.. code-block:: python

   from fastapi import FastAPI, Request
   import mlflow.pyfunc
   import pandas as pd

   app = FastAPI()
   model = mlflow.pyfunc.load_model("models:/CustomerChurnModel/Production")

   @app.post("/predict")
   async def predict(request: Request):

       data = await request.json()
       df = pd.DataFrame(data["data"], columns=data["columns"])
       preds = model.predict(df)
       return {"predictions": preds.tolist()}




9. Operating the MLflow Server (Production)



**Run a tracking server with DB and object store**

.. code-block:: bash

   mlflow server \

       --backend-store-uri postgresql://user:pwd@localhost/mlflowdb \
       --default-artifact-root s3://my-bucket/mlflow-artifacts \
       --host 0.0.0.0 --port 5000


**Environment for S3-compatible stores (e.g., MinIO)**

.. code-block:: bash

   export MLFLOW_S3_ENDPOINT_URL=http://minio:9000
   export AWS_ACCESS_KEY_ID=minio
   export AWS_SECRET_ACCESS_KEY=minio123


**Security**

- Put MLflow behind a reverse proxy (Nginx/Traefik) with TLS.

- Use network policies, VPC peering, or VPN for private access.

- Externalize credentials via environment variables or secret stores.


**Operations**

- Enable log rotation and set artifact retention policies.

- Monitor DB health and tune connections.

- Back up the backend database regularly.




10. GenAI and LLM Tracking (Optional)



Track prompts, responses, and usage for LLM workflows.

.. code-block:: python

   import mlflow
   import mlflow.genai  # ensure your MLflow version supports this module

   with mlflow.start_run(run_name="prompt_experiment"):

       mlflow.genai.log_prompt("Explain the bias-variance tradeoff in simple terms.")
       # Simulated completion
       response = "It is the balance between underfitting (bias) and overfitting (variance)."
       mlflow.genai.log_response(response)
       mlflow.genai.log_usage(prompt_tokens=20, completion_tokens=35, cost_usd=0.002)
       mlflow.log_metric("clarity_score", 0.92)


**Evaluations**

.. code-block:: python

   from nltk.translate.bleu_score import sentence_bleu

   ref = "Machine learning is a subset of artificial intelligence."
   cand = "Machine learning belongs to artificial intelligence."
   bleu = sentence_bleu([ref.split()], cand.split())
   mlflow.log_metric("bleu_score", bleu)


**Embeddings and RAG**

.. code-block:: python

   from sentence_transformers import SentenceTransformer
   import mlflow.genai

   encoder = SentenceTransformer('all-MiniLM-L6-v2')
   vec = encoder.encode(["Explain diffusion models."])[0]
   mlflow.genai.log_embedding(vector=vec, metadata={"query": "diffusion models"})


**Plugins**

.. code-block:: bash

   mlflow plugins register --name my_custom_llm --module my_llm_plugin


**Safety**

- Sanitize/anonymize prompts before logging.

- Track cost per experiment; set budgets on API usage.

- Store evaluation datasets and metrics as artifacts.




11. Best Practices and Common Pitfalls



**Best practices**

- Log parameters, metrics, artifacts, and environment details for every run.

- Use the Model Registry for governance and controlled promotion.

- Pin dependencies (``conda.yaml`` or ``requirements.txt``) and prefer Docker for production.

- Tag runs with dataset and code commit information.

- Use remote artifact stores and a shared tracking server for teams.

- Define and enforce retention and lifecycle policies for artifacts and runs.


**Common pitfalls**

- Forgetting to close runs or nesting them incorrectly.

- Using relative paths in Projects (hurts portability).

- Logging excessively frequent metrics (can slow tracking backends).

- Allowing artifact directories to grow without lifecycle management.

- Skipping the registry for production models.

- Not recording model signatures, causing inference mismatches.




12. Conclusion



MLflow brings order to the ML lifecycle: from tracking and packaging to registry-backed deployment and governance. Adopt it to make your experimentation reproducible, your deployments reliable, and your collaboration smoother.



13. Resources



- `MLflow Official Documentation <https://mlflow.org/docs/latest/index.html>`_

- `MLflow GitHub Repository <https://github.com/mlflow/mlflow>`_

- `Databricks MLflow Guide <https://docs.databricks.com/en/mlflow/index.html>`_

- `MLflow GenAI Documentation <https://mlflow.org/docs/latest/genai/>`_

- `Ubuntu Blog: What is MLflow <https://ubuntu.com/blog/what-is-mlflow>`_

- `Viso.ai: MLflow Experimentation Overview <https://viso.ai/deep-learning/mlflow-machine-learning-experimentation/>`_
