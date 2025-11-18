"""
Chain Fit Studio - Production Flask Backend
Serves React build + API endpoints
"""

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os
import base64

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ================== CONFIG ==================
CHAIN_FOLDER = "chains"
os.makedirs(CHAIN_FOLDER, exist_ok=True)

chains_data = []
chain_names = []

print("="*50)
print("CHAIN FIT STUDIO - Loading chains...")
print("="*50)

for file in sorted(os.listdir(CHAIN_FOLDER)):
    if file.lower().endswith(('.png', '.jpg', '.jpeg')):
        path = os.path.join(CHAIN_FOLDER, file)
        try:
            with open(path, 'rb') as f:
                img_data = base64.b64encode(f.read()).decode()
                ext = file.lower().split('.')[-1]
                mime_type = f"image/{ext}" if ext in ['png', 'jpg', 'jpeg'] else "image/png"
                
                chains_data.append({
                    'name': os.path.splitext(file)[0],
                    'data': f"data:{mime_type};base64,{img_data}"
                })
                chain_names.append(os.path.splitext(file)[0])
                print(f"   ✓ Loaded: {file}")
        except Exception as e:
            print(f"   ✗ Error loading {file}: {e}")

if not chains_data:
    print("\n⚠️  WARNING: No chain images found in 'chains/' folder!")
else:
    print(f"\n✓ Total chains loaded: {len(chains_data)}\n")

print("="*50)

# ================== API ROUTES ==================

@app.route('/api/chains', methods=['GET'])
def get_chains():
    """API endpoint to get all chain images"""
    return jsonify({
        'success': True,
        'chains': chains_data,
        'names': chain_names,
        'count': len(chains_data)
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'chains_loaded': len(chains_data),
        'version': '2.0'
    })

# ================== SERVE REACT APP ==================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React app"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# ================== SECURITY HEADERS ==================

@app.after_request
def add_security_headers(response):
    """Add security headers for camera access and CORS"""
    response.headers['Permissions-Policy'] = 'camera=*, microphone=*'
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    
    # CORS headers for API routes
    if response.headers.get('Content-Type', '').startswith('application/json'):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response

# ================== ERROR HANDLERS ==================

@app.errorhandler(404)
def not_found(e):
    # For API routes, return JSON
    if '/api/' in str(e):
        return jsonify({'error': 'Not found'}), 404
    # For other routes, serve React app (SPA routing)
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

# ================== MAIN ==================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("CHAIN FIT STUDIO - PRODUCTION SERVER")
    print("="*50)
    print("\n📦 Mode: React + Flask")
    print(f"📁 Serving from: {app.static_folder}")
    print(f"🔗 API available at: /api/chains")
    
    port = int(os.environ.get('PORT', 5000))
    
    print(f"\n🌐 Server starting on port {port}...")
    print("="*50 + "\n")
    
    app.run(
        debug=False,
        threaded=True,
        host='0.0.0.0',
        port=port
    )
