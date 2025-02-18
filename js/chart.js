import { app, getDatabase, ref, onValue, set, push, db, query, collection, where, get, getDocs } from "./firebaseConfig.js";

// Initialize Realtime Database
const realTimedb = getDatabase(app);

// Define paths with userID
const userDevicesPath = `UserID/${loggedInUserId}/Devices`;
const analyticsPath = `UserID/${loggedInUserId}/Analytics`;
const alerts = `UserID/${loggedInUserId}/Alerts`;

const humidityRef = ref(realTimedb, `${userDevicesPath}/DHT/Humidity`);
const temperatureRef = ref(realTimedb, `${userDevicesPath}/DHT/Temperature`);
const selectedYearIncomeExpense = document.getElementById('selectedYearIncomeExpense');

const dates = Array(7).fill(null); // Initialize with 7 null entries (one for each day)
const humidityData = Array(7).fill(null); // Ensure alignment
const temperatureData = Array(7).fill(null);

let humiTime = "";
let tempTime = "";
let highestHumidity = 0;
let highestTemperature = 0;

let temperatureLevel = "31°C";

let lastNotificationTime = 0; // Store the timestamp of the last notification
const NOTIFICATION_COOLDOWN = 30000; // Cooldown time in milliseconds (e.g., 1 minute)

// Initialize charts globally
let humidityChart;
let temperatureChart;
let environmentalChart;

let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let todayDate = dateFormatter(new Date());
let getDayofDate = getDayOfDate(todayDate);

// Reorder the days array function
function reorderDays() {
    const today = new Date().getDay(); // Get the current day index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const reorderedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)]; // Reorder array
    return reorderedDays;
}

function getDayOfDate(dateString) {
    const date = new Date(dateString); // Create a Date object from the input string 
    return days[date.getDay()]; // Get the day index and retrieve the corresponding day name
}

function getTimeIn12HourFormat() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strSeconds = seconds < 10 ? '0' + seconds : seconds;

    return `${hours}:${strMinutes}:${strSeconds} ${ampm}`;
}

// Insert Unique path
days.forEach(day => {
    const refPath = ref(realTimedb, analyticsPath + "/DailyStats/" + day);
    const refHumiPath = ref(realTimedb, analyticsPath + "/DailyStats/" + day + "/humidity");
    const refTempPath = ref(realTimedb, analyticsPath + "/DailyStats/" + day + "/temperature");

    // Check if the data for the day exists
    get(refPath).then(snapshot => {
        if (!snapshot.exists()) {
            // If data does not exist, add it
            set(refPath, {
                date: "",
            })

            // set(refHumiPath, {
            //     value: 0,
            //     time: "",
            // })

            set(refTempPath, {
                value: 0,
                time: "",
            })

        } else {
            // console.log(`Data for ${day} already exists. Skipping.`);
        }
    }).catch(error => {
        console.error(`Error checking data for ${day}:`, error);
    });
});

