// ============================================
// PHANTOM FINANCE - BROWSER PUSH NOTIFICATIONS
// Supports Chrome, Edge, Firefox, Safari, and
// mobile browsers (via PWA / service worker)
// ============================================

import { getState, setState } from './store.js';
import { formatCurrency } from '../utils/helpers.js';

const NOTIFICATION_CHECK_KEY = 'phantom-finance-last-notif-check';

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'denied' };
  }

  if (Notification.permission === 'granted') {
    return { supported: true, permission: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return { supported: true, permission: 'denied' };
  }

  const permission = await Notification.requestPermission();
  return { supported: true, permission };
}

// Check if notifications are enabled
export function areNotificationsEnabled() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Get notification permission status
export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'granted', 'denied', or 'default'
}

// Send a browser notification
export function sendNotification(title, options = {}) {
  if (!areNotificationsEnabled()) return null;

  const defaults = {
    icon: '💰',
    badge: '💰',
    tag: 'phantom-finance',
    requireInteraction: false,
    silent: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaults);

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.onClick) options.onClick();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return notification;
  } catch (e) {
    console.warn('Failed to send notification:', e);
    return null;
  }
}

// Check for upcoming payments and send reminders
export function checkUpcomingPayments() {
  const state = getState();
  if (!state.settings.notificationsEnabled) return;
  if (!areNotificationsEnabled()) return;

  const today = new Date();
  const dayOfMonth = today.getDate();
  const reminderDays = state.settings.reminderDaysBefore || 3;

  // Check if we already sent notifications today
  const lastCheck = localStorage.getItem(NOTIFICATION_CHECK_KEY);
  const todayStr = today.toISOString().split('T')[0];
  if (lastCheck === todayStr) return;

  const upcomingPayments = [];

  // Check monthly expenses
  state.monthlyExpenses.forEach(expense => {
    if (!expense.dueDay) return;
    const daysUntil = getDaysUntilDue(dayOfMonth, expense.dueDay);
    if (daysUntil >= 0 && daysUntil <= reminderDays) {
      upcomingPayments.push({
        name: expense.name,
        amount: expense.amount,
        dueDay: expense.dueDay,
        daysUntil,
        type: 'expense',
        autoPay: expense.autoPay || false,
      });
    }
  });

  // Check debt payments
  state.debts.forEach(debt => {
    if (!debt.dueDay) return;
    const daysUntil = getDaysUntilDue(dayOfMonth, debt.dueDay);
    if (daysUntil >= 0 && daysUntil <= reminderDays) {
      upcomingPayments.push({
        name: debt.name,
        amount: debt.monthlyPayment,
        dueDay: debt.dueDay,
        daysUntil,
        type: 'debt',
      });
    }
  });

  // Send notifications
  if (upcomingPayments.length > 0) {
    // Group notifications
    if (upcomingPayments.length === 1) {
      const p = upcomingPayments[0];
      const prefix = p.daysUntil === 0 ? '🔴 Due Today' : p.daysUntil === 1 ? '🟡 Due Tomorrow' : `📅 Due in ${p.daysUntil} days`;
      sendNotification(`${prefix}: ${p.name}`, {
        body: `${formatCurrency(p.amount)} ${p.autoPay ? '(Auto-pay)' : '— don\'t forget to pay!'}`,
        tag: `payment-${p.name}`,
      });
    } else {
      const totalDue = upcomingPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const todayPayments = upcomingPayments.filter(p => p.daysUntil === 0);
      const soonPayments = upcomingPayments.filter(p => p.daysUntil > 0);

      let body = '';
      if (todayPayments.length > 0) {
        body += `🔴 Due today: ${todayPayments.map(p => p.name).join(', ')}\n`;
      }
      if (soonPayments.length > 0) {
        body += `📅 Coming up: ${soonPayments.map(p => `${p.name} (day ${p.dueDay})`).join(', ')}`;
      }

      sendNotification(`💰 ${upcomingPayments.length} Upcoming Payments — ${formatCurrency(totalDue)}`, {
        body,
        tag: 'payment-summary',
      });
    }
  }

  // Mark today as checked
  localStorage.setItem(NOTIFICATION_CHECK_KEY, todayStr);
}

// Calculate days until due date (handles month wrap-around)
function getDaysUntilDue(today, dueDay) {
  if (dueDay >= today) {
    return dueDay - today;
  }
  // Due day has passed this month — calculate for next month
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  return (daysInMonth - today) + dueDay;
}

// Initialize notification system
export function initNotifications() {
  const state = getState();

  // Ensure notification settings exist
  if (state.settings.notificationsEnabled === undefined) {
    setState(s => {
      s.settings.notificationsEnabled = false;
      s.settings.reminderDaysBefore = 3;
    });
  }

  // Check for upcoming payments on load
  if (state.settings.notificationsEnabled && areNotificationsEnabled()) {
    // Small delay to not block page load
    setTimeout(() => checkUpcomingPayments(), 3000);

    // Check every 4 hours
    setInterval(() => checkUpcomingPayments(), 4 * 60 * 60 * 1000);
  }
}

// Toggle notifications on/off
export async function toggleNotifications(enable) {
  if (enable) {
    const result = await requestNotificationPermission();
    if (result.permission === 'granted') {
      setState(s => { s.settings.notificationsEnabled = true; });
      // Send a test notification
      sendNotification('🔔 Notifications Enabled!', {
        body: 'You\'ll receive reminders before payment due dates.',
        tag: 'test-notification',
      });
      // Start checking
      checkUpcomingPayments();
      return true;
    } else if (result.permission === 'denied') {
      return false;
    } else if (!result.supported) {
      return false;
    }
  } else {
    setState(s => { s.settings.notificationsEnabled = false; });
    return true;
  }
  return false;
}

// Send a test notification
export function sendTestNotification() {
  return sendNotification('🧪 Test Notification', {
    body: 'Phantom Finance notifications are working! You\'ll be reminded before payment due dates.',
    tag: 'test-notification',
  });
}
