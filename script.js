// 1. Cấu hình kết nối
const MQTT_BROKER = "broker.emqx.io";
const MQTT_PORT = 8084; // Cổng WSS cho HTTPS
const CLIENT_ID = "web_user_" + Math.random().toString(16).substr(2, 5);

// Khởi tạo client
const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, CLIENT_ID);

// 2. Cấu hình các hàm phản hồi
client.onConnectionLost = (responseObject) => {
    console.log("Mất kết nối: " + responseObject.errorMessage);
    const statusEl = document.getElementById("status");
    statusEl.innerText = "Mất kết nối! Đang thử lại...";
    statusEl.className = "status-disconnected";
};

client.onMessageArrived = (message) => {
    console.log("Topic: " + message.destinationName + " | Data: " + message.payloadString);
    
    if (message.destinationName === "smart_home/temp") {
        document.getElementById("temp-value").innerText = message.payloadString;
    } else if (message.destinationName === "smart_home/humi") {
        document.getElementById("humi-value").innerText = message.payloadString;
    }
};

// 3. Tiến hành kết nối
const connectOptions = {
    onSuccess: onConnect,
    onFailure: onFail,
    useSSL: true, // Bắt buộc true khi chạy trên GitHub Pages
    timeout: 3,
    keepAliveInterval: 30
};

console.log("Đang khởi tạo kết nối MQTT...");
client.connect(connectOptions);

function onConnect() {
    console.log("Kết nối thành công! ID: " + CLIENT_ID);
    const statusEl = document.getElementById("status");
    statusEl.innerText = "Trạng thái: Đã kết nối hệ thống";
    statusEl.className = "status-connected";

    // Đăng ký nhận dữ liệu
    client.subscribe("smart_home/temp");
    client.subscribe("smart_home/humi");
}

function onFail(error) {
    console.log("Kết nối thất bại: " + error.errorMessage);
    document.getElementById("status").innerText = "Lỗi kết nối: " + error.errorMessage;
    document.getElementById("status").className = "status-disconnected";
}

// 4. Hàm gửi lệnh
function publishCmd(status) {
    try {
        let message = new Paho.MQTT.Message(status);
        message.destinationName = "smart_home/light";
        message.qos = 0;
        client.send(message);
        console.log("Đã gửi lệnh: " + status);
    } catch (e) {
        alert("Chưa kết nối được hệ thống, vui lòng chờ!");
    }
}