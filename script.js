const BROKER = "broker.emqx.io";
const PORT = 8083;
const CLIENT_ID = "mob_park_" + Math.random().toString(16).substr(2, 4);

const client = new Paho.MQTT.Client(BROKER, PORT, CLIENT_ID);

client.onConnectionLost = () => {
    document.getElementById("status-dot").className = "status-dot offline";
    setTimeout(startConnect, 3000);
};

client.onMessageArrived = (msg) => {
    if (msg.destinationName === "parking/slots/state") {
        renderSlots(msg.payloadString);
    }
};

function startConnect() {
    client.connect({
        onSuccess: () => {
            document.getElementById("status-dot").className = "status-dot online";
            client.subscribe("parking/slots/state");
        },
        useSSL: false
    });
}

function renderSlots(state) {
    // state ví dụ: "000" là đầy, "111" là trống hết
    let occupiedCount = 0;
    
    for (let i = 0; i < state.length; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        const isAvailable = state[i] === "1";
        
        if (isAvailable) {
            slotEl.className = "slot-item available";
            slotEl.querySelector(".slot-status").innerText = "Chỗ trống";
        } else {
            slotEl.className = "slot-item occupied";
            slotEl.querySelector(".slot-status").innerText = "Đã có xe";
            occupiedCount++;
        }
    }

    // Kiểm tra nếu đầy cả 3 slot (state.length = 3)
    const notice = document.getElementById("full-notice");
    if (occupiedCount === state.length) {
        notice.style.display = "flex";
    } else {
        notice.style.display = "none";
    }
}

startConnect();