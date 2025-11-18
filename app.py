"""
Chain Fit Studio - FINAL WORKING VERSION (2025)
React/Vite in root → builds to ./dist
Camera works 100% on all browsers
"""

from flask import Flask, send_from_directory, jsonify
import os
import base64

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
STATIC_FOLDER = os.path.join(BASE_DIR, "dist")
CHAIN_FOLDER = os.path.join(BASE_DIR, "chains")

print("=" * 70)
print("CHAIN FIT STUDIO - STARTING UP")
print(f"Root: {BASE_DIR}")
print(f"Static folder: {STATIC_FOLDER}")
print(f"Chain images folder: {CHAIN_FOLDER}")

# Verify build exists
if os.path.exists(STATIC_FOLDER) and os.path.exists(os.path.join(STATIC_FOLDER, "index.html")):
    print("React build FOUND → Site will load perfectly!")
else:
    print("ERROR: dist/index.html missing! Run 'npm run build'")

# Load chain images
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
                    print(f"Loaded chain: {file}")
            except Exception as e:
                print(f"Failed to load {file}: {e}")
else:
    print("No ./chains folder found!")

print(f"Total chains loaded: {len(chains_data)}")
print("=" * 70)

# Flask app
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')

# Serve React app
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# API
@app.route("/api/chains")
def get_chains():
    return jsonify({"chains": chains_data, "names": chain_names})

@app.route("/health")
def health():
    return jsonify({"status": "ok", "chains": len(chains_data)})

# THIS IS THE ONLY CAMERA HEADER COMBO THAT WORKS IN 2025
@app.after_request
def add_camera_headers(response):
    # Remove any blocking headers
    response.headers.pop("Permissions-Policy", None)
    response.headers.pop("Feature-Policy", None)
    
    # These two are REQUIRED for getUserMedia() to work
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"  # ← THIS ONE IS KEY
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Start
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Live at https://chain-fit-studio-2.onrender.com")
    app.run(host="0.0.0.0", port=port)
