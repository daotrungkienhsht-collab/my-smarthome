// 1. Cấu hình MQTT (Dùng cổng 8084 cho GitHub Pages)
const MQTT_BROKER = "broker.emqx.io";
const MQTT_PORT = 8084; 

// 2. Tạo Client ID ngẫu nhiên để tránh xung đột kết nối
// Mỗi người truy cập sẽ có một mã định danh riêng ví dụ: web_client_a1b2c3d4
const CLIENT_ID = "web_client_" + Math.random().toString(16).substring(2, 10);

const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, CLIENT_ID);

// 3. Thiết lập các hàm xử lý sự kiện
client.onConnectionLost = (responseObject) => {
    console.log("Mất kết nối: " + responseObject.errorMessage);
    document.getElementById("status").innerText = "Mất kết nối! Đang thử lại...";
    document.getElementById("status").style.color = "red";
};

client.onMessageArrived = (message) => {
    console.log("Nhận dữ liệu từ Topic [" + message.destinationName + "]: " + message.payloadString);
    
    // Cập nhật giao diện dựa trên Topic nhận được
    if (message.destinationName === "smart_home/temp") {
        document.getElementById("temp-value").innerText = message.payloadString;
        updateCardColor("temp-card", parseFloat(message.payloadString));
    } else if (message.destinationName === "smart_home/humi") {
        document.getElementById("humi-value").innerText = message.payloadString;
    }
};

// 4. Kết nối tới Broker
const connectOptions = {
    onSuccess: onConnect,
    onFailure: onFail,
    useSSL: true,     // Bắt buộc phải có khi dùng HTTPS/GitHub Pages
    timeout: 5,       // Thời gian chờ kết nối tối đa 5 giây
    keepAliveInterval: 30
};

client.connect(connectOptions);

function onConnect() {
    console.log("Kết nối thành công với ID: " + CLIENT_ID);
    document.getElementById("status").innerText = "Trạng thái: Đã kết nối (ID: " + CLIENT_ID.split('_')[2] + ")";
    document.getElementById("status").style.color = "green";
    
    // Đăng ký nhận dữ liệu từ các Topic
    client.subscribe("smart_home/temp");
    client.subscribe("smart_home/humi");
}

function onFail(error) {
    console.log("Kết nối thất bại: " + error.errorMessage);
    document.getElementById("status").innerText = "Lỗi: " + error.errorMessage;
}

// 5. Hàm gửi lệnh điều khiển (QoS 0 để phản hồi nhanh nhất)
function publishCmd(status) {