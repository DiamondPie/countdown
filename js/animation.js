let userTzPreference = Cookie.get('userTimezone') || 'CST';
const params = new URLSearchParams(window.location.search);
const debug = params.get('debug');
const loadTime = new Date()

// 创建背景动画元素
function createBackgroundAnimation() {
    const bgAnimation = document.getElementById('bgAnimation');
    const colors = [
        'rgba(79, 172, 254, 0.05)',
        'rgba(0, 242, 254, 0.05)',
        'rgba(16, 36, 64, 0.05)'
    ];
    
    for (let i = 0; i < 20; i++) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        
        const size = Math.random() * 100 + 20;
        circle.style.width = `${size}px`;
        circle.style.height = `${size}px`;
        circle.style.left = `${Math.random() * 100}%`;
        circle.style.top = `${Math.random() * 100}%`;
        circle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 5;
        circle.style.animationDuration = `${duration}s`;
        circle.style.animationDelay = `${delay}s`;
        
        bgAnimation.appendChild(circle);
    }
}

// 初始化滚动条数字
function initTickerStrips() {
    const strips = [
        { id: 'hours-tens', count: 10 }, 
        { id: 'hours-ones', count: 10 },
        { id: 'minutes-tens', count: 6 },
        { id: 'minutes-ones', count: 10 },
        { id: 'seconds-tens', count: 6 },
        { id: 'seconds-ones', count: 10 }
    ];

    strips.forEach(stripInfo => {
        const el = document.getElementById(stripInfo.id);
        let html = '';
        for(let i = 0; i < stripInfo.count; i++) {
            html += `<div class="digit">${i}</div>`;
        }
        el.innerHTML = html;
    });
}

// 更新滚动条位置
function updateStripPosition(id, value) {
    const el = document.getElementById(id);
    const digit = parseInt(value, 10);
    el.style.transform = `translateY(calc(-1 * var(--digit-height) * ${digit}))`;
}

// 为数字添加累加动画
function animateNumber({
    element,
    from = 0,
    to,
    duration = 1500, // 动画时长（毫秒）
    easing = (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic
}) {
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);

        const currentValue = Math.floor(
            from + (to - from) * easedProgress
        );

        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = to; // 确保最终值准确
        }
    }

    requestAnimationFrame(update);
}

function initHeaderElapsedDays() {
    const now = new Date();
    const startOfYear = new Date(2025, 0, 1);
    const elapsedYearMs = now - startOfYear;
    const elapsedDays = Math.floor(elapsedYearMs / (1000 * 60 * 60 * 24));

    const el = document.getElementById('header-elapsed-days');
    if (!el) return;

    animateNumber({
        element: el,
        from: 0,
        to: elapsedDays,
        duration: 3000
    });

    const dayPlural = document.getElementById('day-plural');
    dayPlural.textContent = elapsedDays > 1 ? 'days':'day';
}

function getTargetDateByPreference() {
    if (debug) {
        // 调试最后20秒倒计时
        return new Date(loadTime.getTime() + 20 * 1000);
    }

    if (userTzPreference === 'CST') {
        // 计算北京时间 2026-01-01 00:00:00 对应的本地时间戳
        // 北京时间比 UTC 快 8 小时
        return new Date(Date.UTC(2025, 11, 31, 16, 0, 0));
    } 
    // 使用用户本地系统的 2026-01-01 00:00:00
    return new Date(2026, 0, 1, 0, 0, 0);
}

function toFixedFloor(num, n) {
    const factor = Math.pow(10, n);
    return (Math.floor(num * factor) / factor).toFixed(n);
}

