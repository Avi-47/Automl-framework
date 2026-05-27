export const navItems = [
  { label: 'Upload', href: '/upload', icon: 'Upload' },
  { label: 'Training', href: '/training', icon: 'Sparkles' },
  { label: 'Visualizations', href: '/visualizations', icon: 'ChartNoAxesCombined' },
  { label: 'Predictions', href: '/predictions', icon: 'Brain' },
  { label: 'Reports', href: '/reports', icon: 'FileText' },
];

export const landingStats = [
  { label: 'Datasets processed', value: 12480, suffix: '+' },
  { label: 'Models benchmarked', value: 94, suffix: '' },
  { label: 'Average lift', value: 28.6, suffix: '%' },
  { label: 'Optuna trials run', value: 58420, suffix: '+' },
];

export const landingFeatures = [
  {
    title: 'Task detection',
    description: 'Automatically detects classification or regression patterns from uploaded CSVs.',
    icon: 'ScanSearch',
  },
  {
    title: 'Model leaderboard',
    description: 'Compare candidate models with tuned metrics, scores, and training status.',
    icon: 'Trophy',
  },
  {
    title: 'Optuna tuning',
    description: 'Visualize each trial, hyperparameter sweep, and the best performing configuration.',
    icon: 'CircuitBoard',
  },
  {
    title: 'Explainability',
    description: 'Feature importance, correlation, and distribution charts for rapid data understanding.',
    icon: 'ChartBarStacked',
  },
  {
    title: 'Prediction exports',
    description: 'Generate mock predictions, confidence scores, and downloadable reports.',
    icon: 'FileDown',
  },
  {
    title: 'SaaS-grade UI',
    description: 'Glassmorphism cards, responsive layouts, subtle motion, and premium polish throughout.',
    icon: 'Stars',
  },
];

export const howItWorks = [
  { title: 'Upload CSV', description: 'Drop your dataset and inspect sample rows, data types, and null patterns.' },
  { title: 'Run AutoML', description: 'The dashboard simulates task detection, preprocessing, and model benchmarking.' },
  { title: 'Tune & compare', description: 'Watch Optuna progress, leaderboard ranking, and metric deltas in real time.' },
  { title: 'Ship results', description: 'Export reports, predictions, and trained model artifacts from one control room.' },
];

export const pricingPlans = [
  { name: 'Starter', price: '$0', description: 'For quick experiments and demos.', features: ['1 workspace', 'Mock AutoML pipeline', 'Basic charts'] },
  { name: 'Pro', price: '$29', description: 'For analysts and product teams.', features: ['Unlimited datasets', 'Live training logs', 'Advanced reports'], featured: true },
  { name: 'Enterprise', price: 'Custom', description: 'For scale, governance, and support.', features: ['SSO-ready UI', 'Team dashboards', 'Priority support'] },
];

export const datasetStats = [
  { label: 'Rows', value: 12840, accent: 'cyan' },
  { label: 'Columns', value: 28, accent: 'violet' },
  { label: 'Missing', value: 642, accent: 'rose' },
  { label: 'Target classes', value: 3, accent: 'emerald' },
];

export const datasetPreview = [
  { PassengerId: 1, Name: 'Ava Chen', Age: 34, Income: 125000, Score: 0.91, Segment: 'Premium' },
  { PassengerId: 2, Name: 'Noah Patel', Age: 29, Income: 86000, Score: 0.83, Segment: 'Growth' },
  { PassengerId: 3, Name: 'Mia Rivera', Age: 41, Income: 143000, Score: 0.95, Segment: 'Premium' },
  { PassengerId: 4, Name: 'Liam Johnson', Age: 27, Income: 72000, Score: 0.76, Segment: 'Growth' },
  { PassengerId: 5, Name: 'Sophia Kim', Age: 38, Income: 98000, Score: 0.88, Segment: 'Core' },
];

export const datasetColumns = [
  { name: 'PassengerId', type: 'Integer', missing: 0 },
  { name: 'Name', type: 'Text', missing: 0 },
  { name: 'Age', type: 'Numeric', missing: 28 },
  { name: 'Income', type: 'Numeric', missing: 14 },
  { name: 'Score', type: 'Float', missing: 4 },
  { name: 'Segment', type: 'Category', missing: 0 },
];

export const missingValues = [
  { column: 'Age', percent: 21 },
  { column: 'Income', percent: 11 },
  { column: 'Score', percent: 3 },
  { column: 'AccountAge', percent: 16 },
  { column: 'ChurnRisk', percent: 8 },
];

export const trainingLogs = [
  'Dataset validated with 12,840 rows and 28 features.',
  'Target column inferred as a 3-class classification problem.',
  'Missing values imputed using median and most-frequent strategies.',
  'One-hot encoding completed for 8 categorical columns.',
  'RandomForest training started with 120 estimators.',
  'Optuna trial 14 improved validation F1 by +2.3%.',
  'XGBoost candidate reached 0.984 ROC-AUC and is now leader.',
  'Final model retrained on combined train/validation split.',
];

