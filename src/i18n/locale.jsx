/* eslint-disable react-refresh/only-export-components -- locale data and its provider form one public module. */
import { createContext, useContext, useMemo } from "react";

export const translations = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.reports": "التقارير",
    "nav.assets": "الأصول",
    "nav.liabilities": "الخصوم",
    "nav.settings": "الإعدادات",
    "nav.logout": "خروج",
    "expenses.logOne": "تسجيل مصروف",
    "expenses.logMany": "تسجيل المصاريف",
    "expenses.addItem": "إضافة بند",
    "expenses.amount": "المبلغ",
    "expenses.category": "التصنيف",
    "expenses.note": "ملاحظة",
    "expenses.paymentMethod": "أسلوب الدفع",
    "expenses.cash": "كاش",
    "expenses.card": "بطاقة",
    "expenses.newLiability": "التزام جديد",
    "expenses.emergency": "مصروف طارئ",
    "expenses.pendingReview": "بنود المراجعة",
    "expenses.total": "إجمالي المصاريف",
    "expenses.limit": "سقف الصرف",
    "expenses.remaining": "المتبقي",
    "expenses.overLimit": "تجاوز السقف",
    "assets.totalWealth": "إجمالي الثروة",
    "assets.totalAssets": "إجمالي الأصول",
    "assets.netWorth": "صافي الثروة",
    "assets.cashSavings": "الكاش الادخاري",
    "assets.bankAccounts": "الحسابات البنكية",
    "assets.gold": "ذهب",
    "assets.silver": "فضة",
    "assets.stocks": "أسهم",
    "assets.other": "بضائع / أخرى",
    "assets.allocation": "توزيع الأصول",
    "assets.details": "تفاصيل الأصل",
    "assets.activity": "كشف حركة الأصل",
    "assets.extraIncome": "دخل إضافي",
    "assets.transfer": "مناقلة",
    "assets.quantity": "عدد الوحدات",
    "assets.unitPrice": "سعر الوحدة",
    "assets.proceeds": "حصيلة البيع",
    "liabilities.cards": "البطاقات والالتزامات",
    "liabilities.monthly": "الالتزامات الشهرية",
    "liabilities.fixed": "الالتزامات الهيكلية",
    "liabilities.utilized": "الرصيد المستخدم",
    "liabilities.available": "الرصيد المتاح",
    "liabilities.dueDate": "تاريخ الاستحقاق",
    "liabilities.pay": "سداد الالتزام",
    "liabilities.defer": "تأجيل",
    "liabilities.paid": "مدفوع",
    "liabilities.due": "مستحق",
    "settings.profile": "التفاصيل الشخصية",
    "settings.account": "إدارة الحساب",
    "settings.security": "الأمان ومعلومات تسجيل الدخول",
    "settings.changePassword": "تغيير كلمة المرور",
    "settings.currentPassword": "كلمة المرور الحالية",
    "settings.newPassword": "كلمة المرور الجديدة",
    "settings.confirmPassword": "تأكيد كلمة المرور",
    "settings.incomeLimit": "الراتب والسقف",
    "settings.openingBalances": "الأرصدة الافتتاحية",
    "settings.export": "تصدير البيانات",
    "settings.reset": "تصفير البيانات",
    "settings.notifications": "الإشعارات",
    "settings.locale": "اللغة والعملة",
    "settings.share": "مشاركة التطبيق",
    "settings.about": "حول التطبيق",
    "settings.comingSoon": "قيد التجهيز",
    "actions.save": "حفظ",
    "actions.saveChanges": "حفظ التغييرات",
    "actions.add": "إضافة",
    "actions.edit": "تعديل",
    "actions.delete": "حذف",
    "actions.cancel": "إلغاء",
    "actions.back": "رجوع",
    "actions.close": "إغلاق",
    "actions.confirm": "تأكيد",
    "actions.select": "اختر",
    "actions.noRecords": "لا توجد بيانات",
    "actions.saved": "تم الحفظ بنجاح",
    "actions.insufficientFunds": "الرصيد غير كافٍ",
    "actions.saving": "جارٍ الحفظ",
  },
  en: {
    "nav.home": "Home", "nav.reports": "Reports", "nav.assets": "Assets", "nav.liabilities": "Liabilities", "nav.settings": "Settings", "nav.logout": "Log Out",
    "expenses.logOne": "Log Expense", "expenses.logMany": "Log Expenses", "expenses.addItem": "Add Item", "expenses.amount": "Amount", "expenses.category": "Category", "expenses.note": "Note", "expenses.paymentMethod": "Payment Method", "expenses.cash": "Cash", "expenses.card": "Card", "expenses.newLiability": "New Liability", "expenses.emergency": "Emergency Expense", "expenses.pendingReview": "Pending Review", "expenses.total": "Total Expenses", "expenses.limit": "Spending Limit", "expenses.remaining": "Remaining", "expenses.overLimit": "Over Limit",
    "assets.totalWealth": "Total Wealth", "assets.totalAssets": "Total Assets", "assets.netWorth": "Net Worth", "assets.cashSavings": "Cash Savings", "assets.bankAccounts": "Bank Accounts", "assets.gold": "Gold", "assets.silver": "Silver", "assets.stocks": "Stocks", "assets.other": "Other", "assets.allocation": "Asset Allocation", "assets.details": "Asset Details", "assets.activity": "Activity", "assets.extraIncome": "Extra Income", "assets.transfer": "Transfer", "assets.quantity": "Qty", "assets.unitPrice": "Unit Price", "assets.proceeds": "Proceeds",
    "liabilities.cards": "Cards & Liabilities", "liabilities.monthly": "Monthly Bills", "liabilities.fixed": "Fixed Liabilities", "liabilities.utilized": "Utilized Balance", "liabilities.available": "Available Balance", "liabilities.dueDate": "Due Date", "liabilities.pay": "Pay", "liabilities.defer": "Defer", "liabilities.paid": "Paid", "liabilities.due": "Due",
    "settings.profile": "Profile", "settings.account": "Account", "settings.security": "Security", "settings.changePassword": "Change Password", "settings.currentPassword": "Current Password", "settings.newPassword": "New Password", "settings.confirmPassword": "Confirm Password", "settings.incomeLimit": "Income & Limit", "settings.openingBalances": "Opening Balances", "settings.export": "Export Data", "settings.reset": "Reset All Data", "settings.notifications": "Notifications", "settings.locale": "Language & Currency", "settings.share": "Share App", "settings.about": "About", "settings.comingSoon": "Coming Soon",
    "actions.save": "Save", "actions.saveChanges": "Save Changes", "actions.add": "Add", "actions.edit": "Edit", "actions.delete": "Delete", "actions.cancel": "Cancel", "actions.back": "Back", "actions.close": "Close", "actions.confirm": "Confirm", "actions.select": "Select", "actions.noRecords": "No Records", "actions.saved": "Saved!", "actions.insufficientFunds": "Insufficient Funds", "actions.saving": "Saving...",
  },
};

export const currencyLabels = { JOD: "JOD", SAR: "SAR", USD: "$" };

export const translate = (language, key, fallback = key) =>
  translations[language]?.[key] || translations.ar[key] || fallback;

const LocaleContext = createContext({
  language: "ar",
  direction: "rtl",
  currency: "JOD",
  currencyLabel: "JOD",
  t: (key, fallback) => translate("ar", key, fallback),
});

export function LocaleProvider({ language = "ar", currency = "JOD", children }) {
  const value = useMemo(() => ({
    language,
    direction: language === "ar" ? "rtl" : "ltr",
    currency,
    currencyLabel: currencyLabels[currency] || "JOD",
    t: (key, fallback) => translate(language, key, fallback),
  }), [currency, language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
