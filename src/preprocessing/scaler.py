from sklearn.preprocessing import StandardScaler

def scale_features(X_train, X_test):

    scaler = StandardScaler()

    numeric_columns = X_train.select_dtypes(
        include=["int64", "float64"]
    ).columns

    X_train[numeric_columns] = scaler.fit_transform(
        X_train[numeric_columns]
    )

    X_test[numeric_columns] = scaler.transform(
        X_test[numeric_columns]
    )

    return X_train, X_test, scaler