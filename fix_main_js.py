#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix main.js - Replace corrupted notification section with clean code
"""

import re

with open('static/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple string replacement for the catch error block
content = content.replace(
    '    } catch (err) {\n        console.error("Lỗi UI:", err);\n    }\n};',
    '''    } catch (err) {
        console.error("❌ Lỗi trong optimizeEnergy:", err);
        const errorMsg = err.message || 'Lỗi không xác định';
        if (typeof window.showNotification === 'function') {
            window.showNotification(`❌ Lỗi: ${errorMsg}`, 'error');
        } else {
            alert(`❌ Lỗi tối ưu hóa: ${errorMsg}`);
        }
    }
};'''
)

with open('static/main.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed main.js catch block")
