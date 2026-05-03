# 📝 CODE SNIPPETS - Fix 405 Method Not Allowed

## 1️⃣ BACKEND - app.py (Route /register)

### ❌ BEFORE (Sai - chỉ GET)
```python
@app.route('/register')
def register_page():
    return render_template('register.html')
```

### ✅ AFTER (Đúng - GET + POST)
```python
@app.route('/register', methods=['GET', 'POST'])
def register_page():
    """
    GET: Hiển thị form đăng ký
    POST: Xử lý dữ liệu từ form đăng ký
    """
    if request.method == 'GET':
        # Trả về giao diện form đăng ký
        return render_template('register.html')
    
    elif request.method == 'POST':
        # Xử lý form submission
        try:
            data = request.get_json() or request.form
            
            if not data:
                return jsonify({"error": "Không có dữ liệu được gửi"}), 400
            
            fullname = data.get('fullname', '').strip()
            contact = data.get('contact', '').strip()
            room_code = data.get('room_code', '').strip()
            meter_code = data.get('meter_code', '').strip()
            address = data.get('address', '').strip()
            password = data.get('password', '')
            
            # === VALIDATION LỚP 1: Kiểm tra dữ liệu đầu vào ===
            if not all([fullname, contact, room_code, meter_code, address, password]):
                return jsonify({"error": "Vui lòng điền đầy đủ thông tin!"}), 400
            
            # === VALIDATION LỚP 2: Query DB với 3 điều kiện AND ===
            device = db_helper.verify_device_credentials(room_code, meter_code, address)
            
            if not device:
                return jsonify({
                    "error": "Thông tin Mã phòng, Công tơ hoặc Địa chỉ không khớp với dữ liệu tòa nhà. Vui lòng kiểm tra lại!"
                }), 400
            
            # === VALIDATION LỚP 3: Kiểm tra username ===
            username = fullname.lower().replace(' ', '_')
            
            if username in users_db:
                return jsonify({"error": "Tên người dùng đã tồn tại!"}), 400
            
            # === PASSWORD VALIDATION ===
            if len(password) < 6:
                return jsonify({"error": "Mật khẩu phải ít nhất 6 ký tự!"}), 400
            
            import re
            if not re.search(r'[A-Z]', password):
                return jsonify({"error": "Mật khẩu phải chứa ít nhất 1 chữ hoa!"}), 400
            if not re.search(r'[0-9]', password):
                return jsonify({"error": "Mật khẩu phải chứa ít nhất 1 chữ số!"}), 400
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return jsonify({"error": "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt!"}), 400
            
            # === TẠO TÀI KHOẢN ===
            email = contact if '@' in contact else ''
            phone = contact if '@' not in contact else ''
            
            users_db[username] = {
                'fullname': fullname,
                'email': email,
                'phone': phone,
                'password': generate_password_hash(password),
                'building_id': device['room_name'],
                'meter_id': meter_code,
                'room_code': room_code,
                'address': address,
                'device_id': device['id'],
                'role': 'user',
                'created_at': datetime.now().isoformat()
            }
            
            return jsonify({
                "success": True,
                "message": f"Đăng ký thành công! Chào mừng {fullname}",
                "redirect": "/login",
                "data": {
                    "username": username,
                    "fullname": fullname,
                    "device": device['room_name']
                }
            }), 201
            
        except Exception as e:
            logger.error(f"Register error: {str(e)}")
            return jsonify({"error": f"Lỗi server: {str(e)}"}), 500
```

---

## 2️⃣ FRONTEND - register.html

### A. Form Tag

#### ❌ BEFORE (Thiếu novalidate)
```html
<form id="register-form" onsubmit="doRegister(event)" autocomplete="off">
```

#### ✅ AFTER (Thêm novalidate)
```html
<form id="register-form" onsubmit="doRegister(event)" autocomplete="off" novalidate>
```

---

### B. Address Dropdown

#### ❌ BEFORE (Bị ẩn - display: none)
```html
<div class="form-group" id="address-dropdown-wrapper" style="display: none;">
    <div class="input-wrapper">
        <select id="reg_address_select" ...>
            <option value="">-- Chọn Địa chỉ --</option>
            <option value="Quận Thanh Khê">Quận Thanh Khê</option>
            ...
        </select>
    </div>
</div>
```

