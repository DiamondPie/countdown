/* ================= 在线人数心跳模块 ================= */
document.addEventListener('DOMContentLoaded', function () {
    // 后端 API 地址，本地开发时改为 localhost:8000，上线时改为你的服务器地址
    // 注意：如果是 https 网站，后端也必须是 https，或者通过 Nginx 反代
    const API_URL = 'https://countdown-online.onrender.com/'; 

    const onlineCountEl = document.getElementById('online-count');
    const onlineCountSuffix = document.getElementById('person-suffix');
    const STORAGE_KEY = 'clientId';

    // 获取本地存储的 Client ID
    let clientId = localStorage.getItem(STORAGE_KEY);

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
                
                // 1. 更新页面显示的人数
                if (onlineCountEl) {
                    onlineCountEl.innerText = data.online;
                    onlineCountSuffix = data.online > 1 ?
                        'people are gathering' :
                        'person is waiting'
                }

                // 2. 如果是新用户（本地没有ID或被服务端重置），保存ID
                if (data.id && data.id !== clientId) {
                    clientId = data.id;
                    localStorage.setItem(STORAGE_KEY, clientId);
                }
            }
        } catch (error) {
            console.warn('Heartbeat failed:', error);
            // 失败时不做处理，保持上一次显示的数字即可
        }
    }

    // 页面加载后立即发送一次
    sendHeartbeat();

    // 之后每 10 秒发送一次心跳 (后端超时设定为 30秒，所以 10-15秒是安全的)
    setInterval(sendHeartbeat, 10000);
});