// Fetch data from Firebase and update charts
function updateCharts() {
    // onValue(humidityRef, (snapshot) => {
    //     const humidity = snapshot.val();
    //     if (humidityChart) {
    //         humidityChart.series[0].setData([humidity !== null ? humidity : 0]); // Update chart with new data
    //     }

    //     if (humidity !== null) {
    //         if (humidity > highestHumidity) {
    //             highestHumidity = humidity;
    //             humiTime = getTimeIn12HourFormat();
    //             environmentalConditions();
    //         }
    //     }
    // });

    // onValue(temperatureRef, (snapshot) => {
    //     const temperature = snapshot.val();
    //     if (temperatureChart) {
    //         temperatureChart.series[0].setData([temperature !== null ? temperature : 0]); // Update chart with new data
    //     }

    //     if (temperature !== null) {

    //         // Check if the current temperature exceeds the threshold
    //         if (temperature > 31) {
    //             // Trigger a push notification or email warning
    //             sendNotificationOrEmail(temperature);
    //         }

    //         if (temperature > highestTemperature) {
    //             highestTemperature = temperature;
    //             tempTime = getTimeIn12HourFormat();
    //             environmentalConditions();
    //             environmentalChartFunction();
    //         }
    //     }
    // });

    onValue(temperatureRef, (snapshot) => {
        const temperature = snapshot.val();

        if (temperatureChart) {
            temperatureChart.series[0].setData([temperature !== null ? temperature : 0]); // Update chart with new data
        }

        if (temperature !== null) {

            // Check if the current temperature exceeds the threshold
            if (temperature > 31) {
                const now = Date.now(); // Current timestamp
                if (now - lastNotificationTime >= NOTIFICATION_COOLDOWN) {
                    // If cooldown period has passed, send notification
                    lastNotificationTime = now;
                    pushNotification(temperature);
                } else {
                    // console.log(`Notification blocked: Cooldown active. Try again in ${(NOTIFICATION_COOLDOWN - (now - lastNotificationTime)) / 1000}s.`);
                }
            }

            // Check the last stored temperature
            const refTempValue = ref(realTimedb, analyticsPath + "/DailyStats/" + getDayofDate + "/temperature/value");
            get(refTempValue).then(snapshot => {
                const storedTemperature = snapshot.exists() ? snapshot.val() : null;
                if (temperature > storedTemperature) {
                    // Update the highest temperature in Firebase
                    highestTemperature = temperature;
                    tempTime = getTimeIn12HourFormat();
                    environmentalConditions();
                    environmentalChartFunction();

                    set(temperatureRef, 0);
                } else {
                    // console.log(`Temperature (${temperature}°C) is not higher than the stored value (${storedTemperature}°C).`);
                }
            }).catch(error => {
                console.error(`Error checking data for ${getDayofDate}:`, error);
            });
        }

    });

};

function pushNotification(temperature) {
    if (!("Notification" in window)) {
        console.error("This browser does not support notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        showNotification(temperature);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showNotification(temperature);
            } else {
                console.warn("User denied notification permission.");
            }
        });
    } else {
        console.warn("Notifications blocked. Manually enable them in browser settings.");
    }
}

function showNotification(temperature) {
    const notification = new Notification("Pigkeeper System: Temperature Alert", {
        body: `Warning: The temperature has exceeded ${temperatureLevel}. Current temperature is ${temperature}°C.`,
        icon: "path/to/icon.png",
    });

    // Auto-close notification after 5 seconds (optional)
    setTimeout(notification.close.bind(notification), 30000);

    // Handle click event
    notification.onclick = () => {
        console.log("Notification clicked!");
    };
}

function environmentalConditions() {
    const dayRef = ref(realTimedb, analyticsPath + "/DailyStats/" + getDayofDate);
    const refHumiPath = ref(realTimedb, analyticsPath + "/DailyStats/" + getDayofDate + "/humidity");
    const refTempPath = ref(realTimedb, analyticsPath + "/DailyStats/" + getDayofDate + "/temperature");

    set(dayRef, { date: todayDate })
        .then(() => {
            // Initialize humidity and temperature paths only after the date is set
            return Promise.all([
                // set(refHumiPath, { value: highestHumidity, time: humiTime }),
                set(refTempPath, { value: highestTemperature, time: tempTime }),
            ]);
        })
        .then(() => {
            console.log("All data initialized for current day");
        })
        .catch((error) => console.error("Error initializing data:", error));
}

