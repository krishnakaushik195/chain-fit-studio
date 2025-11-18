"""
Chain Fit Studio - FINAL WORKING VERSION FOR RENDER
Serves React app from chains/dist + loads chain images as base64
"""

from flask import Flask, send_from_directory, jsonify
import os
import base64

# === ABSOLUTE PATH FIX - THIS IS THE KEY ===
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, "chains", "dist")

print("=" * 60)
print("CHAIN FIT STUDIO - STARTING")
print(f"Project root: {BASE_DIR}")
print(f"Static folder: {STATIC_FOLDER}")

# Verify build exists
if os.path.exists(STATIC_FOLDER):
    files = os.listdir(STATIC_FOLDER)
    print(f"Build folder found! Contents: {files}")
    index_path = os.path.join(STATIC_FOLDER, "index.html")
    if os.path.exists(index_path):
        print("index.html FOUND → Website will load perfectly!")
    else:
        print("WARNING: index.html missing in dist!")
else:
    short_path = os.path.join("chains", "dist")
    print(f"ERROR: Build folder NOT found at {short_path}")
    print("   Make sure 'npm run build' runs in 'chains/' folder!")
print("=" * 60)

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')

# Load chains from chains/ folder (images only, not in dist)
CHAIN_FOLDER = os.path.join(BASE_DIR, "chains")
chains_data = []
chain_names = []

print("Loading chain images from:", CHAIN_FOLDER)
for file in sorted(os.listdir(CHAIN_FOLDER)):
    if file.lower().endswith(('.png', '.jpg', '.jpeg')):
        filepath = os.path.join(CHAIN_FOLDER, file)
        if os.path.isfile(filepath):
            try:
                with open(filepath, "rb") as f:
                    img_data = base64.b64encode(f.read()).decode()
                    ext = file.split(".")[-1].lower()
                    mime = "image/png" if ext == "png" else "image/jpeg"
                    chains_data.append({
                        "name": os.path.splitext(file)[0],
                        "data": f"data:{mime};base64,{img_data}"
                    })
                    chain_names.append(os.path.splitext(file)[0])
                    print(f"   Loaded: {file}")
            except Exception as e:
                print(f"   Failed to load {file}: {e}")

print(f"Total chains loaded: {len(chains_data)}")
print("=" * 60)

# === ROUTES ===
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, "index.html")
        else:
            return "Build missing! Run 'npm run build' in chains/", 500

@app.route("/api/chains")
def get_chains():
    return jsonify({"chains": chains_data, "names": chain_names})

@app.route("/health")
def health():
    return jsonify({"status": "ok", "chains": len(chains_data)})

# Camera permission headers
@app.after_request
def add_headers(response):
    response.headers["Permissions-Policy"] = "camera=*, microphone=*"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# === START SERVER ===
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Server starting on http://localhost:{port}")
    print("Open your Render URL to see Chain Fit Studio!")
    app.run(host="0.0.0.0", port=port, debug=False)
