const DAY_MS = 24 * 60 * 60 * 1000;

const localDay = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const recurringDueDate = (dueDay, now) => {
  const day = Number(dueDay || 0);
  if (!day) return null;
  const createDate = (year, month) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(day, lastDay));
  };
  const today = localDay(now);
  let due = createDate(today.getFullYear(), today.getMonth());
  if (due < today) due = createDate(today.getFullYear(), today.getMonth() + 1);
  return due;
};

export function notificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return window.Notification.permission;
}

export async function requestNotificationPermission() {
  if (notificationPermission() === "unsupported") return "unsupported";
  return window.Notification.requestPermission();
}

export async function registerNotificationServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/notification-sw.js");
}

export async function showAppNotification({ title, body, tag }) {
  if (notificationPermission() !== "granted") return false;
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, tag, renotify: false });
    } else {
      new window.Notification(title, { body, tag, renotify: false });
    }
    return true;
  } catch {
    return false;
  }
}

export function buildNotificationPlan(state, now = new Date()) {
  const notifications = state.settings?.notifications || {};
  const sent = notifications.sent || {};
  const alerts = [];
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (notifications.budget ?? true) {
    const cap = Number(state.session?.spendingCap || 0);
    const spent = Number(state.session?.coveredSpent || 0);
    const percent = cap > 0 ? (spent / cap) * 100 : 0;
    const reached = [50, 70, 90, 100].filter((threshold) => percent >= threshold);
    const unsent = reached.filter((threshold) => !sent[`budget:${monthKey}:${threshold}`]);
    if (unsent.length) {
      const threshold = Math.max(...unsent);
      alerts.push({
        key: `budget:${monthKey}:${threshold}`,
        title: "تنبيه سقف الصرف",
        body: threshold >= 100
          ? "تم استهلاك 100% من سقف الصرف."
          : `تم استهلاك ${threshold}% من سقف الصرف.`,
        tag: `wealth-budget-${monthKey}`,
        markKeys: reached.map((value) => `budget:${monthKey}:${value}`),
      });
    }
  }

  if (notifications.liabilities ?? true) {
    const today = localDay(now);
    (state.currentLiabilities || []).forEach((liability) => {
      if (liability.status === "paid") return;
      const explicitDue = liability.dueDate ? localDay(liability.dueDate) : null;
      const due = explicitDue || recurringDueDate(liability.dueDay, now);
      if (!due) return;
      const daysUntil = Math.round((due.getTime() - today.getTime()) / DAY_MS);
      if (![3, 0].includes(daysUntil)) return;
      const dateKey = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
      const key = `liability:${liability.id}:${dateKey}:${daysUntil}`;
      if (sent[key]) return;
      const name = liability.name || liability.label || "التزام";
      alerts.push({
        key,
        title: daysUntil === 0 ? "التزام مستحق اليوم" : "موعد استحقاق قريب",
        body: daysUntil === 0
          ? `${name} مستحق اليوم.`
          : `${name} يستحق بعد 3 أيام.`,
        tag: `wealth-liability-${liability.id}-${dateKey}-${daysUntil}`,
        markKeys: [key],
      });
    });
  }

  return alerts;
}
