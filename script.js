// --- CẤU HÌNH MQTT BẢO MẬT ---
const BROKER = "broker.emqx.io";
const PORT = 8084; // Cổng WSS (WebSocket Secure) bắt buộc cho HTTPS
const CLIENT_ID = "smart_parking_mob_" + Math.random().toString(16).substr(2, 5);

// Khởi tạo client Paho MQTT
const client = new Paho.MQTT.Client(BROKER, PORT, CLIENT_ID);

// --- CÁC SỰ KIỆN KẾT NỐI ---
client.onConnectionLost = (responseObject) => {
    console.log("Mất kết nối: " + responseObject.errorMessage);
    updateUIStatus(false);
    // Tự động kết nối lại sau 5 giây
    setTimeout(startConnect, 5000);
};

client.onMessageArrived = (message) => {
    console.log("Dữ liệu mới: " + message.payloadString);
    if (message.destinationName === "parking/slots/state") {
        renderParkingSlots(message.payloadString);
    }
};

// --- HÀM KẾT NỐI ---
function startConnect() {
    console.log("Đang thử kết nối với Broker...");
    client.connect({
        onSuccess: onConnectSuccess,
        onFailure: onConnectFailure,
        useSSL: true, // BẮT BUỘC: Phải là true khi chạy trên GitHub Pages
        timeout: 5,
        keepAliveInterval: 30
    });
}

function onConnectSuccess() {
    console.log("Kết nối MQTT thành công!");
    updateUIStatus(true);
    // Đăng ký nhận dữ liệu từ topic của Wokwi
    client.subscribe("parking/slots/state");
}

function onConnectFailure(error) {
    console.log("Kết nối thất bại: " + error.errorMessage);
    updateUIStatus(false);
    setTimeout(startConnect, 5000);
}

// --- HÀM CẬP NHẬT GIAO DIỆN ---
function updateUIStatus(isOnline) {
    const dot = document.getElementById("status-dot");
    if (dot) {
        dot.className = isOnline ? "status-dot online" : "status-dot offline";
    }
}

function renderParkingSlots(state) {
    // state là chuỗi ví dụ "101" từ Wokwi (1: Trống, 0: Có xe)
    let occupiedCount = 0;
    const totalSlots = state.length;

    for (let i = 0; i < totalSlots; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        if (!slotEl) continue;

        const isAvailable = state[i] === "1";
        const statusText = slotEl.querySelector(".slot-status");

        if (isAvailable) {
            slotEl.className = "slot-item available";
            if (statusText) statusText.innerText = "Chỗ trống";
        } else {
            slotEl.className = "slot-item occupied";
            if (statusText) statusText.innerText = "Đã có xe";
            occupiedCount++;
        }
    }

    // Kiểm tra trạng thái bãi xe đầy
    const notice = document.getElementById("full-notice");
    if (notice) {
        if (occupiedCount === totalSlots && totalSlots > 0) {
            notice.style.display = "flex"; // Hiện thông báo đầy
        } else {
            notice.style.display = "none"; // Ẩn thông báo
        }
    }
}

// Chạy hàm kết nối khi trang web tải xong
window.addEventListener('load', startConnect);