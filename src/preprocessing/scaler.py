from sklearn.preprocessing import StandardScaler

def scale_features(X_train, X_test):

    X_train = X_train.copy()
    X_test = X_test.copy()

    scaler = StandardScaler()

    numeric_columns = X_train.select_dtypes(
        include=["number"]
    ).columns

    X_train.loc[:, numeric_columns] = scaler.fit_transform(
        X_train[numeric_columns]
    )

    X_test.loc[:, numeric_columns] = scaler.transform(
        X_test[numeric_columns]
    )

    return X_train, X_test, scaler