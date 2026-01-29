"""
Predictive Demand Engine - ML Forecasting Service
Uses scikit-learn for stock level predictions based on historical sales and inventory data.
"""
import os
import json
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Get database connection from environment variable."""
    return psycopg2.connect(os.environ.get('DATABASE_URL'), cursor_factory=RealDictCursor)

def get_sales_data():
    """Fetch historical sales data from database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            s.product_id,
            s.quantity,
            s.total_price,
            s.timestamp,
            p.name as product_name,
            p.sku,
            p.quantity as current_stock
        FROM sales s
        JOIN products p ON s.product_id = p.id
        ORDER BY s.timestamp DESC
    """)
    sales = cursor.fetchall()
    conn.close()
    return sales

def get_inventory_logs():
    """Fetch inventory movement logs from database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            entity_id as product_id,
            action,
            change_amount,
            timestamp
        FROM inventory_logs
        WHERE entity_type = 'PRODUCT'
        ORDER BY timestamp DESC
    """)
    logs = cursor.fetchall()
    conn.close()
    return logs

def get_products():
    """Fetch all products from database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, sku, quantity, price, predicted_stock, predicted_demand
        FROM products
        ORDER BY id
    """)
    products = cursor.fetchall()
    conn.close()
    return products

def update_product_predictions(product_id, predicted_stock, predicted_demand):
    """Update product with prediction data."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE products 
        SET predicted_stock = %s, predicted_demand = %s
        WHERE id = %s
    """, (predicted_stock, predicted_demand, product_id))
    conn.commit()
    conn.close()

def generate_forecast(product_id, days=7):
    """Generate 7-day demand forecast for a product using linear regression."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            DATE(timestamp) as sale_date,
            SUM(quantity) as daily_sales
        FROM sales
        WHERE product_id = %s AND timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
        ORDER BY sale_date
    """, (product_id,))
    
    historical_data = cursor.fetchall()
    
    cursor.execute("SELECT quantity FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    current_stock = product['quantity'] if product else 0
    
    conn.close()
    
    if len(historical_data) < 2:
        avg_daily_sales = 1
        predictions = []
        stock = current_stock
        for i in range(days):
            predicted_demand = avg_daily_sales
            stock = max(0, stock - predicted_demand)
            predictions.append({
                'day': i + 1,
                'date': (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d'),
                'predicted_demand': int(predicted_demand),
                'predicted_stock': int(stock)
            })
        return {
            'product_id': product_id,
            'current_stock': current_stock,
            'predictions': predictions,
            'total_predicted_demand': sum(p['predicted_demand'] for p in predictions),
            'needs_reorder': predictions[-1]['predicted_stock'] < 5
        }
    
    df = pd.DataFrame(historical_data)
    df['day_index'] = range(len(df))
    
    X = df['day_index'].values.reshape(-1, 1)
    y = df['daily_sales'].values
    
    model = LinearRegression()
    model.fit(X, y)
    
    predictions = []
    stock = current_stock
    start_day = len(df)
    
    for i in range(days):
        future_day = np.array([[start_day + i]])
        predicted_demand = max(0, int(model.predict(future_day)[0]))
        stock = max(0, stock - predicted_demand)
        
        predictions.append({
            'day': i + 1,
            'date': (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d'),
            'predicted_demand': predicted_demand,
            'predicted_stock': int(stock)
        })
    
    total_demand = sum(p['predicted_demand'] for p in predictions)
    final_stock = predictions[-1]['predicted_stock'] if predictions else current_stock
    
    update_product_predictions(product_id, final_stock, total_demand)
    
    return {
        'product_id': product_id,
        'current_stock': current_stock,
        'predictions': predictions,
        'total_predicted_demand': total_demand,
        'needs_reorder': final_stock < 5,
        'model_confidence': float(model.score(X, y)) if len(df) > 2 else 0.5
    }

@app.route('/api/analytics/forecast', methods=['GET'])
def forecast_all():
    """Get 7-day forecast for all products."""
    try:
        products = get_products()
        forecasts = []
        
        for product in products:
            forecast = generate_forecast(product['id'])
            forecast['product_name'] = product['name']
            forecast['sku'] = product['sku']
            forecasts.append(forecast)
        
        return jsonify({
            'success': True,
            'data': forecasts,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/forecast/<int:product_id>', methods=['GET'])
def forecast_product(product_id):
    """Get 7-day forecast for a specific product."""
    try:
        days = request.args.get('days', 7, type=int)
        forecast = generate_forecast(product_id, days)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name, sku FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        conn.close()
        
        if product:
            forecast['product_name'] = product['name']
            forecast['sku'] = product['sku']
        
        return jsonify({
            'success': True,
            'data': forecast,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/reorder-suggestions', methods=['GET'])
def reorder_suggestions():
    """Get products that need reordering based on predictions."""
    try:
        products = get_products()
        suggestions = []
        
        for product in products:
            forecast = generate_forecast(product['id'])
            if forecast['needs_reorder']:
                suggestions.append({
                    'product_id': product['id'],
                    'product_name': product['name'],
                    'sku': product['sku'],
                    'current_stock': product['quantity'],
                    'predicted_demand_7d': forecast['total_predicted_demand'],
                    'predicted_stock_7d': forecast['predictions'][-1]['predicted_stock'],
                    'suggested_reorder_quantity': max(10, forecast['total_predicted_demand'] * 2)
                })
        
        return jsonify({
            'success': True,
            'data': suggestions,
            'count': len(suggestions)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'forecasting'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
