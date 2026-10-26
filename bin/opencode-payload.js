/* OPENCODE PRO RTL PATCH - PRO UI */
(function() {
    let rtlConfig = { 
        faFont: '', 
        enFont: '', 
        codeFont: '', 
        lh: '1.6', 
        fs: '13', 
        isRTL: true, 
        forceRTL: false, 
        fixAtSign: true 
    };

    try {
        const saved = localStorage.getItem('opencode-rtl-config') || localStorage.getItem('smart-rtl-config');
        if (saved) {
            rtlConfig = { ...rtlConfig, ...JSON.parse(saved) };
        }
    } catch (e) {}

    let isRTL = rtlConfig.isRTL;
    let forceRTL = rtlConfig.forceRTL || false;
    let fixAtSign = rtlConfig.fixAtSign !== false;

    function injectStyle(id, css) {
        let style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }
        style.textContent = css;
    }

    const staticCSS = `
        .opencode-rtl-widget-container { 
            position: fixed; z-index: 2147483647; 
            display: flex; flex-direction: column; 
            touch-action: none; user-select: none; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .opencode-rtl-widget-panel { 
            position: absolute; 
            transform: scale(0.95); opacity: 0; pointer-events: none; 
            transition: opacity 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
        }
        .opencode-rtl-widget-panel.open { transform: scale(1); opacity: 1; pointer-events: auto; }
        
        .opencode-rtl-theme-panel { 
            background-color: var(--color-surface-raised-base, var(--surface-raised-base, var(--color-surface-base, #1c1c1c))); 
            color: var(--color-text-base, var(--color-v2-text-text-base, #ededed)); 
            border: 1px solid var(--color-border-base, var(--color-v2-border-border-base, rgba(128,128,128,0.25))); 
            padding: 16px 20px; 
            border-radius: 12px; 
            width: 290px; 
            box-shadow: 0 16px 40px rgba(0,0,0,0.6); 
            max-height: 80vh; overflow-y: auto; 
            backdrop-filter: blur(16px);
        }
        
        .opencode-rtl-theme-input { 
            background-color: var(--color-input-base, var(--surface-inset-base, #2a2a2a)); 
            color: var(--color-text-base, var(--color-v2-text-text-base, #ededed)); 
            border: 1px solid var(--color-border-weaker-base, rgba(128,128,128,0.2)); 
            padding: 6px 8px; border-radius: 6px; 
            width: 140px; font-size: 12px; 
            outline: none; transition: border 0.2s; 
        }
        .opencode-rtl-theme-input:focus { 
            border-color: var(--color-border-focus, var(--color-text-interactive-base, #3b82f6)); 
        }
        
        .opencode-rtl-toggle-btn-reset { 
            background: var(--surface-weak, rgba(121, 121, 121, 0.35)); 
            border: none; border-radius: 14px; 
            width: 44px; height: 24px; position: relative; 
            cursor: pointer; transition: background 0.3s; flex-shrink: 0; 
        }
        .opencode-rtl-toggle-btn-reset.active { 
            background: var(--color-text-interactive-base, var(--surface-brand-base, #3b82f6)); 
        }
        .opencode-rtl-toggle-knob { 
            background: #fff; border-radius: 50%; 
            width: 18px; height: 18px; position: absolute; 
            top: 3px; left: 3px; transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .opencode-rtl-toggle-btn-reset.active .opencode-rtl-toggle-knob { transform: translateX(20px); }
        
        .opencode-rtl-row { 
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 14px; padding-bottom: 12px; 
            border-bottom: 1px solid rgba(128,128,128,0.12); 
        }
        .opencode-rtl-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .opencode-rtl-label { font-size: 13px; font-weight: 500; opacity: 0.9; }
        
        .opencode-rtl-widget-trigger { 
            width: 46px; height: 46px; border-radius: 50%; 
            background: var(--color-text-interactive-base, var(--surface-brand-base, #3b82f6)); 
            color: #ffffff; 
            display: flex; align-items: center; justify-content: center; 
            cursor: grab; box-shadow: 0 4px 16px rgba(0,0,0,0.4); 
            transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s; 
            touch-action: none;
        }
        .opencode-rtl-widget-trigger:active { cursor: grabbing; }
        .opencode-rtl-widget-trigger:hover { transform: scale(1.08); filter: brightness(1.1); }
        .opencode-rtl-widget-trigger svg { transition: transform 0.3s; pointer-events: none; }
        .opencode-rtl-widget-panel.open ~ .opencode-rtl-widget-trigger svg { transform: rotate(90deg); }

        /* CRITICAL BIDI ISOLATION FOR INLINE CODE & MONOSPACE */
        code,
        kbd,
        samp,
        var,
        .font-mono {
            direction: ltr !important;
            unicode-bidi: isolate !important;
            text-align: left !important;
            font-family: var(--font-family-mono, "JetBrains Mono", Consolas, monospace) !important;
        }

        pre,
        pre code,
        .monaco-editor,
        .monaco-editor *,
        .cm-editor,
        .cm-editor *,
        [data-code-block],
        [data-code-block] *,
        [class*="terminal"],
        [class*="terminal"] * {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: isolate !important;
            font-family: var(--font-family-mono, "JetBrains Mono", Consolas, monospace) !important;
        }

        /* Math and KaTeX formulas */
        .katex, .katex * {
            direction: ltr !important;
            unicode-bidi: isolate !important;
        }

        /* RTL block definitions */
        [dir="rtl"] {
            text-align: right !important;
            direction: rtl !important;
            unicode-bidi: isolate !important;
        }

        [dir="rtl"] p,
        [dir="rtl"] li,
        [dir="rtl"] h1,
        [dir="rtl"] h2,
        [dir="rtl"] h3,
        [dir="rtl"] h4,
        [dir="rtl"] h5,
        [dir="rtl"] h6,
        [dir="rtl"] blockquote {
            text-align: right !important;
            direction: rtl !important;
            unicode-bidi: isolate !important;
        }

        [dir="ltr"] {
            text-align: left !important;
            direction: ltr !important;
            unicode-bidi: isolate !important;
        }
    `;
    injectStyle('opencode-rtl-widget-style', staticCSS);

    function updateDynamicCSS(faFont, enFont, codeFont, lh, fs) {
        let faFontName = "'PersianOnlyFont'";
        let faFontRule = '';
        const persianUnicodeRange = 'U+0600-06FF, U+FB50-FDFF, U+FE70-FEFF';
        
        if (faFont) {
            faFontName = `'UserPersianFont', 'PersianOnlyFont'`;
            let baseFaFont = faFont.replace(/[-\s]?Regular$/i, '');
            faFontRule = `
                @font-face { font-family: 'UserPersianFont'; src: local('${faFont}'), local('${baseFaFont}'); font-weight: 400; unicode-range: ${persianUnicodeRange}; }
                @font-face { font-family: 'UserPersianFont'; src: local('${baseFaFont} Bold'), local('${baseFaFont}-Bold'); font-weight: 700; unicode-range: ${persianUnicodeRange}; }
            `;
        }
        
        let enFontStr = enFont ? `'${enFont}', ` : '';
        
        const dynamicCSS = `
            ${faFontRule}
            @font-face {
                font-family: 'PersianOnlyFont';
                src: url('data:font/woff2;base64,__FONT_BASE64__') format('woff2');
                font-weight: 100 900;
                unicode-range: ${persianUnicodeRange};
            }

            :root, html, body, #root {
                --font-family-sans: ${faFontName}, ${enFontStr}var(--font-sans, Inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                --v2-font-family-sans: ${faFontName}, ${enFontStr}var(--font-sans, Inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                --font-sans: ${faFontName}, ${enFontStr}Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                --font-family-text: ${faFontName}, ${enFontStr}var(--font-sans, Inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }

            .opencode-rtl-text-node,
            [dir="rtl"],
            [dir="rtl"] p,
            [dir="rtl"] li,
            [dir="rtl"] h1,
            [dir="rtl"] h2,
            [dir="rtl"] h3,
            [dir="rtl"] h4,
            [dir="rtl"] span,
            [dir="rtl"] a,
            [dir="rtl"] blockquote {
                font-family: ${faFontName}, ${enFontStr}var(--font-family-sans, Inter), "Segoe UI Emoji", sans-serif !important;
            }

            .opencode-rtl-text-node,
            [dir="rtl"],
            [dir="rtl"] p,
            [dir="rtl"] li {
                font-size: ${fs}px !important;
                line-height: ${lh} !important;
            }
        `;
        if (isRTL) injectStyle('opencode-rtl-dynamic-style', dynamicCSS);
    }
    updateDynamicCSS(rtlConfig.faFont, rtlConfig.enFont, rtlConfig.codeFont, rtlConfig.lh, rtlConfig.fs);

    function createWidget() {
        if (document.querySelector('.opencode-rtl-widget-container')) return;

        const container = document.createElement('div');
        container.className = 'opencode-rtl-widget-container';

        const panel = document.createElement('div');
        panel.className = 'opencode-rtl-widget-panel opencode-rtl-theme-panel';
        
        const title = document.createElement('div');
        title.style.cssText = 'text-align:center; font-weight:700; font-size:15px; margin-bottom:16px; letter-spacing:0.5px;';
        title.textContent = 'OpenCode Pro RTL Settings';
        panel.appendChild(title);

        const trigger = document.createElement('div');
        trigger.className = 'opencode-rtl-widget-trigger';
        trigger.title = 'OpenCode RTL (کلیک: تنظیمات | درگ: جابجایی)';
        
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const line1 = document.createElementNS(ns, 'line');
        line1.setAttribute('x1', '21'); line1.setAttribute('y1', '6'); line1.setAttribute('x2', '3'); line1.setAttribute('y2', '6');
        
        const line2 = document.createElementNS(ns, 'line');
        line2.setAttribute('x1', '21'); line2.setAttribute('y1', '12'); line2.setAttribute('x2', '10'); line2.setAttribute('y2', '12');
        
        const line3 = document.createElementNS(ns, 'line');
        line3.setAttribute('x1', '21'); line3.setAttribute('y1', '18'); line3.setAttribute('x2', '6'); line3.setAttribute('y2', '18');
        
        const poly = document.createElementNS(ns, 'polyline');
        poly.setAttribute('points', '10 15 7 12 10 9');

        svg.appendChild(line1);
        svg.appendChild(line2);
        svg.appendChild(line3);
        svg.appendChild(poly);
        
        trigger.appendChild(svg);

        function applyPosition(x, y) {
            const margin = 12;
            const btnSize = 48;
            const maxX = Math.max(margin, window.innerWidth - btnSize - margin);
            const maxY = Math.max(margin, window.innerHeight - btnSize - margin);
            const clampedX = Math.min(Math.max(margin, x), maxX);
            const clampedY = Math.min(Math.max(margin, y), maxY);

            container.style.left = clampedX + 'px';
            container.style.top = clampedY + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';

            const isBottomHalf = clampedY > (window.innerHeight / 2);
            const isRightHalf = clampedX > (window.innerWidth / 2);

            if (isBottomHalf) {
                panel.style.bottom = '54px';
                panel.style.top = 'auto';
            } else {
                panel.style.top = '54px';
                panel.style.bottom = 'auto';
            }

            if (isRightHalf) {
                panel.style.right = '0';
                panel.style.left = 'auto';
                panel.style.transformOrigin = isBottomHalf ? 'bottom right' : 'top right';
                container.style.alignItems = 'flex-end';
            } else {
                panel.style.left = '0';
                panel.style.right = 'auto';
                panel.style.transformOrigin = isBottomHalf ? 'bottom left' : 'top left';
                container.style.alignItems = 'flex-start';
            }

            return { x: clampedX, y: clampedY };
        }

        try {
            const savedPos = JSON.parse(localStorage.getItem('opencode-rtl-widget-pos') || localStorage.getItem('smart-rtl-widget-pos') || 'null');
            if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
                applyPosition(savedPos.x, savedPos.y);
            } else {
                applyPosition(window.innerWidth - 64, window.innerHeight - 64);
            }
        } catch (e) {
            applyPosition(window.innerWidth - 64, window.innerHeight - 64);
        }

        window.addEventListener('resize', () => {
            const curX = parseInt(container.style.left, 10) || (window.innerWidth - 64);
            const curY = parseInt(container.style.top, 10) || (window.innerHeight - 64);
            applyPosition(curX, curY);
        });

        let isDragging = false;
        let hasMoved = false;
        let startPointerX = 0, startPointerY = 0;
        let startElemX = 0, startElemY = 0;

        function onPointerDown(e) {
            if (e.button !== undefined && e.button !== 0) return;
            isDragging = true;
            hasMoved = false;
            startPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            startPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const rect = container.getBoundingClientRect();
            startElemX = rect.left;
            startElemY = rect.top;

            window.addEventListener('mousemove', onPointerMove, { passive: false });
            window.addEventListener('mouseup', onPointerUp);
            window.addEventListener('touchmove', onPointerMove, { passive: false });
            window.addEventListener('touchend', onPointerUp);
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const dx = clientX - startPointerX;
            const dy = clientY - startPointerY;

            if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                hasMoved = true;
            }

            if (hasMoved) {
                if (e.cancelable) e.preventDefault();
                applyPosition(startElemX + dx, startElemY + dy);
            }
        }

        function onPointerUp() {
            if (!isDragging) return;
            isDragging = false;

            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);

            if (hasMoved) {
                const finalX = parseInt(container.style.left, 10);
                const finalY = parseInt(container.style.top, 10);
                try {
                    localStorage.setItem('opencode-rtl-widget-pos', JSON.stringify({ x: finalX, y: finalY }));
                } catch (err) {}
            }
        }

        trigger.addEventListener('mousedown', onPointerDown);
        trigger.addEventListener('touchstart', onPointerDown, { passive: true });

        trigger.onclick = (e) => {
            e.stopPropagation();
            if (hasMoved) return;
            panel.classList.toggle('open');
        };

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                panel.classList.remove('open');
            }
        });

        function createRow(labelText, element) {
            const row = document.createElement('div');
            row.className = 'opencode-rtl-row';
            const label = document.createElement('span');
            label.className = 'opencode-rtl-label';
            label.textContent = labelText;
            row.appendChild(label);
            row.appendChild(element);
            return row;
        }

        function createToggle(id, active) {
            const btn = document.createElement('button');
            btn.id = id;
            btn.className = 'opencode-rtl-toggle-btn-reset ' + (active ? 'active' : '');
            const knob = document.createElement('div');
            knob.className = 'opencode-rtl-toggle-knob';
            btn.appendChild(knob);
            return btn;
        }

        function createFontSelector(val, fontList) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'flex-end';
            wrapper.style.gap = '6px';

            const select = document.createElement('select');
            select.className = 'opencode-rtl-theme-input';
            
            let found = false;
            fontList.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.value;
                opt.textContent = f.label;
                if (val === f.value) { opt.selected = true; found = true; }
                select.appendChild(opt);
            });

            const customOpt = document.createElement('option');
            customOpt.value = '__custom__';
            customOpt.textContent = 'Custom...';
            if (!found && val !== '') { customOpt.selected = true; found = true; }
            select.appendChild(customOpt);

            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.className = 'opencode-rtl-theme-input';
            customInput.placeholder = 'e.g. B Yekan';
            customInput.style.display = (select.value === '__custom__') ? 'block' : 'none';
            customInput.value = (!found && val) ? val : '';

            select.onchange = () => {
                customInput.style.display = select.value === '__custom__' ? 'block' : 'none';
            };

            wrapper.appendChild(select);
            wrapper.appendChild(customInput);

            return {
                element: wrapper,
                getValue: () => select.value === '__custom__' ? customInput.value.trim() : select.value,
                onChange: (cb) => { select.addEventListener('change', cb); customInput.addEventListener('input', cb); }
            };
        }

        const faFonts = [
            { label: 'System Default (Vazirmatn)', value: '' },
            { label: 'Vazirmatn', value: 'Vazirmatn' },
            { label: 'IRANSans', value: 'IRANSans' },
            { label: 'IRANSansX', value: 'IRANSansX' },
            { label: 'Shabnam', value: 'Shabnam' },
            { label: 'B Yekan', value: 'B Yekan' },
            { label: 'B Nazanin', value: 'B Nazanin' },
            { label: 'Tahoma', value: 'Tahoma' },
            { label: 'Segoe UI', value: 'Segoe UI' }
        ];

        const enFonts = [
            { label: 'System Default (Inter)', value: '' },
            { label: 'Inter', value: 'Inter' },
            { label: 'Segoe UI', value: 'Segoe UI' },
            { label: 'Arial', value: 'Arial' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' },
            { label: 'Consolas', value: 'Consolas' },
            { label: 'Fira Code', value: 'Fira Code' }
        ];

        const toggleBtn = createToggle('opencode-rtl-toggle-btn', isRTL);
        const forceBtn = createToggle('opencode-rtl-force-btn', forceRTL);
        const atBtn = createToggle('opencode-rtl-at-btn', fixAtSign);
        
        const faFontSelector = createFontSelector(rtlConfig.faFont, faFonts);
        const enFontSelector = createFontSelector(rtlConfig.enFont, enFonts);
        
        const fsInput = document.createElement('input');
        fsInput.id = 'opencode-rtl-fs-input';
        fsInput.type = 'number';
        fsInput.min = '10'; fsInput.max = '30'; fsInput.step = '1';
        fsInput.value = rtlConfig.fs;
        fsInput.className = 'opencode-rtl-theme-input';

        const lhInput = document.createElement('input');
        lhInput.id = 'opencode-rtl-lh-input';
        lhInput.type = 'range';
        lhInput.min = '1.2'; lhInput.max = '2.5'; lhInput.step = '0.1';
        lhInput.value = rtlConfig.lh;
        lhInput.className = 'opencode-rtl-theme-input';

        panel.appendChild(createRow('Enable RTL', toggleBtn));
        panel.appendChild(createRow('Force RTL', forceBtn));
        panel.appendChild(createRow('Persian Font', faFontSelector.element));
        panel.appendChild(createRow('English Font', enFontSelector.element));
        panel.appendChild(createRow('Font Size (px)', fsInput));
        panel.appendChild(createRow('Line Height', lhInput));
        panel.appendChild(createRow('Fix @ Sign', atBtn));

        const footer = document.createElement('div');
        footer.style.cssText = 'margin-top:20px; text-align:center; font-size:12px; opacity:0.8; border-top:1px solid rgba(128,128,128,0.2); padding-top:12px; font-family:sans-serif;';
        
        const footerText = document.createTextNode('Developed by ');
        const githubLink = document.createElement('a');
        githubLink.href = 'https://github.com/arian13es';
        githubLink.textContent = 'Arian';
        githubLink.style.cssText = 'color:var(--color-text-interactive-base, #3b82f6); text-decoration:none; font-weight:bold; cursor:pointer;';
        
        footer.appendChild(footerText);
        footer.appendChild(githubLink);
        panel.appendChild(footer);

        container.appendChild(panel);
        container.appendChild(trigger);
        document.body.appendChild(container);

        const saveConfig = () => {
            try {
                const conf = {
                    faFont: faFontSelector.getValue(),
                    enFont: enFontSelector.getValue(),
                    codeFont: '',
                    lh: lhInput.value,
                    fs: fsInput.value,
                    isRTL, forceRTL, fixAtSign
                };
                localStorage.setItem('opencode-rtl-config', JSON.stringify(conf));
                localStorage.setItem('smart-rtl-config', JSON.stringify(conf));
            } catch(e) {}
        };

        const onSettingsChange = () => {
            saveConfig();
            if (isRTL) {
                updateDynamicCSS(faFontSelector.getValue(), enFontSelector.getValue(), '', lhInput.value, fsInput.value);
                updateDir();
            }
        };

        toggleBtn.onclick = () => {
            isRTL = !isRTL;
            toggleBtn.className = 'opencode-rtl-toggle-btn-reset ' + (isRTL ? 'active' : '');
            saveConfig();
            if (isRTL) {
                onSettingsChange();
            } else {
                const s = document.getElementById('opencode-rtl-dynamic-style');
                if (s) s.remove();
                document.querySelectorAll('.opencode-rtl-text-node').forEach(el => {
                    el.removeAttribute('dir');
                    el.style.removeProperty('text-align');
                    el.style.removeProperty('direction');
                    el.style.removeProperty('unicode-bidi');
                });
            }
        };

        forceBtn.onclick = () => {
            forceRTL = !forceRTL;
            forceBtn.className = 'opencode-rtl-toggle-btn-reset ' + (forceRTL ? 'active' : '');
            saveConfig();
            updateDir();
        };

        atBtn.onclick = () => {
            fixAtSign = !fixAtSign;
            atBtn.className = 'opencode-rtl-toggle-btn-reset ' + (fixAtSign ? 'active' : '');
            saveConfig();
        };

        faFontSelector.onChange(onSettingsChange);
        enFontSelector.onChange(onSettingsChange);
        fsInput.oninput = onSettingsChange;
        lhInput.oninput = onSettingsChange;
    }
    
    if (document.body) createWidget();
    else window.addEventListener('DOMContentLoaded', createWidget);

    function getCleanText(el) {
        let str = '';
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_ACCEPT;
                const tag = parent.tagName;
                if (['CODE', 'PRE', 'KBD', 'SAMP', 'VAR', 'SCRIPT', 'STYLE'].includes(tag)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.closest('pre, code, .monaco-editor, .cm-editor, [data-code-block], .katex')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        while (walker.nextNode()) {
            str += ' ' + walker.currentNode.nodeValue;
        }
        return str.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
    }

    function determineDirection(cleanText) {
        if (forceRTL) return 'rtl';
        if (!cleanText) return 'ltr';

        const faMatches = cleanText.match(/[\u0600-\u06FF]/g) || [];
        const enMatches = cleanText.match(/[A-Za-z]/g) || [];
        const faCount = faMatches.length;
        const enCount = enMatches.length;

        if (faCount > 0) {
            if (faCount >= enCount * 0.4 || faCount >= 3) {
                return 'rtl';
            }
            const firstChar = cleanText.match(/[A-Za-z\u0600-\u06FF]/);
            return firstChar && /[\u0600-\u06FF]/.test(firstChar[0]) ? 'rtl' : 'ltr';
        }
        return 'ltr';
    }

    function updateDir() {
        if (!isRTL) return;
        
        // Target BLOCK-level containers and editable inputs ONLY
        // Never fracture inline spans into disconnected bidi runs!
        const blockElements = document.querySelectorAll(`
            p, 
            li, 
            h1, h2, h3, h4, h5, h6, 
            blockquote, 
            textarea, 
            [contenteditable="true"], 
            input[type="text"],
            div.prose,
            [class*="message"],
            [class*="bubble"],
            [class*="prompt"]
        `);

        for (let i = 0; i < blockElements.length; i++) {
            const el = blockElements[i];

            // Ignore widget elements
            if (el.closest('.opencode-rtl-widget-container')) continue;

            // Ignore code blocks, Monaco, terminals
            if (el.closest('pre, .monaco-editor, .cm-editor, [data-code-block], [class*="terminal"]')) continue;
            if (['PRE', 'CODE'].includes(el.tagName)) continue;

            // For input / textarea / contenteditable
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.getAttribute('contenteditable') === 'true') {
                const val = el.value || el.textContent || '';
                const clean = val.replace(/[\u200B-\u200F\uFEFF]/g, '').trim();
                const dir = determineDirection(clean);
                if (el.getAttribute('dir') !== dir) {
                    el.setAttribute('dir', dir);
                    el.style.setProperty('text-align', dir === 'rtl' ? 'right' : 'left', 'important');
                    el.style.setProperty('direction', dir, 'important');
                }
                continue;
            }

            // For text blocks (p, li, headings, etc.)
            const cleanText = getCleanText(el);
            if (!cleanText) continue;

            const dir = determineDirection(cleanText);

            if (!el.classList.contains('opencode-rtl-text-node')) {
                el.classList.add('opencode-rtl-text-node');
            }

            if (el.getAttribute('dir') !== dir) {
                el.setAttribute('dir', dir);
                el.style.setProperty('text-align', dir === 'rtl' ? 'right' : 'left', 'important');
                el.style.setProperty('direction', dir, 'important');
                el.style.setProperty('unicode-bidi', 'isolate', 'important');

                // If inside a message bubble/container, align the container as well
                const bubble = el.closest('[class*="message"], [class*="bubble"], [class*="prompt"], [class*="chat-item"]');
                if (bubble && bubble.getAttribute('dir') !== dir) {
                    bubble.setAttribute('dir', dir);
                }
            }
        }
    }

    document.addEventListener('input', updateDir, { capture: true });
    
    let updateDirRAF = null;
    const observer = new MutationObserver((mutations) => {
        if (!isRTL) return;
        let needsUpdate = false;
        for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0 || mutations[i].type === 'characterData') {
                needsUpdate = true;
                break;
            }
        }
        if (needsUpdate) {
            if (updateDirRAF) cancelAnimationFrame(updateDirRAF);
            updateDirRAF = requestAnimationFrame(() => {
                updateDir();
            });
        }
    });
    
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        });
    }

    setInterval(() => {
        if (isRTL) updateDir();
    }, 1500);

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'KeyR') { 
            const toggle = document.getElementById('opencode-rtl-toggle-btn');
            if (toggle) toggle.click();
        }
        if (fixAtSign && e.code === 'Digit2' && e.shiftKey) {
            if (e.key === '٬' || e.key === '،') {
                e.preventDefault();
                document.execCommand('insertText', false, '@');
            }
        }
    }, { capture: true });

})();
