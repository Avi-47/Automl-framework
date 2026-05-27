import pandas as pd

def load_data(data_path):

    try:
        df = pd.read_csv(data_path, sep=None, engine="python")

        print(f"Dataset Loaded Successfully: {data_path}")
        print(f"Shape: {df.shape}")

        return df

    except Exception as e:
        raise Exception(f"Error loading dataset: {e}")