function environmentalChartFunction() {
    // days = reorderDays();
    days.forEach((day, index) => {
        // Fetch date
        const refPath = ref(realTimedb, `${analyticsPath}/DailyStats/${day}/date`);
        onValue(refPath, (snapshot) => {
            const date = snapshot.val();
            dates[index] = day;
            if (date) {
                // // Fetch temperature
                const refTempPath = ref(realTimedb, `${analyticsPath}/DailyStats/${day}/temperature/value`);
                const refTempTimePath = ref(realTimedb, `${analyticsPath}/DailyStats/${day}/temperature/time`);
                onValue(refTempPath, (snapshot) => {
                    const temperature = snapshot.val();
                    if (temperature !== null) {
                        // Store the temperature value in a temporary variable
                        const temperatureValue = temperature;
                        // Fetch the corresponding time
                        onValue(refTempTimePath, (timeSnapshot) => {
                            const temperatureTime = timeSnapshot.val();
                            if (temperatureTime !== null) {
                                // Store both value and time in the chart's data series
                                temperatureData[index] = { y: temperatureValue, time: temperatureTime, day: date };

                                // Update the temperature series in the chart
                                if (environmentalChart.series.length > 1) {
                                    environmentalChart.series[1].setData(temperatureData); // Update chart data
                                }
                            }
                        });
                    }
                });
            }
        });

        // Fetch humidity
        // const refHumiPath = ref(realTimedb, `${analyticsPath}/DailyStats/${day}/humidity/value`);
        // const refHumiTimePath = ref(realTimedb, `${analyticsPath}/DailyStats/${day}/humidity/time`);
        // onValue(refHumiPath, (snapshot) => {
        //     const humidity = snapshot.val();
        //     if (humidity !== null) {
        //         // Store the humidity value in a temporary variable
        //         const humidityValue = humidity;

        //         // Fetch the corresponding time
        //         onValue(refHumiTimePath, (timeSnapshot) => {
        //             const humidityTime = timeSnapshot.val();
        //             if (humidityTime !== null) {
        //                 // Store both value and time in the chart's data series
        //                 humidityData[index] = { y: humidityValue, time: humidityTime };

        //                 // Update the humidity series in the chart
        //                 if (environmentalChart) {
        //                     environmentalChart.series[0].setData(humidityData); // Update chart data
        //                 }
        //             }
        //         });
        //     }
        // });
    });
}

// Initialize Humidity Chart
humidityChart = Highcharts.chart('humidityChart', {
    chart: {
        type: 'solidgauge',
        margin: [0, 0, 0, 0],
        backgroundColor: 'transparent'
    },
    title: null,
    yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickWidth: 0,
        // tickPositions: [0, 100],
        tickmarkPlacement: 'between',
        minorTickLength: 0,
        // labels: {
        //     enabled: true,
        //     x: 0,
        //     y: 25,
        //     style: {
        //         color: '#999',
        //     }
        // },
    },
    pane: {
        size: '100%',
        center: ['50%', '50%'],
        startAngle: 0,
        endAngle: 360,
        background: {
            borderWidth: 20,
            backgroundColor: '#EAEAFD',
            shape: 'arc',
            borderColor: '#EAEAFD',
            outerRadius: '90%',
            innerRadius: '90%'
        }
    },
    // pane: {
    //     size: '150%',
    //     center: ['50%', '80%'],
    //     startAngle: -90,
    //     endAngle: 90,
    //     background: {
    //         borderWidth: 20,
    //         backgroundColor: '#EAEAFD',
    //         shape: 'arc',
    //         borderColor: '#EAEAFD',
    //         outerRadius: '90%',
    //         innerRadius: '90%'
    //     }
    // },
    tooltip: {
        enabled: false
    },
    plotOptions: {
        solidgauge: {
            borderColor: '#0CC0DF',
            borderWidth: 15,
            radius: 90,
            innerRadius: '90%',
            dataLabels: {
                y: -25,
                borderWidth: 0,
                useHTML: true
            }
        }
    },
    series: [{
        name: 'Humidity',
        data: [0], // Initial data placeholder
        dataLabels: {
            format: '<div style="text-align:center;"><span style="font-size:24px;color:#0CC0DF;">{y}%</span> <br/> <span style="font-weight:bold;color:#999">Current Humidity</span></div>'
        }
    }],
    credits: {
        enabled: false
    },
});

