import cv2
import time
import requests
import json
import random
import sys

# Configuration
API_URL = "http://localhost:5000/api/scan"
SIMULATION_MODE = True  # Set to False if running on a machine with a real camera

def scan_object(frame):
    """
    Simulate sophisticated computer vision logic.
    In a real app, this would use ML models to detect object properties.
    """
    # Placeholder logic for "detection"
    # We'll simulate detecting one of our seeded products
    
    # Randomly pick a "detected" SKU from a known list for demo purposes
    # In reality, this would be read from a QR code or barcode
    known_skus = ["PROD-001", "PROD-002", "PROD-003"]
    detected_sku = random.choice(known_skus)
    
    # Simulate analyzing properties
    colors = ["Red", "Blue", "Metallic Silver", "Matte Black", "Wood Grain"]
    textures = ["Smooth", "Rough", "Polished", "Grainy"]
    dimensions = ["10x10x5", "20x5x5", "15x15x15", "50x10x2"]
    
    return {
        "sku": detected_sku,
        "detectedColor": random.choice(colors),
        "detectedTexture": random.choice(textures),
        "detectedDimensions": random.choice(dimensions)
    }

def main():
    print(f"Starting Vision Engine (Simulation Mode: {SIMULATION_MODE})...")
    print(f"Target API: {API_URL}")

    if not SIMULATION_MODE:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Error: Could not open video capture device.")
            return

    try:
        while True:
            if not SIMULATION_MODE:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # In a real GUI environment, we'd show the frame
                # cv2.imshow('Smart Scan', frame)
                # if cv2.waitKey(1) & 0xFF == ord('q'):
                #     break
            else:
                # Simulate a frame capture delay
                time.sleep(2) 
                frame = None # No real frame in simulation

            # Perform detection
            # We only send data if we strictly "detect" something
            # For demo, we'll send data every few seconds
            if random.random() > 0.7: # 30% chance to detect per loop
                data = scan_object(frame)
                print(f"Detected Object: {data['sku']}")
                
                try:
                    response = requests.post(API_URL, json=data)
                    if response.status_code == 200:
                        print(f"Successfully sent data to API: {response.json()['message']}")
                    else:
                        print(f"API Error: {response.status_code} - {response.text}")
                except requests.exceptions.ConnectionError:
                    print("Connection Error: Is the Node.js server running?")
                
            time.sleep(1)

    except KeyboardInterrupt:
        print("Stopping Vision Engine...")
    finally:
        if not SIMULATION_MODE:
            cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
