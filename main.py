from src.pipeline.train_pipeline import run_pipeline

if __name__ == "__main__":

    run_pipeline(
        data_path="data/raw/Housing.csv",
        target_column="price"
    )