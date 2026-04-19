// backend/control-service.js - HVAC & Lighting Control Logic

class ControlService {
  constructor() {
    this.devices = {};           // Controlled devices
    this.controlRules = {};      // Automation rules
    this.commandLog = [];        // Command history
    this.scheduledTasks = [];    // Scheduled commands
  }

  // ===== HVAC CONTROL =====

  /**
   * Set HVAC target temperature and mode
   * @param {string} deviceId - HVAC device ID
   * @param {number} temperature - Target temperature (°C)
   * @param {string} mode - 'cool', 'heat', 'auto', 'off'
   * @param {boolean} scheduleImmediately - Execute now or schedule
   */
  setHVACSetpoint(deviceId, temperature, mode = 'cool', scheduleImmediately = true) {
    // Validate inputs
    if (temperature < 16 || temperature > 30) {
      return { success: false, error: 'Temperature must be between 16-30°C' };
    }

    if (!['cool', 'heat', 'auto', 'off'].includes(mode)) {
      return { success: false, error: "Mode must be 'cool', 'heat', 'auto', or 'off'" };
    }

    const command = {
      id: `cmd-${deviceId}-${Date.now()}`,
      device_id: deviceId,
      device_type: 'hvac',
      action: 'set_temperature',
      target_temp: temperature,
      mode: mode,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Send command (mock implementation - replace with real device API)
    if (scheduleImmediately) {
      const result = this.executeCommand(command);
      return {
        success: result.success,
        command: command,
        message: `HVAC set to ${temperature}°C in ${mode} mode`,
        details: result
      };
    }

    // Store for later execution
    this.commandLog.push(command);
    return {
      success: true,
      command: command,
      message: `HVAC command queued: ${temperature}°C in ${mode} mode`
    };
  }

  /**
   * Get HVAC current settings
   */
  getHVACStatus(deviceId) {
    return this.devices[deviceId] || {
      device_id: deviceId,
      current_temp: null,
      target_temp: null,
      mode: null,
      status: 'offline'
    };
  }

  // ===== LIGHTING CONTROL =====

  /**
   * Set lighting brightness and color temperature
   * @param {string} deviceId - Lighting device ID
   * @param {number} brightness - 0-100 (%)
   * @param {string} colorTemp - 'warm' (2700K), 'neutral' (4000K), 'daylight' (6500K)
   */
  setLightingLevel(deviceId, brightness = 80, colorTemp = 'daylight') {
    // Validate inputs
    if (brightness < 0 || brightness > 100) {
      return { success: false, error: 'Brightness must be between 0-100%' };
    }

    if (!['warm', 'neutral', 'daylight'].includes(colorTemp)) {
      return { success: false, error: "Color temp must be 'warm', 'neutral', or 'daylight'" };
    }

    const colorTempValues = {
      'warm': 2700,
      'neutral': 4000,
      'daylight': 6500
    };

    const command = {
      id: `cmd-${deviceId}-${Date.now()}`,
      device_id: deviceId,
      device_type: 'lighting',
      action: 'set_brightness',
      brightness: brightness,
      color_temp: colorTemp,
      color_temp_k: colorTempValues[colorTemp],
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const result = this.executeCommand(command);
    return {
      success: result.success,
      command: command,
      message: `Light set to ${brightness}% brightness`,
      details: result
    };
  }

  /**
   * Get lighting current settings
   */
  getLightingStatus(deviceId) {
    return this.devices[deviceId] || {
      device_id: deviceId,
      brightness: null,
      color_temp: null,
      status: 'offline'
    };
  }

  // ===== SCHEDULING & AUTOMATION =====

  /**
   * Create automation rule (device control based on schedule/conditions)
   * @param {object} rule - Rule definition
   */
  createScheduleRule(rule) {
    // Validate rule
    if (!rule.id || !rule.device_id) {
      return { success: false, error: 'Rule must have id and device_id' };
    }

    if (!rule.triggers || rule.triggers.length === 0) {
      return { success: false, error: 'Rule must have at least one trigger' };
    }

    const completeRule = {
      ...rule,
      created_at: new Date().toISOString(),
      status: 'active',
      executions: []
    };

    this.controlRules[rule.id] = completeRule;
    this.scheduleRuleExecution(rule.id);

    console.log(`📋 Rule created: ${rule.id}`);
    return {
      success: true,
      rule: completeRule,
      message: `Schedule rule '${rule.id}' created and activated`
    };
  }

  /**
   * Delete scheduled rule
   */
  deleteScheduleRule(ruleId) {
    if (delete this.controlRules[ruleId]) {
      console.log(`🗑️  Rule deleted: ${ruleId}`);
      return { success: true, message: `Rule '${ruleId}' deleted` };
    }
    return { success: false, error: 'Rule not found' };
  }

  /**
   * Get all active rules
   */
  getAllRules() {
    return Object.values(this.controlRules);
  }

  /**
   * Get specific rule
   */
  getRule(ruleId) {
    return this.controlRules[ruleId] || null;
  }

  /**
   * Internal: Setup rule execution
   */
  scheduleRuleExecution(ruleId) {
    const rule = this.controlRules[ruleId];
    if (!rule) return;

    // Simple cron-like scheduler
    rule.triggers.forEach((trigger) => {
      if (trigger.type === 'time') {
        // Parse time string like "07:00" or "22:00"
        const [hours, minutes] = trigger.time.split(':').map(Number);

        // Check daily
        const checkSchedule = setInterval(() => {
          const now = new Date();
          if (now.getHours() === hours && now.getMinutes() === minutes) {
            if (!trigger.days || trigger.days.includes(now.getDay())) {
              this.executeRule(ruleId, rule);
            }
          }
        }, 60000); // Check every minute

        rule.intervalId = checkSchedule;
      }
    });
  }

  /**
   * Internal: Execute rule actions
   */
  executeRule(ruleId, rule) {
    if (!rule.actions || rule.actions.length === 0) return;

    rule.actions.forEach((action) => {
      if (action.type === 'hvac') {
        this.setHVACSetpoint(
          action.device_id,
          action.target_temp,
          action.mode,
          true
        );
      } else if (action.type === 'lighting') {
        this.setLightingLevel(
          action.device_id,
          action.brightness,
          action.color_temp
        );
      } else if (action.type === 'device_toggle') {
        this.toggleDevice(action.device_id, action.state);
      }
    });

    // Log execution
    rule.executions = rule.executions || [];
    rule.executions.push({
      executedAt: new Date().toISOString(),
      status: 'success'
    });

    console.log(`⚙️  Rule '${ruleId}' executed`);
  }

  // ===== DEMAND RESPONSE / LOAD SHEDDING =====

  /**
   * Activate demand response (reduce loads during peak hours)
   * @param {number} maxPowerLimit - Maximum allowed power (kW)
   * @param {array} priorityRank - Device priority (higher = shed first)
   */
  activateDemandResponse(maxPowerLimit = 15.0, priorityRank = []) {
    console.log(`🚨 Demand Response ACTIVATED: Max ${maxPowerLimit}kW`);

    const actions = [];

    // Action 1: HVAC energy-save mode
    actions.push({
      action: 'hvac_energy_save',
      device_id: 'hvac-main',
      setpoint: 26,  // Relax by 2°C to reduce load
      mode: 'auto',
      expectedSavings: '30%'
    });
    this.setHVACSetpoint('hvac-main', 26, 'auto');

    // Action 2: Reduce outdoor lighting
    actions.push({
      action: 'lighting_reduce',
      device_id: 'lighting-outdoor',
      brightness: 60,  // Reduce to 60%
      expectedSavings: '40%'
    });
    this.setLightingLevel('lighting-outdoor', 60, 'daylight');

    // Action 3: Reduce indoor lighting
    actions.push({
      action: 'lighting_reduce',
      device_id: 'lighting-indoor',
      brightness: 75,  // Reduce to 75%
      expectedSavings: '25%'
    });
    this.setLightingLevel('lighting-indoor', 75, 'neutral');

    return {
      success: true,
      status: 'demand-response-active',
      maxPowerLimit: maxPowerLimit,
      actions: actions,
      totalExpectedReduction: '~95%'
    };
  }

  /**
   * Deactivate demand response
   */
  deactivateDemandResponse() {
    console.log(`✅ Demand Response DEACTIVATED`);

    // Restore normal settings
    this.setHVACSetpoint('hvac-main', 24, 'cool');
    this.setLightingLevel('lighting-outdoor', 100, 'daylight');
    this.setLightingLevel('lighting-indoor', 100, 'neutral');

    return {
      success: true,
      status: 'demand-response-inactive',
      message: 'All devices restored to normal operation'
    };
  }

  // ===== OCCUPANCY-AWARE CONTROL =====

  /**
   * Auto-control devices based on occupancy
   * @param {string} zoneId - Zone identifier
   * @param {number} occupancy - Number of people
   */
  occupancyBasedControl(zoneId, occupancy) {
    const actions = [];

    if (occupancy === 0) {
      // Nobody home: Save energy
      actions.push(
        this.setLightingLevel(`lighting-${zoneId}`, 0, 'daylight')  // Lights off
      );
      actions.push(
        this.setHVACSetpoint(`hvac-${zoneId}`, 28, 'auto')  // Raise temp to 28°C
      );
    } else if (occupancy > 0 && occupancy <= 10) {
      // Low occupancy: Medium comfort
      actions.push(
        this.setLightingLevel(`lighting-${zoneId}`, 75, 'neutral')
      );
      actions.push(
        this.setHVACSetpoint(`hvac-${zoneId}`, 24, 'cool')
      );
    } else {
      // High occupancy: Full comfort
      actions.push(
        this.setLightingLevel(`lighting-${zoneId}`, 100, 'daylight')
      );
      actions.push(
        this.setHVACSetpoint(`hvac-${zoneId}`, 22, 'cool')  // Cool more
      );
    }

    return {
      success: true,
      zone: zoneId,
      occupancy: occupancy,
      actions: actions,
      message: `Zone ${zoneId} adjusted for ${occupancy} people`
    };
  }

  // ===== GENERAL DEVICE CONTROL =====

  /**
   * Toggle device on/off
   */
  toggleDevice(deviceId, state = null) {
    const device = this.devices[deviceId] || { id: deviceId, state: false };

    const newState = state !== null ? state : !device.state;

    const command = {
      id: `cmd-${deviceId}-${Date.now()}`,
      device_id: deviceId,
      action: 'toggle',
      newState: newState,
      timestamp: new Date().toISOString()
    };

    this.devices[deviceId] = { ...device, state: newState };
    this.commandLog.push(command);

    console.log(`🔄 Device ${deviceId}: ${newState ? 'ON' : 'OFF'}`);
    return {
      success: true,
      device_id: deviceId,
      state: newState,
      message: `Device switched ${newState ? 'ON' : 'OFF'}`
    };
  }

  // ===== INTERNAL COMMAND EXECUTION =====

  /**
   * Execute control command (mock - replace with real device API)
   */
  executeCommand(command) {
    // In production: Send to device via MQTT, HTTP, or other protocol
    console.log(`📤 Executing command: ${command.action} on ${command.device_id}`);

    // Store execution log
    command.status = 'executed';
    this.commandLog.push(command);

    return {
      success: true,
      commandId: command.id,
      timestamp: new Date().toISOString()
    };
  }

  // ===== UTILITIES =====

  /**
   * Get command history
   */
  getCommandHistory(limit = 50) {
    return this.commandLog.slice(-limit);
  }

  /**
   * Export state
   */
  exportState() {
    return {
      devices: this.devices,
      rules: this.controlRules,
      commandLog: this.commandLog.slice(-100),
      exportedAt: new Date()
    };
  }
}

// Export singleton instance
export default new ControlService();