// 更新倒计时
function updateCountdown() {
    const now = new Date();
    let targetDate = getTargetDateByPreference();
    
    // 计算时间差
    const timeDiff = targetDate.getTime() - now.getTime();
    console.log("Timediff:", timeDiff)
    
    // 计算2025年进度
    const startOfYear = new Date(2025, 0, 1);
    // const endOfYear = new Date(2025, 11, 31, 23, 59, 59);
    const totalYearMs = targetDate.getTime() - startOfYear.getTime();
    const elapsedYearMs = now.getTime() - startOfYear.getTime();
    
    let progressPercentage = Math.min(100, Math.max(0, (elapsedYearMs / totalYearMs) * 100));
    const percentEl = document.getElementById('progress-percentage');

    document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
    // 更新进度百分比文字颜色
    // 映射范围：0% 为色相 190 (青蓝), 100% 为色相 0 (红色)
    const hue = 190 - (progressPercentage * 1.9); 

    if (percentEl) {
        percentEl.textContent = `${toFixedFloor(progressPercentage, 2)}%`;
        if (progressPercentage >= 100) {
            percentEl.classList.add('warn');
        }
        // 设置 HSL 颜色，保持较高的饱和度(80%)和适中的亮度(70%)以确保护眼且亮丽
        percentEl.style.color = `hsl(${hue}, 80%, 70%)`;
        // 可选：添加一点发光感
        percentEl.style.textShadow = `0 0 10px hsl(${hue}, 80%, 50%, 0.3)`;
    }
    // 计算已过天数
    // const elapsedDays = Math.floor(elapsedYearMs / (1000 * 60 * 60 * 24));
    
    // // 更新 Header 中的“已过天数”
    // const elapsedEl = document.getElementById('header-elapsed-days');
    // if (elapsedEl) elapsedEl.textContent = elapsedDays;
    
    document.getElementById('current-date').textContent = `Today is ` +
        `${now.getFullYear()}.` +
        `${String(now.getMonth() + 1).padStart(2, '0')}.` +
        `${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('update-time').textContent =
        `${String(now.getHours()).padStart(2, '0')}:` +
        `${String(now.getMinutes()).padStart(2, '0')}:` +
        `${String(now.getSeconds()).padStart(2, '0')}`;

    // 倒计时结束处理
    if (timeDiff < 0) {
        document.getElementById('days').textContent = '000';
        triggerNewYear();
        return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // 1. 更新天数
    const dayEl = document.getElementById('days');
    const dStr = days.toString().padStart(3, '0')
    dayEl.textContent = dStr;
    if (dStr === '000') dayEl.classList.add('warn')
    
    // 2. 更新滚动条
    const hStr = hours.toString().padStart(2, '0');
    if (dStr === '000' && hStr === '00') document.getElementById('hour-view').classList.add('warn')
    updateStripPosition('hours-tens', hStr[0]);
    updateStripPosition('hours-ones', hStr[1]);
    
    const mStr = minutes.toString().padStart(2, '0');
    if (dStr === '000' && hStr === '00' && mStr === '00') document.getElementById('minute-view').classList.add('warn')
    updateStripPosition('minutes-tens', mStr[0]);
    updateStripPosition('minutes-ones', mStr[1]);

    const sStr = seconds.toString().padStart(2, '0');
    if (dStr === '000' && hStr === '00' && mStr === '00' && sStr === '00') document.getElementById('second-view').classList.add('warn')
    updateStripPosition('seconds-tens', sStr[0]);
    updateStripPosition('seconds-ones', sStr[1]);
    
    // 3. 处理复数
    document.getElementById('day-text').textContent = days > 1 ? 'days':'day';
    document.getElementById('hour-text').textContent = hours > 1 ? 'hours':'hour'

    // ----------------------------

    document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
}

document.addEventListener('DOMContentLoaded', function () {
    const tzSelect = document.getElementById('timezone-select');

    if (tzSelect) {
        tzSelect.addEventListener('change', (e) => {
            userTzPreference = e.target.value;
            Cookie.set('userTimezone', userTzPreference, 30);
            updateCountdown();

            const tzName = e.target.value === 'CST' ? "Beijing Time (UTC+8)" : "System Local Time";
            const toastContent = debug ? 
                '<i class="fa-solid fa-circle-xmark" style="margin-right: 8px; color: #e8466c;"></i> Timezone switching is unavailable under debugger mode.' :
                `<i class="fas fa-check-circle" style="margin-right: 8px; color: #00f2fe;"></i> Timezone switched to: ${tzName}`
            Toastify({
                text: toastContent,
                duration: 3000,
                gravity: "top", 
                position: "center",
                escapeMarkup: false, // 允许渲染图标 HTML
                stopOnFocus: true,
                style: {
                    background: "rgba(16, 36, 64, 0.1)", // 匹配 countdown-box 的深色背景
                    color: "#ffffff",
                    border: "1px solid rgba(79, 172, 254, 0.5)", // 匹配科技蓝边框
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(79, 172, 254, 0.2)",
                    borderRadius: "12px",
                    fontFamily: "'Aldrich', sans-serif",
                    fontSize: "0.9rem",
                    padding: "12px 24px",
                    cursor: "default",
                    backdropFilter: "blur(10px)"
                }
            }).showToast();
        });
    }

    createBackgroundAnimation();
    if (getTargetDateByPreference().getTime() - loadTime.getTime() > 2*60*1000) {
        // 保持观感，最后2分钟不再检测时区差异
        checkTimezone();
    }
    initTickerStrips();
    initHeaderElapsedDays();
    updateCountdown();
    setInterval(updateCountdown, 1000); // 秒级跳动不需要50ms这么快，1000ms更节省性能
});