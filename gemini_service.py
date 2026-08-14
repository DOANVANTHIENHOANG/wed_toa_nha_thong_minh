# -*- coding: utf-8 -*-
"""
Gemini AI Service - Clean, Production-Ready Implementation
Build Date: 2026-04-22
Model: gemini-2.0-flash, Endpoint: v1beta
"""

import os
import json
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime
from functools import lru_cache
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
except ImportError:
    raise ImportError("requests library not found. Install: pip install requests")

# ===== LOGGING CONFIG =====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] GeminiService: %(message)s'
)
logger = logging.getLogger(__name__)


# ===== CONSTANTS =====
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_MODEL = "gemini-2.0-flash"
REQUEST_TIMEOUT = 30  # seconds
MAX_RETRIES = 3
GENERATION_CONFIG = {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048,
}
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]


# ===== API KEY VALIDATION =====
@lru_cache(maxsize=1)
def get_api_key() -> Optional[str]:
    """
    Lấy API key từ environment.
    Cached để tránh đọc .env nhiều lần.
    """
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    
    if not api_key or api_key.startswith('YOUR_') or api_key.startswith('your_'):
        return None
    
    return api_key


def validate_api_key() -> Tuple[bool, str]:
    """
    Kiểm tra API key có hợp lệ không.
    
    Returns:
        (is_valid: bool, error_message: str)
    """
    api_key = get_api_key()
    
    if not api_key:
        error_msg = (
            "❌ GEMINI_API_KEY chưa được cấu hình!\n\n"
            "📋 Cách fix:\n"
            "1. Tạo/mở file .env trong thư mục project\n"
            "2. Thêm dòng: GEMINI_API_KEY=your_api_key_here\n"
            "3. Khởi động lại ứng dụng\n\n"
            "🔗 Lấy API Key:\n"
            "https://aistudio.google.com/apikey"
        )
        logger.error("API Key không tìm thấy")
        return False, error_msg
    
    if len(api_key) < 20:
        error_msg = (
            "⚠️ GEMINI_API_KEY có vẻ không hợp lệ (quá ngắn)\n\n"
            "📋 Cách fix:\n"
            "1. Mở file .env\n"
            "2. Kiểm tra GEMINI_API_KEY có đủ độ dài không\n"
            "3. Lấy API Key mới nếu cần: https://aistudio.google.com/apikey"
        )
        logger.warning(f"API Key quá ngắn: {len(api_key)} characters")
        return False, error_msg
    
    return True, ""


# ===== REQUEST BUILDER =====
def build_request_payload(prompt: str) -> Dict:
    """
    Xây dựng payload cho Gemini API request.
    
    Args:
        prompt: User query + system context
        
    Returns:
        Dictionary payload
    """
    return {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": GENERATION_CONFIG,
        "safetySettings": SAFETY_SETTINGS,
    }


def build_headers() -> Dict[str, str]:
    """Xây dựng HTTP headers cho request."""
    return {
        "Content-Type": "application/json",
        "User-Agent": "SED-EnergyAI/1.0",
    }


# ===== SESSION WITH RETRY =====
def create_requests_session(max_retries: int = 3) -> requests.Session:
    """
    Tạo requests.Session với built-in retry logic (không blocking).
    Chỉ dùng cho transient errors (connection timeout, etc.).
    Rate limit (429) được handle riêng.
    """
    session = requests.Session()
    
    # Retry strategy cho connection errors, timeouts, 500+
    # Không retry 429 ở đây - xử lý bằng callback
    retry_strategy = Retry(
        total=max_retries,
        status_forcelist=[500, 502, 503, 504],  # Server errors
        allowed_methods=["POST"],
        backoff_factor=1,  # 1, 2, 4 seconds
    )
    
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    
    return session


