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


// 更新倒计时
function updateCountdown() {
    const now = new Date();
    
    // 目标时间: 2026年1月1日 00:00:00
    const targetDate = new Date(2026, 0, 1, 0, 0, 0);
    
    // 计算时间差
    const timeDiff = targetDate.getTime() - now.getTime();
    
    // 倒计时结束处理
    if (timeDiff < 0) {
         document.getElementById('days').textContent = '000';
         return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // 1. 更新天数
    document.getElementById('days').textContent = days.toString().padStart(3, '0');
    
    // 2. 更新滚动条
    const hStr = hours.toString().padStart(2, '0');
    updateStripPosition('hours-tens', hStr[0]);
    updateStripPosition('hours-ones', hStr[1]);
    
    const mStr = minutes.toString().padStart(2, '0');
    updateStripPosition('minutes-tens', mStr[0]);
    updateStripPosition('minutes-ones', mStr[1]);

    const sStr = seconds.toString().padStart(2, '0');
    updateStripPosition('seconds-tens', sStr[0]);
    updateStripPosition('seconds-ones', sStr[1]);
    
    // 3. 处理复数
    document.getElementById('day-text').textContent = days > 1 ? 'days':'day';
    document.getElementById('hour-text').textContent = hours > 1 ? 'hours':'hour'

    // 计算2025年进度
    const startOfYear = new Date(2025, 0, 1);
    const endOfYear = new Date(2025, 11, 31, 23, 59, 59);
    const totalYearMs = endOfYear.getTime() - startOfYear.getTime();
    const elapsedYearMs = now.getTime() - startOfYear.getTime();
    
    let progressPercentage = Math.min(100, Math.max(0, (elapsedYearMs / totalYearMs) * 100));
    
    document.getElementById('progress-fill').style.width = `${progressPercentage}%`;
    document.getElementById('progress-percentage').textContent = `${progressPercentage.toFixed(2)}%`;
    
    // 计算已过天数
    // const elapsedDays = Math.floor(elapsedYearMs / (1000 * 60 * 60 * 24));
    
    // // 更新 Header 中的“已过天数”
    // const elapsedEl = document.getElementById('header-elapsed-days');
    // if (elapsedEl) elapsedEl.textContent = elapsedDays;
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = `Today is ` +
        `${now.getFullYear()}.` +
        `${String(now.getMonth() + 1).padStart(2, '0')}.` +
        `${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('update-time').textContent =
        `${String(now.getHours()).padStart(2, '0')}:` +
        `${String(now.getMinutes()).padStart(2, '0')}:` +
        `${String(now.getSeconds()).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', function() {
    createBackgroundAnimation();
    initTickerStrips();
    initHeaderElapsedDays();
    updateCountdown();
    setInterval(updateCountdown, 1000); // 秒级跳动不需要50ms这么快，1000ms更节省性能
});