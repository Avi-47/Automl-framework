def detect_task(y):

    if y.dtype == "object":
        return "classification"

    if y.nunique() < 20:
        return "classification"

    return "regression"