// Initialize Temperature Chart
temperatureChart = Highcharts.chart('temperatureChart', {
    chart: {
        type: 'solidgauge',
        margin: [0, 0, 0, 0],
        backgroundColor: 'transparent'
    },
    title: null,
    yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickWidth: 0,
        // tickPositions: [0, 100],
        tickmarkPlacement: 'between',
        minorTickLength: 0,
        // labels: {
        //     enabled: true,
        //     x: 0,
        //     y: 25,
        //     style: {
        //         color: '#999',
        //     }
        // },
    },
    pane: {
        size: '100%',
        center: ['50%', '50%'],
        startAngle: 0,
        endAngle: 360,
        background: {
            borderWidth: 20,
            backgroundColor: '#EAEAFD',
            shape: 'arc',
            borderColor: '#EAEAFD',
            outerRadius: '90%',
            innerRadius: '90%'
        }
    },
    tooltip: {
        enabled: false
    },
    plotOptions: {
        solidgauge: {
            borderColor: '#FF5757',
            borderWidth: 15,
            radius: 90,
            innerRadius: '90%',
            dataLabels: {
                y: -25,
                borderWidth: 0,
                useHTML: true
            }
        }
    },
    series: [{
        name: 'Temperature',
        data: [0], // Initial data placeholder
        dataLabels: {
            format: '<div style="text-align:center;"><span style="font-size:24px;color:#FF5757;">{y}°C</span> <br/> <span style="font-weight:bold;color:#999">Current Temperature</span></div>'
        }
    }],
    credits: {
        enabled: false
    },
});

// Initialize Highcharts
environmentalChart = Highcharts.chart('environmentalChart', {
    chart: {
        type: 'column',
        spacingLeft: 50, // Increase left spacing
        // marginLeft: 30, // Adjust left margin
        animation: {
            duration: 800,
            easing: 'easeOutBounce',
        },
    },
    title: {
        text: "Temperature Data Over 7 Days",
        // align: 'left', // Align the title to the left
        y: 30,
        // x: 40, // Optional: Adjust horizontal offset if needed
        style: {
            fontSize: '16px',
            color: '#444',
            fontWeight: 'bold',
        },
    },
    xAxis: {
        categories: dates, // Initially empty
        crosshair: true,
        labels: {
            style: {
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#666',
            },
        },
        lineColor: '#ccc',
        lineWidth: 1,
    },
    yAxis: {
        // softMin: Math.min(...temperatureData), // Slightly lower than the min value
        // softMax: Math.max(...temperatureData) + 2, // Slightly higher than the max value 
        allowDecimals: false,
        title: { text: null },
        gridLineColor: '#f0f0f0',
        labels: {
            style: {
                fontSize: '16px',
                color: '#666',
            },
        },
    },
    credits: {
        enabled: false,
    },
    legend: {
        enabled: false,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        itemStyle: {
            fontSize: '16px',
            fontWeight: 'normal',
            color: '#444',
        },
    },
    plotOptions: {
        column: {
            borderRadius: 20, // Rounded corners for bars
            dataLabels: {
                enabled: true, // Show values on bars
                format: '{y}', // Display the value
                style: {
                    fontWeight: 'bold',
                    color: '#444', // Ensure readability
                },
            },
        },
    },
    tooltip: {
        formatter: function () {
            const seriesName = this.series.name; // 'Humidity' or 'Temperature'
            const value = this.y; // Value (e.g., 50 or 30)
            const time = this.point.time; // Corresponding time
            const day = this.point.day; // Corresponding day

            // Add units based on series name
            const unit = seriesName === 'Humidity' ? '%' : '°C';

            return `<b>Date: </b>${day} <br><b>Time:</b> ${time}<br><b>${seriesName}:</b> ${value}${unit}<br>`;
        },
    },
    series: [
        {
            name: 'Humidity',
            data: humidityData, // Initially empty
            color: '#0CC0DF',
            visible: false,
            dataLabels: {
                enabled: true,
                format: '{y}%',
                style: {
                    fontWeight: 'normal',
                    fontSize: '16px',
                    color: '#444', // Ensure readability
                },
            }
        },
        {
            name: 'Temperature',
            data: temperatureData, // Initially empty
            color: '#FF5757',
            dataLabels: {
                enabled: true,
                format: '{y}°C',
                style: {
                    fontWeight: 'normal',
                    fontSize: '16px',
                    color: '#444', // Ensure readability
                },
            }
        },
    ],
});

// Initialize 
environmentalChartFunction();
updateCharts();
setInterval(updateCharts, 1000);

