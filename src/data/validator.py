def validate_data(df, target_column):

    if target_column not in df.columns:
        raise ValueError("Target column not found.")

    print("Missing Values:")
    print(df.isnull().sum())

    print(f"Duplicates: {df.duplicated().sum()}")

    return True