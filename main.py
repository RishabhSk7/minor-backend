from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    send_from_directory,
    jsonify,
)
from flask_cors import CORS
import os
import Reddit
import requests
import concurrent.futures
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Ensure required directories exist
os.makedirs("Data", exist_ok=True)
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"txt", "png", "mp4", "jpg"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# --- Original app.py routes ---


@app.route("/")
def index():
    return render_template("minor.html")


@app.route("/analyzer")
def analyzer():
    return render_template("upload.html")


@app.route("/reddit", methods=["GET", "POST"])
def reddit():
    if request.method == "POST":
        subreddit_name = request.form.get("subreddit_name", "python").strip()
        if not subreddit_name:
            return render_template("reddit.html", error="Please enter a subreddit name")

        try:
            filename = Reddit.fetch_reddit_data(subreddit_name)
            return redirect(
                url_for(
                    "reddit_result",
                    subreddit=subreddit_name,
                    filename=os.path.basename(filename),
                )
            )
        except Exception as e:
            return render_template(
                "reddit.html", error=f"Error fetching data: {str(e)}"
            )

    return render_template("reddit.html")


@app.route("/reddit_result/<subreddit>/<filename>")
def reddit_result(subreddit, filename):
    try:
        with open(f"Data/{filename}", "r", encoding="utf-8") as file:
            content = file.read()
        return render_template(
            "reddit_result.html",
            content=content,
            subreddit=subreddit,
            filename=filename,
        )
    except FileNotFoundError:
        return render_template(
            "reddit_result.html",
            content="No data found",
            subreddit=subreddit,
            filename=None,
        )


@app.route("/download/<filename>")
def download_file(filename):
    return send_from_directory("Data", filename, as_attachment=True)


# --- Original main.py routes ---


@app.route("/image_upload", methods=["POST"])
def image_upload():
    uploaded_files = request.files.getlist("files")

    for f in uploaded_files:
        if f.filename.split(".")[-1].lower() not in {"jpg", "png"}:
            return (
                jsonify({"error": f"Unsupported extension in file {f.filename}"}),
                400,
            )

    image_files = [(f.filename, f) for f in uploaded_files]

    def predict_image(filename, image_file):
        results = []
        try:
            files = {"file": (filename, image_file, "multipart/form-data")}
            response = requests.post(
                "http://localhost:8003/predict-image",
                headers={"accept": "application/json"},
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

    with concurrent.futures.ThreadPoolExecutor() as executor:
        final_results = list(
            executor.map(lambda pair: predict_image(*pair), image_files)
        )

    return jsonify([item for sublist in final_results for item in sublist]), 200


@app.route("/text_upload", methods=["POST"])
def text_upload():
    print("Received request")
    uploaded_files = request.files.getlist("files")

    for f in uploaded_files:
        if f.filename.split(".")[-1].lower() != "txt":
            return (
                jsonify({"error": f"Unsupported extension in file {f.filename}"}),
                400,
            )

    in_memory_files = [(f.filename, f.read().decode("utf-8")) for f in uploaded_files]

    def classify_and_summarize(filename, data):
        results = []
        try:
            classify_resp = requests.post(
                "http://localhost:8001/classify-messages",
                json={"text": data.split("\n")},
            )
            classify_resp.raise_for_status()
            results.append({"Classify": classify_resp.json()})
        except Exception as e:
            results.append({"Classify": {"error": str(e)}})

        try:
            summarize_resp = requests.post(
                "http://localhost:8002/summarize", json={"text": data}
            )
            summarize_resp.raise_for_status()
            results.append(summarize_resp.json())
        except Exception as e:
            results.append({"Summary": {"error": str(e)}})

        return {filename: results}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        final_results = list(
            executor.map(lambda pair: classify_and_summarize(*pair), in_memory_files)
        )

    return jsonify(final_results), 200


# --- Run App ---
if __name__ == "__main__":
    app.run(debug=True)
