// 1. Khởi tạo Bản đồ (Vị trí Số 1 Đại Cồ Việt)
const bkhn_coords = [21.0105, 105.8490];
const map = L.map('map').setView(bkhn_coords, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker(bkhn_coords).addTo(map).bindPopup('Bãi Xe Thông Minh').openPopup();

// 2. Kết nối MQTT nhận dữ liệu từ Wokwi
const client = new Paho.MQTT.Client("broker.emqx.io", 8083, "customer_" + Math.random());

client.onMessageArrived = (msg) => {
    if (msg.destinationName === "parking/available") {
        const count = parseInt(msg.payloadString);
        document.getElementById("free-count").innerText = count;
        
        const badge = document.getElementById("parking-availability");
        if (count > 0) {
            badge.innerHTML = '<span class="dot" style="background:#34C759"></span> CÒN CHỖ TRỐNG';
            badge.style.color = "#34C759";
        } else {
            badge.innerHTML = '<span class="dot" style="background:#FF3B30"></span> ĐÃ HẾT CHỖ';
            badge.style.color = "#FF3B30";
        }
    }
};

client.connect({ onSuccess: () => {
    client.subscribe("parking/available");
}});