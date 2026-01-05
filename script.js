// Cấu hình MQTT qua WebSocket
const MQTT_BROKER = "broker.emqx.io";
const MQTT_PORT = 8083; // Cổng WebSocket
const CLIENT_ID = "web_client_" + Math.random().toString(16).substr(2, 8);

const client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, CLIENT_ID);

client.onConnectionLost = (responseObject) => {
    document.getElementById("status").innerText = "Mất kết nối!";
};

client.onMessageArrived = (message) => {
    if (message.destinationName === "smart_home/temp") {
        document.getElementById("temp-value").innerText = message.payloadString;
    } else if (message.destinationName === "smart_home/humi") {
        document.getElementById("humi-value").innerText = message.payloadString;
    }
};

client.connect({
    onSuccess: () => {
        document.getElementById("status").innerText = "Trạng thái: Đã kết nối Broker";
        client.subscribe("smart_home/temp");
        client.subscribe("smart_home/humi");
    },
    useSSL: false
});

// Thay đổi hàm publishCmd
function publishCmd(status) {
    let message = new Paho.MQTT.Message(status);
    message.destinationName = "smart_home/light";
    message.qos = 0; // Đặt QoS bằng 0 để truyền tin nhanh nhất
    client.send(message);
}