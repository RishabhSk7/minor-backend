from flask import Flask, jsonify, request
import os
import requests
import concurrent.futures
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"txt", "png", "mp4", "jpg"}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/image_upload", methods=["POST"])
def image_upload():
    uploaded_files = request.files.getlist("files")

    # Validate file extensions
    for f in uploaded_files:
        if f.filename.split(".")[-1].lower() not in {"jpg", "png"}:
            return (
                jsonify({"error": f"Unsupported extension in file {f.filename}"}),
                400,
            )

    # Read images into memory first
    image_files = [(f.filename, f) for f in uploaded_files]

    def predict_image(filename, image_file):
        results = []
        try:
            # Prepare file for multipart upload
            files = {"file": (filename, image_file, "multipart/form-data")}
            # Send POST request to the image prediction API
            response = requests.post(
                "http://localhost:8003/predict-image",
                headers={
                    "accept": "application/json"
                },
                files=files,
            )
            response.raise_for_status()
            prediction = response.json()
            results.append(
                {
                    "filename": filename,
                    "label": prediction.get("label", "unknown"),
                    "confidence": prediction.get("score", 0),
                }
            )
        except Exception as e:
            results.append({"filename": filename, "error": str(e)})

        return results

    # Run prediction for each image in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        final_results = list(
            executor.map(lambda pair: predict_image(*pair), image_files)
        )

    # Flatten the results and return them
    return jsonify([item for sublist in final_results for item in sublist]), 200


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/text_upload", methods=["POST"])
def text_upload():
    print("Received request")
    uploaded_files = request.files.getlist("files")

    # Validate file extensions
    for f in uploaded_files:
        if f.filename.split(".")[-1].lower() !="txt":
            return (
                jsonify({"error": f"Unsupported extension in file {f.filename}"}),
                400,
            )

    # Read content into memory first
    in_memory_files = [
        (f.filename, f.read().decode("utf-8")) for f in uploaded_files
    ]

    def classify_and_summarize(filename, data):
        results = []

        # Classification
        try:
            classify_resp = requests.post(
                "http://localhost:8001/classify-messages",
                json={"text": data.split("\n")},
            )
            classify_resp.raise_for_status()
            results.append({"Classify": classify_resp.json()})
        except Exception as e:
            results.append({"Classify": {"error": str(e)}})

        # Summarization
        try:
            summarize_resp = requests.post(
                "http://localhost:8002/summarize", json={"text": data}
            )
            summarize_resp.raise_for_status()
            results.append( summarize_resp.json())
        except Exception as e:
            results.append({"Summary": {"error": str(e)}})

        return {filename: results}

    # Run classification and summarization in parallel per file
    with concurrent.futures.ThreadPoolExecutor() as executor:
        final_results = list(
            executor.map(lambda pair: classify_and_summarize(*pair), in_memory_files)
        )

    return jsonify(final_results), 200
