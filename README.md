FINAL PROJECT ARCHITECTURE

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


FULL FLOW

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


Internally:

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


outputs/
├── plots/
├── reports/
└── models/