# ===== RESPONSE PARSER =====
def parse_gemini_response(response_data: Dict) -> Tuple[bool, str]:
    """
    Parse Gemini API response và trích xuất text.
    
    Args:
        response_data: JSON response từ API
        
    Returns:
        (success: bool, content: str)
    """
    try:
        # Kiểm tra safety block
        if 'promptFeedback' in response_data:
            block_reason = response_data['promptFeedback'].get('blockReason', 'UNKNOWN')
            error_msg = f"🚫 Google đã chặn prompt. Lý do: {block_reason}"
            logger.warning(f"Safety block: {block_reason}")
            return False, error_msg
        
        # Kiểm tra candidates
        if 'candidates' not in response_data or len(response_data['candidates']) == 0:
            error_msg = "⚠️ Google trả lời nhưng không có dữ liệu"
            logger.warning("Response có candidates rỗng")
            return False, error_msg
        
        candidate = response_data['candidates'][0]
        
        # Kiểm tra finish reason
        finish_reason = candidate.get('finishReason', 'UNKNOWN')
        
        if finish_reason == 'SAFETY':
            error_msg = "⚠️ Google đã chặn phản hồi do vi phạm chính sách an toàn"
            logger.warning("Response bị chặn: SAFETY")
            return False, error_msg
        
        # Trích xuất text
        if 'content' not in candidate or 'parts' not in candidate['content']:
            error_msg = f"⚠️ Cấu trúc response không mong đợi: {finish_reason}"
            logger.warning(f"Unexpected response structure: {candidate}")
            return False, error_msg
        
        parts = candidate['content']['parts']
        if len(parts) == 0:
            error_msg = "⚠️ Response text trống"
            logger.warning("Response parts trống")
            return False, error_msg
        
        text = parts[0].get('text', '').strip()
        
        if not text:
            error_msg = "⚠️ Gemini trả lời nhưng text rỗng"
            logger.warning("Response text rỗng")
            return False, error_msg
        
        # Clean formatting
        text = text.replace('*', '').replace('**', '').strip()
        
        logger.info(f"✓ Parse thành công ({len(text)} chars, finish: {finish_reason})")
        return True, text
        
    except (KeyError, IndexError, TypeError) as e:
        error_msg = f"❌ Lỗi parse response: {str(e)}"
        logger.error(f"Parse error: {e}")
        return False, error_msg


# ===== ERROR HANDLER =====
def handle_http_error(status_code: int, response_text: str) -> Tuple[bool, str]:
    """
    Xử lý HTTP error codes từ Gemini API.
    
    Args:
        status_code: HTTP status code
        response_text: Response body
        
    Returns:
        (is_retryable: bool, error_message: str)
    """
    error_handlers = {
        400: (False, (
            "❌ Request không hợp lệ (400)!\n\n"
            "🔧 Nguyên nhân:\n"
            "- Prompt content bị Google từ chối\n"
            "- API Key sai format\n\n"
            "Fix: Thử lại sau hoặc kiểm tra prompt"
        )),
        401: (False, (
            "❌ API Key không hợp lệ hoặc đã hết hạn (401)!\n\n"
            "🔧 Fix ngay:\n"
            "1. Lấy API Key mới: https://aistudio.google.com/apikey\n"
            "2. Cập nhật .env: GEMINI_API_KEY=<key_mới>\n"
            "3. Khởi động lại ứng dụng"
        )),
        403: (False, (
            "❌ Truy cập bị từ chối (403)!\n\n"
            "✓ Kiểm tra:\n"
            "- API Key có giá trị không?\n"
            "- Generative Language API có bật không?\n"
            "- Quota có còn không?"
        )),
        409: (False, (
            "⚠️ Xung đột request (409)!\n\n"
            "Fix: Thử lại sau vài giây"
        )),
        429: (True, (
            "⏳ Quá nhiều request (429)!\n\n"
            "Google API rate limit được kích hoạt.\n"
            "💡 Vui lòng thử lại sau 1-2 phút"
        )),
        500: (True, (
            "🔥 Lỗi server Google (500)\n\n"
            "Fix: Thử lại sau"
        )),
        502: (True, (
            "🌐 Bad Gateway (502)\n\n"
            "Fix: Thử lại sau"
        )),
        503: (True, (
            "⚠️ Service Unavailable (503)\n\n"
            "Google API tạm thời không hoạt động. Thử lại sau."
        )),
    }
    
    is_retryable, default_msg = error_handlers.get(
        status_code,
        (True, f"❌ HTTP Error {status_code}\n\nThử lại sau")
    )
    
    logger.warning(f"HTTP {status_code}: {response_text[:100]}")
    return is_retryable, default_msg


