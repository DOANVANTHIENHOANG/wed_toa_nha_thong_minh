"""
SED V2.1 - Machine Learning Prediction Module
Dự báo tiêu thụ điện dựa trên dữ liệu lịch sử
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import json

def predict_next_hour_consumption(history_data, temperature, humidity, occupancy):
    """
    Dự báo tiêu thụ điện cho 1 giờ tới dựa trên:
    - Lịch sử dữ liệu
    - Nhiệt độ hiện tại
    - Độ ẩm hiện tại
    - Số người hiện tại
    
    Args:
        history_data: List các bản ghi lịch sử
        temperature: Nhiệt độ hiện tại (°C)
        humidity: Độ ẩm hiện tại (%)
        occupancy: Số người hiện tại
    
    Returns:
        Dict với dự báo công suất
    """
    
    if not history_data or len(history_data) < 10:
        return {
            'error': 'Insufficient data for prediction',
            'predicted_power_kw': 2.0,
            'confidence': 0.0,
            'data_points': len(history_data) if history_data else 0
        }
    
    try:
        # Chuẩn bị dữ liệu training
        X_train = []
        y_power = []
        
        for record in history_data:
            # Features: [hour, temperature, humidity, occupancy]
            timestamp = datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat()))
            hour = timestamp.hour
            
            X_train.append([
                hour,
                record.get('temperature', 22.0),
                record.get('humidity', 65.0),
                record.get('occupancy', 0)
            ])
            
            y_power.append(record.get('power_kw', 1.0))
        
        # Convert to arrays
        X_train = np.array(X_train)
        y_power = np.array(y_power)
        
        # Standardize features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        
        # Train model
        model = LinearRegression()
        model.fit(X_train_scaled, y_power)
        
        # Prepare current data
        now = datetime.now()
        current_hour = (now.hour + 1) % 24  # Dự báo giờ tới
        
        X_current = np.array([[current_hour, temperature, humidity, occupancy]])
        X_current_scaled = scaler.transform(X_current)
        
        # Predict
        predicted_power = model.predict(X_current_scaled)[0]
        predicted_power = max(0.1, min(predicted_power, 10.0))  # Clamp between 0.1 and 10.0
        
        # Tính R² score làm confidence
        score = model.score(X_train_scaled, y_power)
        confidence = max(0, min(score, 1.0))  # Normalize to [0, 1]
        
        return {
            'predicted_power_kw': round(predicted_power, 2),
            'confidence': round(confidence, 2),
            'predicted_hour': f"{current_hour:02d}:00",
            'data_points': len(history_data),
            'features': {
                'hour': current_hour,
                'temperature': temperature,
                'humidity': humidity,
                'occupancy': occupancy
            },
            'model_coef': [round(c, 4) for c in model.coef_],
            'model_intercept': round(model.intercept_, 4)
        }
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            'error': str(e),
            'predicted_power_kw': 2.0,
            'confidence': 0.0
        }

def predict_daily_consumption(history_data):
    """
    Dự báo tiêu thụ điện trong ngày (24 giờ)
    
    Args:
        history_data: List các bản ghi lịch sử
    
    Returns:
        Dict với dự báo cho mỗi giờ
    """
    
    if not history_data or len(history_data) < 24:
        return {
            'error': 'Insufficient data for daily prediction',
            'hourly_forecast': [2.0] * 24,
            'total_forecast_kwh': 48.0
        }
    
    try:
        # Group by hour
        hourly_avg = {}
        for record in history_data:
            timestamp = datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat()))
            hour = timestamp.hour
            
            if hour not in hourly_avg:
                hourly_avg[hour] = {'sum': 0, 'count': 0}
            
            hourly_avg[hour]['sum'] += record.get('power_kw', 1.0)
            hourly_avg[hour]['count'] += 1
        
        # Calculate average for each hour
        hourly_forecast = []
        for hour in range(24):
            if hour in hourly_avg:
                avg = hourly_avg[hour]['sum'] / hourly_avg[hour]['count']
            else:
                avg = 2.0
            
            hourly_forecast.append(round(avg, 2))
        
        total_kwh = sum(hourly_forecast)
        cost = total_kwh * 2500  # ₫/kWh
        
        return {
            'hourly_forecast': hourly_forecast,
            'total_forecast_kwh': round(total_kwh, 2),
            'estimated_cost_vnd': round(cost, 0),
            'peak_hours': list(range(18, 22)),  # 18:00-21:00
            'low_hours': [0, 1, 2, 3, 4, 5]  # 00:00-05:00
        }
    
    except Exception as e:
        print(f"Error in daily forecast: {e}")
        return {
            'error': str(e),
            'hourly_forecast': [2.0] * 24,
            'total_forecast_kwh': 48.0
        }

def predict_monthly_consumption(history_data):
    """
    Dự báo tiêu thụ điện trong tháng
    
    Args:
        history_data: List các bản ghi lịch sử
    
    Returns:
        Dict với dự báo theo tuần
    """
    
    if not history_data:
        return {
            'error': 'No historical data',
            'estimated_kwh': 1440,  # 30 days × 48 kWh/day
            'estimated_cost_vnd': 3600000
        }
    
    try:
        # Tính average daily consumption
        daily_totals = {}
        
        for record in history_data:
            timestamp = datetime.fromisoformat(record.get('timestamp', datetime.now().isoformat()))
            date_key = timestamp.date().isoformat()
            
            if date_key not in daily_totals:
                daily_totals[date_key] = 0
            
            daily_totals[date_key] += record.get('power_kw', 1.0)
        
        # Average per day (hourly sums converted to daily)
        if daily_totals:
            avg_daily_kwh = sum(daily_totals.values()) / len(daily_totals)
        else:
            avg_daily_kwh = 48.0
        
        # Monthly estimate (30 days)
        monthly_kwh = avg_daily_kwh * 30
        cost = monthly_kwh * 2500  # ₫/kWh
        
        # Week-by-week breakdown
        week_1 = round(avg_daily_kwh * 7, 2)
        week_2 = round(avg_daily_kwh * 7, 2)
        week_3 = round(avg_daily_kwh * 7, 2)
        week_4 = round(avg_daily_kwh * 2, 2)
        
        return {
            'estimated_kwh': round(monthly_kwh, 2),
            'estimated_cost_vnd': round(cost, 0),
            'average_daily_kwh': round(avg_daily_kwh, 2),
            'weekly_breakdown': [week_1, week_2, week_3, week_4],
            'total_weeks': 4,
            'days_in_forecast': 30
        }
    
    except Exception as e:
        print(f"Error in monthly forecast: {e}")
        return {
            'error': str(e),
            'estimated_kwh': 1440,
            'estimated_cost_vnd': 3600000
        }

def detect_anomalies(history_data, window_size=24):
    """
    Phát hiện bất thường trong tiêu thụ điện dựa trên độ lệch chuẩn
    
    Args:
        history_data: List các bản ghi lịch sử
        window_size: Kích thước cửa sổ (giờ)
    
    Returns:
        List các bản ghi bất thường
    """
    
    if not history_data or len(history_data) < window_size:
        return []
    
    try:
        powers = [record.get('power_kw', 1.0) for record in history_data]
        
        data_array = np.array(powers)
        mean = np.mean(data_array)
        std = np.std(data_array)
        
        # Anomalies: > mean + 2*std
        threshold = mean + 2 * std
        
        anomalies = []
        for i, record in enumerate(history_data):
            power = record.get('power_kw', 1.0)
            if power > threshold:
                anomalies.append({
                    'index': i,
                    'timestamp': record.get('timestamp'),
                    'power_kw': power,
                    'threshold': round(threshold, 2),
                    'deviation_factor': round(power / mean if mean > 0 else 0, 2)
                })
        
        return anomalies[:10]  # Return top 10
    
    except Exception as e:
        print(f"Error in anomaly detection: {e}")
        return []

def get_optimization_recommendation(current_power, avg_power, max_power, temperature):
    """
    Đưa ra khuyến nghị tối ưu hóa dựa trên dữ liệu hiện tại
    
    Args:
        current_power: Công suất hiện tại (kW)
        avg_power: Công suất trung bình (kW)
        max_power: Công suất tối đa (kW)
        temperature: Nhiệt độ hiện tại (°C)
    
    Returns:
        List khuyến nghị
    """
    
    recommendations = []
    
    # Kiểm tra công suất
    if current_power > avg_power * 1.5:
        recommendations.append({
            'type': 'power_reduction',
            'severity': 'HIGH',
            'message': f"Công suất hiện tại ({current_power:.1f}kW) cao hơn 50% so với trung bình ({avg_power:.1f}kW)",
            'action': 'Giảm tải từ HVAC hoặc các thiết bị không cần thiết',
            'potential_saving': round((current_power - avg_power) * 0.8, 2)
        })
    
    # Kiểm tra nhiệt độ
    if temperature > 26:
        recommendations.append({
            'type': 'temperature_control',
            'severity': 'MEDIUM',
            'message': f"Nhiệt độ cao ({temperature:.1f}°C), HVAC đang tăng cửa sổ",
            'action': 'Đóng rèm, tắt thêm thiết bị sinh nhiệt',
            'potential_saving': 0.5
        })
    elif temperature < 18:
        recommendations.append({
            'type': 'heating_reduced',
            'severity': 'LOW',
            'message': f"Nhiệt độ tương đối mát ({temperature:.1f}°C)",
            'action': 'Có thể giảm sưởi nóng để tiết kiệm',
            'potential_saving': 0.3
        })
    
    # Kiểm tra tăng đột ngột
    if current_power > max_power * 0.9:
        recommendations.append({
            'type': 'peak_management',
            'severity': 'HIGH',
            'message': 'Công suất gần đạt mức cao nhất trong ngày',
            'action': 'Dịch chuyển tải hạng nặng sang giờ thấp điểm',
            'potential_saving': round(max_power * 0.2, 2)
        })
    
    return recommendations
