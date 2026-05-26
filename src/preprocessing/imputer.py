from sklearn.impute import SimpleImputer

def handle_missing_values(df):

    numeric_columns = df.select_dtypes(include=["int64", "float64"]).columns
    categorical_columns = df.select_dtypes(include=["object"]).columns

    df = df.copy()

    # Numeric columns (always safe in your datasets)
    if len(numeric_columns) > 0:
        num_imputer = SimpleImputer(strategy="median")
        df[numeric_columns] = num_imputer.fit_transform(df[numeric_columns])

    # Categorical columns (IMPORTANT FIX)
    if len(categorical_columns) > 0:
        cat_imputer = SimpleImputer(strategy="most_frequent")
        df[categorical_columns] = cat_imputer.fit_transform(df[categorical_columns])

    return df