#### ✅ AFTER (Hiển thị - không có display: none)
```html
<div class="form-group">
    <div class="input-wrapper">
        <select id="reg_address_select" class="form-control" required>
            <option value="">-- Chọn Địa chỉ --</option>
            <option value="Quận Thanh Khê">Quận Thanh Khê</option>
            <option value="Quận Hải Châu">Quận Hải Châu</option>
            <option value="Quận Liên Chiểu">Quận Liên Chiểu</option>
            <option value="Quận Ngũ Hành Sơn">Quận Ngũ Hành Sơn</option>
            <option value="Quận Sơn Trà">Quận Sơn Trà</option>
        </select>
        <i class="fas fa-map-marker-alt"></i>
    </div>
</div>
```

---

### C. JavaScript doRegister Function

#### ✅ IMPORTANT PARTS (Giữ nguyên)
```javascript
function doRegister(event) {
    // ✅ BẮTBUỘC: Chặn submit mặc định
    event.preventDefault();

    // Lấy dữ liệu từ form
    const fullname = document.getElementById('reg_fullname').value.trim();
    const contact = document.getElementById('reg_contact').value.trim();
    const meter_id = document.getElementById('reg_meter').value.trim();
    const room_code = document.getElementById('reg_room').value.trim();
    const address = document.getElementById('reg_address_select').value.trim(); // ✅ Từ dropdown
    const password = document.getElementById('reg_password').value;
    const confirmPassword = document.getElementById('reg_confirm_password').value;
    const errDiv = document.getElementById('reg-err');
    const btn = document.querySelector('.btn-register');

    // Reset error
    errDiv.classList.remove('show');
    errDiv.innerHTML = '';

    // ===== VALIDATION (Frontend) =====
    if (!fullname || !contact || !meter_id || !room_code || !address || !password) {
        showError('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (!isNameCapitalized(fullname)) {
        showError('Họ và tên phải viết hoa chữ cái đầu của mỗi từ');
        return;
    }

    if (password !== confirmPassword) {
        showError('Mật khẩu xác nhận không khớp!');
        return;
    }

    if (password.length < 6) {
        showError('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    const passwordIssues = getPasswordIssues(password);
    if (passwordIssues.length > 0) {
        showError('Mật khẩu không đủ mạnh:<br>' + passwordIssues.join('<br>'));
        return;
    }

    // Show loading
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;

    // ===== FETCH API =====
    // ✅ IMPORTANT: Gọi /register (không /api/auth/register)
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullname: fullname,
            contact: contact,
            meter_code: meter_id,
            room_code: room_code,
            address: address,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showError('✓ Đăng ký thành công! Đang chuyển hướng...', 'success');
            // ✅ IMPORTANT: Redirect sau 1.5s
            setTimeout(() => {
                window.location.href = data.redirect || '/login';
            }, 1500);
        } else {
            showError(data.error || data.message || 'Đăng ký thất bại!');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    })
    .catch(err => {
        console.error('Register error:', err);
        showError('✗ Lỗi kết nối server!');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

function showError(message, type = 'error') {
    const errDiv = document.getElementById('reg-err');
    errDiv.innerHTML = message;
    errDiv.classList.add('show');

    if (type === 'success') {
        errDiv.style.color = '#10b981';
        errDiv.style.background = 'rgba(16, 185, 129, 0.15)';
        errDiv.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else {
        errDiv.style.color = '#ef4444';
        errDiv.style.background = 'rgba(239, 68, 68, 0.15)';
        errDiv.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    }
}

// ✅ Helper functions
function isNameCapitalized(name) {
    const words = name.trim().split(/\s+/);
    return words.every(word => /^[A-Z]/.test(word));
}

function isPasswordStrong(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasNumber && hasSpecialChar;
}

function getPasswordIssues(password) {
    const issues = [];
    if (!/[A-Z]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 chữ hoa (A-Z)");
    }
    if (!/[0-9]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 chữ số (0-9)");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        issues.push("• Phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)");
    }
    return issues;
}
```

---

## 3️⃣ KEY CHANGES SUMMARY

| Component | Change | Why |
|-----------|--------|-----|
| `@app.route('/register', methods=['GET', 'POST'])` | ✅ Add POST | Accept POST requests |
| Route handler: `if request.method == 'GET'` | ✅ Return HTML | Render form page |
| Route handler: `elif request.method == 'POST'` | ✅ Process JSON | Handle form submission |
| Form tag: `novalidate` | ✅ Add attribute | Use custom validation |
| Dropdown wrapper: Remove `display: none` | ✅ Show select | Allow user selection |
| Fetch URL: `/register` | ✅ Change from `/api/auth/register` | Match route |
| `event.preventDefault()` | ✅ Keep (already exists) | Prevent page reload |
| `window.location.href = '/login'` | ✅ Keep (already exists) | Redirect after success |

---

**Generated**: 2026-04-23
