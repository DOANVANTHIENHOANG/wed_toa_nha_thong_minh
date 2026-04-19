// backend/alert-service.js - Advanced Alert & Notification Management

class AlertService {
  constructor() {
    this.alerts = [];            // Alert queue (in-memory)
    this.alertHistory = [];      // Historical alerts
    this.alertRules = {};        // Rules that trigger alerts
    this.subscribers = [];       // WebSocket subscribers for notifications
    this.acknowledgedAlerts = {};// Tracking acknowledged alerts
  }

  // ===== ALERT CREATION & TRIGGERING =====

  /**
   * Trigger/Create alert
   * @param {object} alertData - Alert information
   */
  triggerAlert(alertData) {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity: alertData.severity || 'warning',      // 'critical', 'warning', 'info'
      type: alertData.type || 'generic',              // 'overload', 'sensor-fail', 'maintenance', etc
      title: alertData.title || 'System Alert',
      message: alertData.message || '',
      device_id: alertData.device_id || null,
      location: alertData.location || null,
      acknowledged: false,
      acknowledged_by: null,
      acknowledged_at: null,
      resolved: false,
      resolved_at: null,
      metadata: alertData.metadata || {}
    };

    // Add to current alerts
    this.alerts.push(alert);

    // Add to history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > 1000) {
      this.alertHistory.shift();  // Keep last 1000
    }

    // Auto-resolve info alerts after 5 minutes
    if (alert.severity === 'info') {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 5 * 60 * 1000);
    }

    // Broadcast to subscribers
    this.broadcastAlert(alert);

    // Send notifications
    this.sendNotifications(alert);

    // Log
    this.logAlert(alert);

    console.log(`🚨 Alert [${alert.severity.toUpperCase()}]: ${alert.title}`);
    return alert;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(severityFilter = null) {
    let result = this.alerts.filter(a => !a.acknowledged && !a.resolved);

    if (severityFilter) {
      result = result.filter(a => a.severity === severityFilter);
    }

    return result;
  }

  /**
   * Get all alerts (active + history)
   */
  getAllAlerts(options = {}) {
    let result = [...this.alerts, ...this.alertHistory];

    if (options.severity) {
      result = result.filter(a => a.severity === options.severity);
    }

    if (options.acknowledged !== undefined) {
      result = result.filter(a => a.acknowledged === options.acknowledged);
    }

    if (options.type) {
      result = result.filter(a => a.type === options.type);
    }

    if (options.limit) {
      result = result.slice(-options.limit);
    }

    return result;
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId) {
    return this.alerts.find(a => a.id === alertId) ||
           this.alertHistory.find(a => a.id === alertId) ||
           null;
  }

  // ===== ALERT ACKNOWLEDGEMENT =====

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.getAlert(alertId);

    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    alert.acknowledged = true;
    alert.acknowledged_by = userId;
    alert.acknowledged_at = new Date().toISOString();

    this.acknowledgedAlerts[alertId] = {
      userId: userId,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Alert acknowledged: ${alertId} by ${userId}`);
    return {
      success: true,
      alert: alert,
      message: 'Alert acknowledged'
    };
  }

  /**
   * Resolve alert (mark as fixed)
   */
  resolveAlert(alertId) {
    const alert = this.getAlert(alertId);

    if (!alert) {
      return { success: false, error: 'Alert not found' };
    }

    alert.resolved = true;
    alert.resolved_at = new Date().toISOString();

    // Remove from active alerts
    const index = this.alerts.indexOf(alert);
    if (index > -1) {
      this.alerts.splice(index, 1);
    }

    console.log(`✔️  Alert resolved: ${alertId}`);
    return {
      success: true,
      alert: alert,
      message: 'Alert resolved'
    };
  }

  /**
   * Clear all info alerts
   */
  clearInfoAlerts() {
    const infoAlerts = this.alerts.filter(a => a.severity === 'info');
    infoAlerts.forEach(alert => this.resolveAlert(alert.id));
    return { cleared: infoAlerts.length };
  }

  // ===== ALERT RULES =====

  /**
   * Create alert rule (trigger when condition met)
   */
  createAlertRule(rule) {
    if (!rule.id || !rule.title) {
      return { success: false, error: 'Rule must have id and title' };
    }

    const completeRule = {
      ...rule,
      created_at: new Date().toISOString(),
      active: true,
      triggerCount: 0
    };

    this.alertRules[rule.id] = completeRule;

    console.log(`📋 Alert rule created: ${rule.id}`);
    return { success: true, rule: completeRule };
  }

  /**
   * Delete alert rule
   */
  deleteAlertRule(ruleId) {
    if (delete this.alertRules[ruleId]) {
      console.log(`🗑️  Alert rule deleted: ${ruleId}`);
      return { success: true };
    }
    return { success: false, error: 'Rule not found' };
  }

  /**
   * Get all alert rules
   */
  getAlertRules() {
    return Object.values(this.alertRules);
  }

  /**
   * Evaluate conditions and trigger alerts
   */
  evaluateAlertRules(systemState) {
    Object.values(this.alertRules).forEach(rule => {
      if (!rule.active) return;

      try {
        // Simple condition evaluation
        // In production: use safer expression parser (e.g., expr)
        const conditionMet = this.evaluateCondition(rule.condition, systemState);

        if (conditionMet) {
          // Prevent duplicate alerts (don't trigger same alert within 5 minutes)
          const recentSame = this.alerts.filter(
            a => a.type === rule.type && !a.acknowledged
          );

          if (recentSame.length === 0 ||
              Date.now() - new Date(recentSame[recentSame.length - 1].timestamp) > 5 * 60 * 1000
          ) {
            this.triggerAlert({
              type: rule.type,
              severity: rule.severity,
              title: rule.title,
              message: rule.message,
              device_id: rule.device_id,
              metadata: { ruleId: rule.id }
            });

            rule.triggerCount++;
            rule.lastTriggered = new Date().toISOString();
          }
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    });
  }

  /**
   * Internal: Evaluate condition expression
   */
  evaluateCondition(condition, state) {
    // Example conditions:
    // "power > 15" -> overload
    // "temperature > 28" -> too hot
    // "humidity > 80" -> too humid
    // "device === 'offline'" -> device offline

    try {
      // UNSAFE in production - use expression parser library
      // Just for demo purposes
      return eval(`(function() { return ${condition}; }).call(state)`);
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  // ===== NOTIFICATIONS =====

  /**
   * Send notifications based on alert severity
   */
  sendNotifications(alert) {
    if (alert.severity === 'critical') {
      // Critical: Email + SMS + Push
      this.sendEmailNotification(alert);
      this.sendSMSNotification(alert);
      this.sendPushNotification(alert);
    } else if (alert.severity === 'warning') {
      // Warning: Email + Push
      this.sendEmailNotification(alert);
      this.sendPushNotification(alert);
    } else {
      // Info: Push only
      this.sendPushNotification(alert);
    }
  }

  /**
   * Send email notification
   */
  sendEmailNotification(alert) {
    console.log(`✉️  Email notification: ${alert.title}`);
    // TODO: Integrate with email service (SendGrid, AWS SES, etc)
    // emailService.send({
    //   to: 'admin@smartenergy.com',
    //   subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    //   html: `<p>${alert.message}</p>`
    // });
  }

  /**
   * Send SMS notification
   */
  sendSMSNotification(alert) {
    console.log(`📱 SMS notification: ${alert.title}`);
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc)
    // smsService.send({
    //   to: '+84901234567',
    //   message: `[CRITICAL] ${alert.title}: ${alert.message}`
    // });
  }

  /**
   * Send push notification (WebSocket)
   */
  sendPushNotification(alert) {
    this.broadcastAlert(alert);
  }

  // ===== WEBSOCKET BROADCASTING =====

  /**
   * Register WebSocket subscriber
   */
  subscribe(wsClient) {
    this.subscribers.push(wsClient);
    console.log(`👤 Subscriber added (total: ${this.subscribers.length})`);
  }

  /**
   * Unregister WebSocket subscriber
   */
  unsubscribe(wsClient) {
    const index = this.subscribers.indexOf(wsClient);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
    console.log(`👤 Subscriber removed (total: ${this.subscribers.length})`);
  }

  /**
   * Broadcast alert to all subscribers
   */
  broadcastAlert(alert) {
    const message = JSON.stringify({
      type: 'alert',
      data: alert,
      timestamp: new Date().toISOString()
    });

    this.subscribers.forEach(wsClient => {
      try {
        if (wsClient.readyState === 1) {  // WebSocket.OPEN
          wsClient.send(message);
        }
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    });
  }

  /**
   * Broadcast alert statistics
   */
  broadcastStats() {
    const stats = {
      active: this.getActiveAlerts().length,
      critical: this.getActiveAlerts('critical').length,
      warning: this.getActiveAlerts('warning').length,
      info: this.getActiveAlerts('info').length
    };

    const message = JSON.stringify({
      type: 'alert-stats',
      data: stats,
      timestamp: new Date().toISOString()
    });

    this.subscribers.forEach(wsClient => {
      try {
        if (wsClient.readyState === 1) {
          wsClient.send(message);
        }
      } catch (error) {
        console.error('Broadcast stats error:', error);
      }
    });
  }

  // ===== STATISTICS =====

  /**
   * Get alert statistics
   */
  getStats() {
    const all = [...this.alerts, ...this.alertHistory];

    return {
      total: all.length,
      active: this.alerts.length,
      critical: this.alerts.filter(a => a.severity === 'critical').length,
      warning: this.alerts.filter(a => a.severity === 'warning').length,
      info: this.alerts.filter(a => a.severity === 'info').length,
      acknowledged: all.filter(a => a.acknowledged).length,
      resolved: all.filter(a => a.resolved).length,
      averageAcknowledgeTime: this.getAverageAcknowledgeTime()
    };
  }

  /**
   * Get average time to acknowledge
   */
  getAverageAcknowledgeTime() {
    const acknowledged = this.alertHistory.filter(
      a => a.acknowledged_at && a.timestamp
    );

    if (acknowledged.length === 0) return null;

    const times = acknowledged.map(a => {
      const created = new Date(a.timestamp).getTime();
      const acked = new Date(a.acknowledged_at).getTime();
      return (acked - created) / 1000; // seconds
    });

    return Math.round(times.reduce((a, b) => a + b) / times.length);
  }

  /**
   * Get alerts by time range
   */
  getAlertsByTimeRange(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return [...this.alerts, ...this.alertHistory].filter(a => {
      const alertTime = new Date(a.timestamp).getTime();
      return alertTime >= start && alertTime <= end;
    });
  }

  // ===== LOGGING & PERSISTENCE =====

  /**
   * Log alert (for audit trail)
   */
  logAlert(alert) {
    // TODO: Save to database/file
    console.log(`[ALERT LOG] ${alert.severity} | ${alert.type} | ${alert.title}`);
  }

  /**
   * Export state
   */
  exportState() {
    return {
      active_alerts: this.alerts,
      alert_history: this.alertHistory.slice(-100),
      rules: this.alertRules,
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export default new AlertService();
