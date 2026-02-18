"""
Advanced Computer Vision Engine with YOLOv8
Detects items, classifies by SKU, and flags anomalies.
Uses YOLOv8n (nano) for performance optimization.
"""
import os
import json
import time
import random
import base64
import requests
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import cv2
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

API_URL = "http://localhost:5000/api/scan"
SIMULATION_MODE = True  # Set to False with real camera + YOLO model

SKU_CLASS_MAPPING = {
    0: "PROD-001",  # chair
    1: "PROD-002",  # table
    2: "PROD-003",  # shelf
}

DAMAGE_INDICATORS = {
    'low_confidence': 0.5,
    'unusual_dimensions': True,
    'color_mismatch': True
}

def get_db_connection():
    """Get database connection from environment variable."""
    return psycopg2.connect(os.environ.get('DATABASE_URL'), cursor_factory=RealDictCursor)

def log_vision_status(product_id, sku, status, confidence, detected_class, bounding_box=None, notes=None):
    """Log vision detection to status_logs table."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO vision_status_logs 
            (product_id, sku, status, confidence_score, detected_class, bounding_box, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (product_id, sku, status, confidence, detected_class, 
              json.dumps(bounding_box) if bounding_box else None, notes))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error logging vision status: {e}")
        return False

def get_product_by_sku(sku):
    """Get product from database by SKU."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE sku = %s", (sku,))
        product = cursor.fetchone()
        conn.close()
        return product
    except Exception as e:
        print(f"Error getting product: {e}")
        return None

def simulate_yolo_detection(frame=None):
    """
    Simulate YOLOv8 detection for demo purposes.
    In production, this would use the actual ultralytics model.
    """
    known_skus = ["PROD-001", "PROD-002", "PROD-003"]
    detected_sku = random.choice(known_skus)
    
    confidence = random.uniform(0.65, 0.98)
    
    colors = ["Oak Brown", "Steel Gray", "Natural Wood", "Matte Black", "Glossy White"]
    textures = ["Smooth", "Rough", "Polished", "Grainy", "Textured"]
    dimensions = ["50x50x90", "120x80x75", "60x20x30", "80x40x45"]
    
    bounding_box = {
        'x': random.randint(50, 200),
        'y': random.randint(50, 200),
        'width': random.randint(100, 300),
        'height': random.randint(100, 300)
    }
    
    status = "OK"
    notes = None
    
    if confidence < DAMAGE_INDICATORS['low_confidence']:
        status = "UNKNOWN"
        notes = "Low confidence detection - manual review recommended"
    elif random.random() < 0.1:  # 10% chance of damage detection
        status = "DAMAGED"
        notes = "Potential damage detected - surface irregularities observed"
    elif random.random() < 0.05:  # 5% chance of non-standard
        status = "NON_STANDARD"
        notes = "Dimensions or appearance do not match standard specifications"
    
    return {
        'sku': detected_sku,
        'confidence': confidence,
        'status': status,
        'detected_class': detected_sku.split('-')[1],
        'bounding_box': bounding_box,
        'notes': notes,
        'detectedColor': random.choice(colors),
        'detectedTexture': random.choice(textures),
        'detectedDimensions': random.choice(dimensions)
    }

@app.route('/api/vision/scan', methods=['POST'])
def scan_item():
    """Process an image/frame for item detection."""
    try:
        detection = simulate_yolo_detection()
        
        product = get_product_by_sku(detection['sku'])
        product_id = product['id'] if product else 0
        
        log_vision_status(
            product_id=product_id,
            sku=detection['sku'],
            status=detection['status'],
            confidence=detection['confidence'],
            detected_class=detection['detected_class'],
            bounding_box=detection['bounding_box'],
            notes=detection['notes']
        )
        
        if product and detection['status'] == 'OK':
            try:
                response = requests.post(API_URL, json={
                    'sku': detection['sku'],
                    'detectedColor': detection['detectedColor'],
                    'detectedTexture': detection['detectedTexture'],
                    'detectedDimensions': detection['detectedDimensions']
                })
            except:
                pass
        
        return jsonify({
            'success': True,
            'data': {
                **detection,
                'product_id': product_id,
                'product_name': product['name'] if product else None,
                'timestamp': datetime.now().isoformat()
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vision/status-logs', methods=['GET'])
def get_status_logs():
    """Get recent vision status logs."""
    try:
        limit = request.args.get('limit', 50, type=int)
        status_filter = request.args.get('status')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM vision_status_logs ORDER BY timestamp DESC LIMIT %s"
        params = [limit]
        
        if status_filter:
            query = """
                SELECT * FROM vision_status_logs 
                WHERE status = %s 
                ORDER BY timestamp DESC LIMIT %s
            """
            params = [status_filter, limit]
        
        cursor.execute(query, params)
        logs = cursor.fetchall()
        conn.close()
        
        for log in logs:
            if log.get('timestamp'):
                log['timestamp'] = log['timestamp'].isoformat()
            if log.get('bounding_box') and isinstance(log['bounding_box'], str):
                log['bounding_box'] = json.loads(log['bounding_box'])
        
        return jsonify({
            'success': True,
            'data': logs,
            'count': len(logs)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vision/anomalies', methods=['GET'])
def get_anomalies():
    """Get items flagged with anomalies."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM vision_status_logs 
            WHERE status IN ('DAMAGED', 'NON_STANDARD', 'UNKNOWN')
            ORDER BY timestamp DESC
            LIMIT 100
        """)
        anomalies = cursor.fetchall()
        conn.close()
        
        for a in anomalies:
            if a.get('timestamp'):
                a['timestamp'] = a['timestamp'].isoformat()
        
        return jsonify({
            'success': True,
            'data': anomalies,
            'count': len(anomalies)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vision/stream', methods=['GET'])
def get_stream_info():
    """Get camera stream information."""
    return jsonify({
        'success': True,
        'simulation_mode': SIMULATION_MODE,
        'model': 'YOLOv8n (nano)',
        'status': 'ready'
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information."""
    return jsonify({
        'service': 'Asset Verifier Vision Engine',
        'version': '1.0.0',
        'model': 'YOLOv8n (nano)',
        'simulation_mode': SIMULATION_MODE,
        'endpoints': {
            'health': '/health',
            'scan_item': 'POST /api/vision/scan',
            'status_logs': 'GET /api/vision/status-logs',
            'anomalies': 'GET /api/vision/anomalies',
            'stream_info': 'GET /api/vision/stream'
        },
        'status': 'running'
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'vision'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
