const client = new Paho.MQTT.Client("broker.emqx.io", 8083, "web_" + Math.random());

client.onMessageArrived = (msg) => {
    if (msg.destinationName === "parking/slots/state") {
        updateParkingSlots(msg.payloadString);
    } else if (msg.destinationName === "parking/billing") {
        updateHistory(msg.payloadString);
    }
};

function updateParkingSlots(stateString) {
    // stateString ví dụ: "101"
    for (let i = 0; i < stateString.length; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (!slot) continue;
        
        const isAvailable = stateString[i] === "1";
        if (isAvailable) {
            slot.className = "slot-card available";
            slot.querySelector(".label").innerText = "TRỐNG";
        } else {
            slot.className = "slot-card occupied";
            slot.querySelector(".label").innerText = "CÓ XE";
        }
    }
}

function updateHistory(data) {
    const tbody = document.getElementById("history-body");
    const row = tbody.insertRow(0);
    const parts = data.split(" "); // ID:1111 Time:10s Fee:5000
    
    row.insertCell(0).innerText = parts[0].split(":")[1];
    row.insertCell(1).innerText = parts[1].split(":")[1];
    row.insertCell(2).innerHTML = `<b style="color:#38bdf8">${parts[2].split(":")[1]} VNĐ</b>`;
}

// Giữ các hàm connect và publishControl như cũ...
client.connect({ onSuccess: () => {
    document.getElementById("mqtt-status").innerText = "Đã kết nối";
    document.getElementById("mqtt-status").className = "status-on";
    client.subscribe("parking/slots/state");
    client.subscribe("parking/billing");
}});

function publishControl(cmd) {
    const message = new Paho.MQTT.Message(cmd);
    message.destinationName = "parking/control";
    client.send(message);
}