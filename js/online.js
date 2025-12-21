/* ================= 在线人数心跳模块 ================= */
document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'https://countdown-online.onrender.com/online'; 

    const onlineCountEl = document.getElementById('online-count');
    const onlineCountSuffix = document.getElementById('person-suffix');
    const STORAGE_KEY = 'clientId';

    // 获取本地存储的 Client ID
    let clientId = localStorage.getItem(STORAGE_KEY);
    let heartbeatInterval = null; // 存储定时器ID

    async function sendHeartbeat() {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId: clientId
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // 更新页面显示的人数
                if (onlineCountEl) {
                    onlineCountEl.innerText = data.online;
                    onlineCountSuffix.textContent = data.online > 1 ?
                        'people are gathering' :
                        'person is waiting';
                }

                // 如果是新用户（本地没有ID或被服务端重置），保存ID
                if (data.id && data.id !== clientId) {
                    clientId = data.id;
                    localStorage.setItem(STORAGE_KEY, clientId);
                }
            }
        } catch (error) {
            console.warn('Heartbeat failed:', error);
        }
    }

    function startHeartbeat() {
        // 避免重复定时器
        if (!heartbeatInterval) {
            heartbeatInterval = setInterval(sendHeartbeat, 10000);
        }
    }

    function stopHeartbeat() {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }

    // 页面可见性变化事件
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            // 页面失焦或挂后台，停止心跳
            stopHeartbeat();
        } else {
            // 页面重新可见，立即发送一次心跳
            sendHeartbeat();
            startHeartbeat();
        }
    });

    // 页面加载后立即发送一次
    sendHeartbeat();
    startHeartbeat();
});
