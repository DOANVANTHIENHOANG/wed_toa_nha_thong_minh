// Error Checking Script - Run this to verify all systems work
// Open browser console and check for any red errors

console.log('🔍 [SYSTEM CHECK] Starting comprehensive error diagnostics...\n');

// 1. Check all required DOM elements exist
console.log('📋 [CHECK 1] Verifying DOM elements...');
const requiredElements = {
    'overview': 'Overview Tab Content',
    'devices': 'Devices Tab Content',
    'automation': 'Automation Tab Content',
    'analytics': 'Analytics Tab Content',
    'ai': 'AI/Gemini Tab Content',
    'settings': 'Settings Tab Content',
    'devices-tbody': 'Devices Table Body',
    'ai-response': 'AI Response Container',
    'automation-container': 'Automation Container',
    'energyChart': 'Energy Chart Canvas',
    'username': 'Username Display'
};

Object.entries(requiredElements).forEach(([id, name]) => {
    const elem = document.getElementById(id);
    if (elem) {
        console.log(`✅ ${name} (id="${id}") - FOUND`);
    } else {
        console.error(`❌ ${name} (id="${id}") - MISSING`);
    }
});

// 2. Check all global functions exist
console.log('\n📋 [CHECK 2] Verifying global functions...');
const requiredFunctions = [
    'switchTab',
    'loadUserInfo',
    'loadStats',
    'updateStats',
    'askAI',
    'saveSettings',
    'logout',
    'initChart',
    'loadDevices'
];

requiredFunctions.forEach(func => {
    if (typeof window[func] === 'function') {
        console.log(`✅ ${func}() - FOUND`);
    } else {
        console.error(`❌ ${func}() - MISSING`);
    }
});

// 3. Check global objects exist
console.log('\n📋 [CHECK 3] Verifying global objects...');
const requiredObjects = [
    { name: 'deviceDatabase', path: 'deviceDatabase' },
    { name: 'deviceUI', path: 'deviceUI' },
    { name: 'window.currentAlertDevice', path: 'currentAlertDevice' }
];

requiredObjects.forEach(obj => {
    if (eval(`typeof ${obj.path}`) !== 'undefined') {
        console.log(`✅ ${obj.name} - FOUND`);
    } else {
        console.error(`❌ ${obj.name} - MISSING`);
    }
});

// 4. Check event listeners are attached
console.log('\n📋 [CHECK 4] Verifying event listeners...');
const navItems = document.querySelectorAll('[data-tab]');
console.log(`Found ${navItems.length} tab items:`);
navItems.forEach((item, idx) => {
    const tabId = item.getAttribute('data-tab');
    console.log(`  [${idx}] Tab: ${tabId}`);
});

const geminiTab = document.querySelector('[data-tab="ai"]');
if (geminiTab) {
    console.log('✅ Gemini tab element found - Event listener should be attached');
} else {
    console.error('❌ Gemini tab element NOT FOUND');
}

// 5. Check for JavaScript errors in external scripts
console.log('\n📋 [CHECK 5] Script loading status...');
const scripts = ['DeviceControl.js', 'GeminiAnalysis.js', 'Automation-Enhanced.js'];
console.log('Scripts should be loaded in order:');
console.log('1. DeviceControl.js');
console.log('2. GeminiAnalysis.js');
console.log('3. Automation-Enhanced.js');

// 6. Test tab switching
console.log('\n📋 [CHECK 6] Testing tab switching...');
function testTabSwitch() {
    try {
        const devicesTab = document.querySelector('[data-tab="devices"]');
        if (devicesTab) {
            switchTab(devicesTab);
            const tabContent = document.getElementById('devices');
            if (tabContent && tabContent.classList.contains('active')) {
                console.log('✅ Tab switching works - Devices tab activated successfully');
            } else {
                console.error('❌ Tab switching failed - Content not displayed');
            }
        }
    } catch (e) {
        console.error('❌ Tab switching error:', e.message);
    }
}

// 7. Summary
console.log('\n' + '='.repeat(60));
console.log('📊 [SUMMARY] System diagnostics complete');
console.log('='.repeat(60));
console.log('\nIf all items show ✅, the system is working correctly.');
console.log('If any items show ❌, there is an issue to fix.');
console.log('\nTo test tab switching, run: testTabSwitch()');
console.log('='.repeat(60));
