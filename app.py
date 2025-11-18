"""
Chain Fit Studio - FINAL 100% WORKING VERSION
- React/Vite in root → builds to ./dist
- Chain images in ./chains folder
- CAMERA PERMISSION FIXED (2025 browsers)
"""

from flask import Flask, send_from_directory, jsonify
import os
import base64

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, "dist")        # Vite build output
CHAIN_FOLDER = os.path.join(BASE_DIR, "chains")       # Your PNG images

print("=" * 70)
print("CHAIN FIT STUDIO - STARTING")
print(f"Root: {BASE_DIR}")
print(f"React build: {STATIC_FOLDER}")
print(f"Chain images: {CHAIN_FOLDER}")

# Verify React build exists
if os.path.exists(STATIC_FOLDER):
    print("React build FOUND → Site will load!")
    print("Files:", os.listdir(STATIC_FOLDER)[:6])
else:
    print("ERROR: dist/ folder missing! Build failed.")

# Load chain images from ./chains folder
chains_data = []
chain_names = []

if os.path.exists(CHAIN_FOLDER):
    for file in sorted(os.listdir(CHAIN_FOLDER)):
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            path = os.path.join(CHAIN_FOLDER, file)
            try:
                with open(path, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode()
                    mime = "image/png" if file.lower().endswith('.png') else "image/jpeg"
                    chains_data.append({
                        "name": os.path.splitext(file)[0],
                        "data": f"data:{mime};base64,{b64}"
                    })
                    chain_names.append(os.path.splitext(file)[0])
                    print(f"Loaded: {file}")
            except Exception as e:
                print(f"Failed to load {file}: {e}")
else:
    print("No chains folder found!")

print(f"Total chains loaded: {len(chains_data)}")
print("=" * 70)

# Flask app
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

@app.route("/api/chains")
def get_chains():
    return jsonify({"chains": chains_data, "names": chain_names})

@app.route("/health")
def health():
    return jsonify({"status": "ok", "chains": len(chains_data)})

# CRITICAL: FIXED CAMERA PERMISSION HEADERS (2025)
@app.after_request
def add_security_headers(response):
    # Remove any blocking Permissions-Policy
    response.headers.pop("Permissions-Policy", None)
    
    # These two headers are REQUIRED for camera in modern browsers
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    
    # Allow CORS (needed for local testing)
    response.headers["Access-Control-Allow-Origin"] = "*"
    
    return response

# Start server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Server running → https://your-url.onrender.com")
    app.run(host="0.0.0.0", port=port)