# ===== MAIN API CALL =====
def call_gemini_api(
    prompt: str,
    attempt: int = 1,
    max_attempts: int = MAX_RETRIES
) -> Tuple[bool, str]:
    """
    Gọi Gemini API với prompt.
    
    Args:
        prompt: User query + system context (tiếng Việt)
        attempt: Attempt number (để logging)
        max_attempts: Max retry attempts
        
    Returns:
        (success: bool, response_text: str)
        
    Logic:
    - 401/403/400: Fail ngay (không retry)
    - 429: Return error ngay (client retry - không sleep ở đây)
    - 500/502/503: Có thể retry nhưng return ngay cho client
    - Connection errors: Retry 1-2 lần
    - 200: Parse response
    """
    # ===== VALIDATE =====
    is_valid, error_msg = validate_api_key()
    if not is_valid:
        return False, error_msg
    
    api_key = get_api_key()
    
    # ===== BUILD REQUEST =====
    url = f"{GEMINI_API_ENDPOINT}?key={api_key}"
    headers = build_headers()
    payload = build_request_payload(prompt)
    
    logger.info(f"Attempt {attempt}/{max_attempts}: Calling Gemini API...")
    
    try:
        # ===== SEND REQUEST =====
        session = create_requests_session(max_retries=2)
        
        logger.info("[GEMINI REQUEST] Sending request to Google API. model=%s prompt_len=%s", GEMINI_MODEL, len(prompt))
        response = session.post(
            url,
            json=payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
        logger.info("[GEMINI RESPONSE] status_code=%s response_len=%s", response.status_code, len(response.text))

        # ===== HANDLE STATUS CODE =====
        if response.status_code == 200:
            try:
                response_data = response.json()
                success, content = parse_gemini_response(response_data)

                if success:
                    logger.info("[GEMINI SUCCESS] response_len=%s", len(content))
                    return True, content
                else:
                    logger.warning("[GEMINI PARSE_FAILED] %s", content)
                    return False, content

            except json.JSONDecodeError as e:
                error_msg = f"❌ Lỗi parse JSON response: {str(e)}"
                logger.error("[GEMINI JSON_ERROR] %s raw_body=%s", error_msg, response.text[:1000])
                return False, error_msg

        else:
            is_retryable, error_msg = handle_http_error(
                response.status_code,
                response.text
            )
            logger.error("[GEMINI HTTP_ERROR] status_code=%s message=%s raw_body=%s", response.status_code, error_msg, response.text[:1000])
            
            # ===== RETRY LOGIC (chỉ cho non-fatal errors) =====
            if is_retryable and attempt < max_attempts:
                logger.warning(f"Retryable error (attempt {attempt}/{max_attempts}): {error_msg[:50]}")
                # Gọi lại không sleep ở đây - để client decide
                # Trả về error ngay để UI không treo
                return False, error_msg
            
            logger.error(f"API error {response.status_code}: {error_msg[:100]}")
            return False, error_msg
    
    except requests.exceptions.Timeout:
        error_msg = (
            "⏱️ Timeout! Google API không phản hồi trong 30 giây.\n\n"
            "Fix: Thử lại sau"
        )
        logger.error(f"Timeout on attempt {attempt}")
        
        if attempt < max_attempts:
            logger.info(f"Retrying ({attempt}/{max_attempts})...")
            # Không sleep - return error
        
        return False, error_msg
    
    except requests.exceptions.ConnectionError as e:
        error_msg = (
            "🌐 Lỗi kết nối mạng!\n\n"
            "Kiểm tra:\n"
            "- Internet connection\n"
            "- Google API status\n"
            "- Firewall/Proxy settings"
        )
        logger.error(f"Connection error: {str(e)}")
        return False, error_msg
    
    except requests.exceptions.RequestException as e:
        error_msg = f"❌ Lỗi HTTP Request: {str(e)}"
        logger.error(f"Request error: {str(e)}")
        return False, error_msg
    
    except Exception as e:
        error_msg = f"❌ Lỗi hệ thống không mong đợi: {str(e)}"
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return False, error_msg


# ===== PROMPT BUILDER =====
def build_energy_consultation_prompt(
    user_query: str,
    data_snapshot: Dict
) -> str:
    """
    Xây dựng prompt cho tư vấn năng lượng.
    
    Args:
        user_query: Câu hỏi từ user
        data_snapshot: {
            'current_power_kw': float,
            'current_temp': float,
            'day_consumption_kwh': float,
            'threshold': float,
            'device_details': str,
            'timestamp': str (optional)
        }
        
    Returns:
        Formatted prompt
    """
    timestamp = data_snapshot.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M'))
    
    prompt = f"""Bạn là SED AI - Trợ lý tư vấn năng lượng thông minh.

=== THÔNG TIN HỆ THỐNG ===
Thời gian: {timestamp}
Công suất hiện tại: {data_snapshot.get('current_power_kw', 0)} kW
Ngưỡng an toàn: {data_snapshot.get('threshold', 15)} kW
Điện năng hôm nay: {data_snapshot.get('day_consumption_kwh', 0)} kWh
Nhiệt độ: {data_snapshot.get('current_temp', 26)}°C

=== CHI TIẾT THIẾT BỊ ===
{data_snapshot.get('device_details', 'Không có dữ liệu')}

=== HƯỚNG DẪN TRẢ LỜI ===
1. Nếu hỏi chào hỏi (Chào, Hello, Bạn là ai): Trả lời 1-2 câu, xác nhận tên và hỏi cần giúp gì.
2. Nếu liên quan năng lượng: Phân tích data trên, đưa lời khuyên cụ thể tiết kiệm điện.
3. Luôn trả lời bằng tiếng Việt, trang trọng nhưng thân thiện.
4. Cảnh báo nếu công suất vượt ngưỡng.

=== CÂU HỎI CỦA NGƯỜI DÙNG ===
{user_query}"""
    
    return prompt


if __name__ == "__main__":
    # Test script
    test_prompt = "Xin chào"
    success, response = call_gemini_api(test_prompt)
    print(f"Success: {success}")
    print(f"Response: {response}")
