from src.pipeline.train_pipeline import run_pipeline

if __name__ == "__main__":

    run_pipeline(
        data_path="data/raw/Real Estate Price Prediction Process.csv",
        target_column="Price"
    )