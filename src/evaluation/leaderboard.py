import pandas as pd
from sklearn.metrics import r2_score, accuracy_score


def build_leaderboard(models, X_train, X_test, y_train, y_test, task_type):

    results = []
    trained_models = {}

    for name, model in models.items():

        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if task_type == "classification":
            score = accuracy_score(y_test, preds)
        else:
            score = r2_score(y_test, preds)

        trained_models[name] = model

        results.append({
            "model": name,
            "score": score
        })

    df = pd.DataFrame(results)
    df = df.sort_values(by="score", ascending=False)

    return df, trained_models