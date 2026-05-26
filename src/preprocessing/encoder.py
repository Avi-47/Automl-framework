import pandas as pd

from sklearn.preprocessing import LabelEncoder


def encode_target(df, target_column):

    encoder = None

    if df[target_column].dtype == "object":

        encoder = LabelEncoder()

        df[target_column] = encoder.fit_transform(
            df[target_column]
        )

    return df, encoder


def encode_features(X):

    categorical_columns = X.select_dtypes(
        include=["object"]
    ).columns

    X = pd.get_dummies(
        X,
        columns=categorical_columns,
        drop_first=True
    )

    return X