export const leaderboard = [
  { model: 'XGBoost', accuracy: 0.984, precision: 0.981, recall: 0.979, f1: 0.98, auc: 0.993, status: 'Best' },
  { model: 'Random Forest', accuracy: 0.974, precision: 0.969, recall: 0.964, f1: 0.966, auc: 0.987, status: 'Runner-up' },
  { model: 'LightGBM', accuracy: 0.968, precision: 0.961, recall: 0.959, f1: 0.96, auc: 0.982, status: 'Strong' },
  { model: 'CatBoost', accuracy: 0.961, precision: 0.955, recall: 0.951, f1: 0.952, auc: 0.978, status: 'Stable' },
  { model: 'Logistic Regression', accuracy: 0.931, precision: 0.927, recall: 0.918, f1: 0.921, auc: 0.954, status: 'Baseline' },
];

export const optunaTrials = [
  { trial: 1, score: 0.942, params: 'depth=5, lr=0.06, n_estimators=120', delta: '+0.8%' },
  { trial: 2, score: 0.955, params: 'depth=6, lr=0.04, n_estimators=160', delta: '+1.3%' },
  { trial: 3, score: 0.967, params: 'depth=8, lr=0.03, n_estimators=220', delta: '+1.2%' },
  { trial: 4, score: 0.976, params: 'depth=9, lr=0.02, n_estimators=260', delta: '+0.9%' },
  { trial: 5, score: 0.984, params: 'depth=10, lr=0.018, n_estimators=300', delta: '+0.8%' },
];

export const bestHyperparameters = [
  { name: 'max_depth', value: 10 },
  { name: 'learning_rate', value: 0.018 },
  { name: 'n_estimators', value: 300 },
  { name: 'subsample', value: 0.86 },
  { name: 'colsample_bytree', value: 0.92 },
  { name: 'min_child_weight', value: 3 },
];

export const rocCurve = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.02, tpr: 0.43 },
  { fpr: 0.05, tpr: 0.71 },
  { fpr: 0.09, tpr: 0.84 },
  { fpr: 0.13, tpr: 0.9 },
  { fpr: 0.21, tpr: 0.95 },
  { fpr: 0.34, tpr: 0.98 },
  { fpr: 1, tpr: 1 },
];

export const featureImportance = [
  { feature: 'Income', importance: 31 },
  { feature: 'Score', importance: 22 },
  { feature: 'Age', importance: 16 },
  { feature: 'AccountAge', importance: 13 },
  { feature: 'Engagement', importance: 10 },
  { feature: 'GeoRegion', importance: 8 },
];

export const correlationLabels = ['Income', 'Score', 'Age', 'AccountAge', 'Engagement'];
export const correlationMatrix = [
  [1.0, 0.74, 0.29, 0.24, 0.31],
  [0.74, 1.0, 0.18, 0.42, 0.58],
  [0.29, 0.18, 1.0, 0.62, 0.21],
  [0.24, 0.42, 0.62, 1.0, 0.19],
  [0.31, 0.58, 0.21, 0.19, 1.0],
];

export const classDistribution = [
  { name: 'Class A', value: 48 },
  { name: 'Class B', value: 32 },
  { name: 'Class C', value: 20 },
];

export const accuracyComparison = [
  { model: 'XGBoost', accuracy: 98.4 },
  { model: 'Random Forest', accuracy: 97.4 },
  { model: 'LightGBM', accuracy: 96.8 },
  { model: 'CatBoost', accuracy: 96.1 },
  { model: 'LogReg', accuracy: 93.1 },
];

export const precisionRecallF1 = [
  { model: 'XGBoost', precision: 98.1, recall: 97.9, f1: 98.0 },
  { model: 'Random Forest', precision: 96.9, recall: 96.4, f1: 96.6 },
  { model: 'LightGBM', precision: 96.1, recall: 95.9, f1: 96.0 },
];

export const confusionMatrix = [
  { actual: 'Class A', predicted: 'Class A', value: 231 },
  { actual: 'Class A', predicted: 'Class B', value: 12 },
  { actual: 'Class A', predicted: 'Class C', value: 6 },
  { actual: 'Class B', predicted: 'Class A', value: 8 },
  { actual: 'Class B', predicted: 'Class B', value: 184 },
  { actual: 'Class B', predicted: 'Class C', value: 10 },
  { actual: 'Class C', predicted: 'Class A', value: 4 },
  { actual: 'Class C', predicted: 'Class B', value: 9 },
  { actual: 'Class C', predicted: 'Class C', value: 156 },
];

export const predictionRows = [
  { id: 'P-001', segment: 'Premium', probability: 97.8, prediction: 'Renew', confidence: 'Very high' },
  { id: 'P-002', segment: 'Growth', probability: 84.4, prediction: 'Renew', confidence: 'High' },
  { id: 'P-003', segment: 'Core', probability: 62.1, prediction: 'Review', confidence: 'Medium' },
  { id: 'P-004', segment: 'At risk', probability: 29.3, prediction: 'Churn', confidence: 'Low' },
  { id: 'P-005', segment: 'Growth', probability: 88.7, prediction: 'Renew', confidence: 'High' },
];

export const reportSummary = [
  { label: 'Best model', value: 'XGBoost' },
  { label: 'Validation F1', value: '98.0%' },
  { label: 'Trials completed', value: '5' },
  { label: 'Artifacts ready', value: '3' },
];