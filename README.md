# Crime Document Analyzer Flask Server

This is the backend Flask server for the Crime Document Analyzer project. It provides endpoints for uploading and analyzing text and image files, as well as Reddit data fetching and download functionality.

---

## Features

- **Text File Analysis:** Upload `.txt` files for classification and summarization.
- **Image File Analysis:** Upload `.jpg` or `.png` images for prediction.
- **Reddit Data Fetching:** Fetch and display subreddit data.
- **File Download:** Download processed data files.
- **CORS Enabled:** Allows cross-origin requests for frontend integration.

---

## Project Structure

```
backend/
│
├── main.py                # Flask server (this file)
├── Reddit.py              # Reddit data fetching logic
├── requirements.txt       # Python dependencies
├── Data/                  # Folder for storing processed data
├── uploads/               # Folder for uploaded files
├── static/                # Static files (CSS, JS, images)
└── templates/             # HTML templates (minor.html, upload.html, etc.)
```

---

## Requirements

- Python 3.8+
- [Flask](https://flask.palletsprojects.com/)
- [Flask-CORS](https://flask-cors.readthedocs.io/)
- [requests](https://docs.python-requests.org/)
- Any additional dependencies in `requirements.txt`

---

## Installation

1. **Clone the repository** and navigate to the `backend` directory.

2. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3. **Ensure the following directories exist** (the server will create them if missing):
    - `Data/`
    - `uploads/`

4. **Place your HTML templates** in the `templates/` folder and static files in `static/`.

---

## Running the Server

### Development (Local)

```bash
python main.py
```

By default, the server runs on [http://127.0.0.1:5000](http://127.0.0.1:5000).

### With Flask CLI

```bash
export FLASK_APP=main.py
export FLASK_ENV=development
flask run
```

### With Docker

1. **Build the image:**
    ```bash
    docker build -t crime-analyzer-backend .
    ```
2. **Run the container:**
    ```bash
    docker run -p 5000:5000 crime-analyzer-backend
    ```

---

## API Endpoints

### Web Pages

- `GET /`  
  Renders the main dashboard (`minor.html`).

- `GET /analyzer`  
  Renders the upload/analyzer page (`upload.html`).

### Reddit

- `GET, POST /reddit`  
  Fetch subreddit data via form.

- `GET /reddit_result/<subreddit>/<filename>`  
  Display fetched subreddit data.

- `GET /download/<filename>`  
  Download a processed data file.

### File Upload & Analysis

- `POST /image_upload`  
  Upload and analyze image files (`.jpg`, `.png`).  
  **Request:** `multipart/form-data` with `files` field.  
  **Response:** JSON with prediction results.

- `POST /text_upload`  
  Upload and analyze text files (`.txt`).  
  **Request:** `multipart/form-data` with `files` field.  
  **Response:** JSON with classification and summary results.

---

## Notes

- The server expects other microservices to be running at:
    - `http://localhost:8001/classify-messages` (for text classification)
    - `http://localhost:8002/summarize` (for text summarization)
    - `http://localhost:8003/predict-image` (for image prediction)
- Make sure these services are running for full functionality.

---

## License

This project is for academic/demo purposes.
