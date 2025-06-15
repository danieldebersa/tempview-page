import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSuCyHJIFXdCz3z7vfBzcgVEuAj1U02WA",
    authDomain: "esp32dht-database-97559.firebaseapp.com",
    databaseURL: "https://esp32dht-database-97559-default-rtdb.firebaseio.com",
    projectId: "esp32dht-database-97559",
    storageBucket: "esp32dht-database-97559.firebasestorage.app",
    messagingSenderId: "524944334915",
    appId: "1:524944334915:web:1251d6d75957741144b4f6",
    measurementId: "G-P2R34GJF40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

let lastUpdateTime = Date.now();
let timeoutCheck;
let alertShown = false;
let wasDisconnected = false;

// Función para calcular la sensación térmica
function calculateHeatIndex(temp, hum) {
    let t = parseFloat(temp);
    let h = parseFloat(hum);
    let hi = 0.5 * (t + 61.0 + ((t-68.0)*1.2) + (h*0.094));
    return ((hi - 32) * 5/9).toFixed(1);
}

// Referencias a la base de datos
const humidityRef = ref(database, 'DHT_11/Humidity');
const temperatureRef = ref(database, 'DHT_11/Temperature');

// Funciones para manejar alertas
window.showAlert = function() {
    if (!alertShown) {
        document.getElementById('sensorAlert').style.display = 'block';
        alertShown = true;
        wasDisconnected = true;
    }
}

window.dismissAlert = function() {
    document.getElementById('sensorAlert').style.display = 'none';
    alertShown = false;
}

window.showReconnectedAlert = function() {
    document.getElementById('reconnectedAlert').style.display = 'block';
    setTimeout(() => {
        document.getElementById('reconnectedAlert').style.display = 'none';
    }, 3000);
}

window.dismissReconnectedAlert = function() {
    document.getElementById('reconnectedAlert').style.display = 'none';
}

function checkConnection() {
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;
    if (timeSinceLastUpdate > 30000) {
        showAlert();
    }
}

function updateHeatIndex() {
    let temp = document.getElementById('temperature').innerHTML.replace('℃', '');
    let hum = document.getElementById('humidity').innerHTML.replace('%', '');
    if(temp && hum) {
        let hi = calculateHeatIndex(temp, hum);
        document.getElementById('heatIndex').innerHTML = hi + "&#8451;";
    }
}

// Escuchar cambios en tiempo real
onValue(humidityRef, (snapshot) => {
    const humi = snapshot.val();
    document.getElementById('humidity').innerHTML = humi + "%";
    lastUpdateTime = Date.now();
    if (wasDisconnected) {
        dismissAlert();
        showReconnectedAlert();
        wasDisconnected = false;
    }
    updateHeatIndex();
});

onValue(temperatureRef, (snapshot) => {
    const temp = snapshot.val();
    document.getElementById('temperature').innerHTML = temp + "&#8451;";
    lastUpdateTime = Date.now();
    if (wasDisconnected) {
        dismissAlert();
        showReconnectedAlert();
        wasDisconnected = false;
    }
    updateHeatIndex();
});

// Iniciar verificación periódica
setInterval(checkConnection, 5000);
