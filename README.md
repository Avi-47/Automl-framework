# 🚀 AutoML Framework

An end-to-end modular AutoML framework built using Python and Scikit-learn that automatically handles:

* Data loading
* Validation
* Preprocessing
* Feature scaling
* Model training
* Hyperparameter optimization using Optuna
* Evaluation
* Report generation
* Model saving

Supports both:

* Classification
* Regression

---

# ✨ Features

## ✅ Automatic Task Detection

The framework automatically detects whether the problem is:

* Classification
* Regression

based on the target column.

---

## ✅ Multiple ML Models

### Classification Models

* Logistic Regression
* Ridge Classifier
* SGD Classifier
* Random Forest
* Extra Trees
* Gradient Boosting
* AdaBoost
* SVM
* Linear SVM
* KNN
* Naive Bayes
* MLP Classifier

---

### Regression Models

* Linear Regression
* Ridge
* Lasso
* ElasticNet
* SGD Regressor
* Random Forest Regressor
* Extra Trees Regressor
* Gradient Boosting Regressor
* AdaBoost Regressor
* SVR
* Linear SVR
* KNN Regressor
* MLP Regressor

---

## ✅ Hyperparameter Optimization

Integrated with:

* Optuna

for automatic hyperparameter tuning.

---

## ✅ Data Preprocessing

Automatically performs:

* Missing value handling
* Encoding categorical variables
* Feature scaling
* Train-test splitting

---

## ✅ Evaluation & Reporting

Generates:

* Leaderboards
* Accuracy / F1 Score
* R² Score
* Model comparison
* Performance reports

---

# 📁 Project Structure

```bash
AutoML-Framework/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│
├── configs/
│   └── config.yaml
│
├── outputs/
│   ├── plots/
│   ├── reports/
│   └── models/
│
├── src/
│   │
│   ├── data/
│   │   ├── loader.py
│   │   └── validator.py
│   │
│   ├── preprocessing/
│   │   ├── cleaner.py
│   │   ├── encoder.py
│   │   ├── scaler.py
│   │   └── splitter.py
│   │
│   ├── models/
│   │   ├── classification.py
│   │   ├── regression.py
│   │   └── model_factory.py
│   │
│   ├── optimization/
│   │   └── optuna_tuner.py
│   │
│   ├── evaluation/
│   │   ├── metrics.py
│   │   ├── plots.py
│   │   └── evaluator.py
│   │
│   ├── reports/
│   │   └── report_generator.py
│   │
│   ├── pipeline/
│   │   └── train_pipeline.py
│   │
│   ├── utils/
│       ├── logger.py
│       └── helpers.py
│
├── main.py
│
├── tests/
│
├── requirements.txt
├── README.md
├── setup.py
└── .gitignore
```

---

# ⚙️ Pipeline Flow

```text
load data
   ↓
validate
   ↓
clean
   ↓
encode
   ↓
split
   ↓
scale
   ↓
get models
   ↓
tune model
   ↓
train best model
   ↓
evaluate
   ↓
generate report
   ↓
save model
```

---

# 🔄 Internal Execution Flow

```text
main.py
   ↓
train_pipeline.py
   ↓
loader.py
   ↓
validator.py
   ↓
cleaner.py
   ↓
encoder.py
   ↓
splitter.py
   ↓
scaler.py
   ↓
model_factory.py
   ↓
optuna_tuner.py
   ↓
evaluator.py
   ↓
plots.py
   ↓
report_generator.py
```

---

# 📊 Output Directory

```bash
outputs/
├── plots/
├── reports/
└── models/
```

Generated artifacts include:

* Trained models
* Evaluation reports
* Performance plots
* Leaderboards

---

# 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/Avi-47/Automl-framework.git
cd Automl-framework
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# ▶️ Usage

Run the framework:

```bash
python main.py
```

Example:

```python
from src.pipeline.train_pipeline import run_pipeline

run_pipeline(
    data_path="data/raw/winequality-red.csv",
    target_column="quality"
)
```

---

# 📈 Example Output

```text
Detected task: classification

MODEL LEADERBOARD

                model     score
0                 svm  0.647059
1       random_forest  0.639706
2         extra_trees  0.636029
```

---

# 🧠 Technologies Used

* Python
* Pandas
* NumPy
* Scikit-learn
* Optuna
* Matplotlib
* Seaborn

---

# 🚧 Upcoming Features

* XGBoost Integration
* LightGBM Integration
* SHAP Explainability
* Streamlit Dashboard
* Automated Feature Engineering
* Model Export API
* Cross Validation Support
* Experiment Tracking
* Docker Support

---

# 🤝 Contributing

Contributions are welcome.

Feel free to:

* Fork the repository
* Open issues
* Submit pull requests

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed by Avimanyu Goswami

GitHub:

[Avi-47 GitHub Profile](https://github.com/Avi-47?utm_source=chatgpt.com)

