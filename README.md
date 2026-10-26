# OpenCode Pro RTL Patcher 🚀

A powerful, universal Right-to-Left (RTL) and UI patcher explicitly designed for the **OpenCode Desktop ecosystem** ([OpenCode AI](https://opencode.ai)). 
This tool seamlessly injects a high-performance, native-feeling RTL layout engine and a Pro Settings Widget directly into the OpenCode application.

[Read in Persian / راهنمای فارسی](#راهنمای-فارسی-persian-documentation)

## ✨ Key Features
* **Zero-Delay RTL Engine**: Utilizes an optimized `MutationObserver` mapped to screen refresh rates (`requestAnimationFrame`) to instantly align text without any visual flickering or delay.
* **Pro UI Settings Widget**: Injects a modern floating menu inside OpenCode, allowing you to change fonts, font sizes, line heights, and RTL toggles on the fly.
* **Custom Font Injection**: Safely embeds custom fonts like `Vazirmatn`, `IRANSans`, `Shabnam`, and local OS fonts directly into OpenCode without breaking native English fonts and numbers (`unicode-range` optimized).
* **Protected Code & Syntax**: Code blocks, diffs, Monaco editor segments, and terminals are strictly isolated from RTL manipulation, ensuring pristine LTR formatting.
* **Universal Compatibility**: Dynamically unpacks and repacks `.asar` packages for OpenCode across Windows, macOS, and Linux, safely injecting the payload into the core execution flow.
* **One-Click Revert**: Provides an instant `--restore` option to roll back any changes and return to the factory state at any time.

## ⚙️ Installation & Usage
You can install this tool globally directly from GitHub without manually downloading the source code:
```bash
npm install -g arian13es/opencode-rtl
```
Once installed, simply run the following command anywhere in your terminal:
```bash
opencode-rtl
```
*(To restore OpenCode to its original factory state, run `opencode-rtl --restore`)*

## ⌨️ Shortcuts & Hotkeys
* **`Alt + R`**: Instantly toggle RTL mode on and off.
* **`Shift + 2` (@ sign fix)**: Automatically handles Persian keyboard layout quirks when typing `@` mentions.

## 🤝 Acknowledgements
This project expands upon the architectural principles and injection techniques established in [arian13es/antigravity-pro-rtl](https://github.com/arian13es/antigravity-pro-rtl), tailored specifically for OpenCode Desktop's frontend architecture and design tokens.

---

# راهنمای فارسی (Persian Documentation) 🇮🇷

پچر هوشمند **OpenCode Pro RTL** یک ابزار قدرتمند اختصاصی برای اکوسیستم دسکتاپ **OpenCode** است که قابلیت راست‌چین (RTL) بی‌نقص و یک پنل تنظیمات پیشرفته را به هستهٔ این نرم‌افزار تزریق می‌کند.

## ✨ ویژگی‌های کلیدی
* **موتور RTL بدون پرش**: استفاده از `MutationObserver` فوق‌بهینه و همگام با `requestAnimationFrame` که باعث می‌شود متون فارسی و عربی بدون هیچ پرش یا تأخیر بصری در جهت درست قرار بگیرند.
* **پنل تنظیمات پیشرفته (Pro UI)**: اضافه‌شدنِ یک ویجت حرفه‌ای و شناور در داخل محیط OpenCode که به شما اجازه می‌دهد در لحظه، فونت‌های فارسی و انگلیسی، سایز خطوط، ارتفاع متن و حالت RTL را تغییر دهید.
* **تزریق امن فونت**: فونت متغیر `Vazirmatn` به صورت آفلاین درون برنامه تعبیه شده و همچنین از فونت‌های محلی سیستم نظیر `IRANSans`، `Shabnam` و غیره پشتیبانی می‌شود. (با استفاده از تکنیک `unicode-range` فونت و اعداد انگلیسی دست‌نخورده باقی می‌مانند).
* **محافظت از کدها و ترمینال**: بلوک‌های کد (`pre` و `code`)، ادیتور Monaco و محیط‌های ترمینال به صورت هوشمند شناسایی شده و چپ‌چین (LTR) استاندارد باقی می‌مانند.
* **معماری کاملاً خودکار**: شناسایی خودکار نسخه‌های نصب‌شدهٔ OpenCode در ویندوز، مک و لینوکس، باز کردن پکیج‌های `.asar`، تزریق فایل‌ها و بسته‌بندیِ مجدد برنامه به صورت کاملاً اتوماتیک با یک دستور.
* **بازگردانی سریع**: امکان بازگشت به حالت اولیه کارخانه تنها با یک فلگ (`--restore`).

## ⚙️ نصب و راه‌اندازی
شما می‌توانید این ابزار را به صورت یک دستورِ سراسری (Global) مستقیماً از گیت‌هاب روی سیستم خود نصب کنید:
```bash
npm install -g arian13es/opencode-rtl
```
پس از اتمام نصب، در هر کجای ترمینال تنها با وارد کردن دستور زیر، پچر اجرا می‌شود:
```bash
opencode-rtl
```
*(برای بازگردانی OpenCode به حالت اولیه کارخانه، از دستور `opencode-rtl --restore` استفاده کنید)*

## ⌨️ کلیدهای میانبر
* **`Alt + R`**: تغییر فوری حالت RTL به چپ‌چین و برعکس.
* **اصلاح کلید `@`**: رفع مشکل تایپ کاراکتر `@` در کیبورد فارسی هنگام زدن Shift + 2.
