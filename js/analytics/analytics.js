import { db, collection, getDocs, setDoc, doc, updateRecord, query, where } from '../firebaseConfig.js';

const analyticsData = document.getElementById('analyticsData');
const templateAnalytics = document.getElementById('templateAnalytics');
const filterByPigIDContainer = document.getElementById('filterByPigIDContainer');
const filterByPigID = document.getElementById('filterByPigID');

// Store entries before inserting into the DOM 

const netIncomeDataSet = [];
const netIncomeLabel = [];

filterByPigID.addEventListener('change', () => {
    const selectedPigID = filterByPigID.value;
    const analyticsTemplates = document.querySelectorAll('[id^="analytics-pig-"]'); // Select all templates

    if (selectedPigID === 'All') {
        // Show all templates
        analyticsTemplates.forEach(template => {
            template.style.display = ''; // Show all
        });
        return; // Exit the function early
    }

    analyticsTemplates.forEach(template => {
        const pigID = template.id.replace('analytics-pig-', ''); // Extract the pigID from the ID
        if (pigID.includes(selectedPigID)) {
            template.style.display = ''; // Show the template
        } else {
            template.style.display = 'none'; // Hide the template
        }
    });
})

export async function fetchPigsData() {
    try {
        // 🔹 Fetch both queries in parallel using Promise.all()
        const [pigQuerySnapshot, pigSowQuerySnapshot] = await Promise.all([
            getDocs(query(
                collection(db, "Piglets"),
                where("status", "==", "Inactive"),
                where("loggedInUserId", "==", loggedInUserId)
            )),
            getDocs(query(
                collection(db, "Pigsow"),
                where("status", "==", "Inactive"),
                where("loggedInUserId", "==", loggedInUserId)
            ))
        ]);

        const combinedData = []; // ✅ Store all fetched data

        // 🔹 Process Piglets Collection
        if (!pigQuerySnapshot.empty) {
            pigQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                combinedData.push({
                    id: data.pigID,
                    details: data,
                    name: data.pigCategory + " - " + data.batch,
                    count: data.numberOfPig,
                    date: data.dateInactive || "" // Add a date field for sorting (optional)
                });
            });
        }

        // 🔹 Process Pigsow Collection
        if (!pigSowQuerySnapshot.empty) {
            pigSowQuerySnapshot.forEach((doc) => {
                const data = doc.data();
                combinedData.push({
                    id: data.pigsowID,
                    details: data,
                    name: data.sowName,
                    count: 1,
                    date: data.dateInactive || "" // Add a date field for sorting (optional)
                });
            });
        }

        // 🔹 Optional: Sort by `dateInactive` (newest first)
        combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 🔹 Process Combined Data
        combinedData.forEach((pig) => {
            fetchAnalyticsData(pig.id, pig.details, pig.name, pig.count);
        });

    } catch (error) {
        console.error("Error fetching pig data:", error);
    }
}

async function fetchAnalyticsData(pigID, pidData, pigName, numberOfPig = 0) {

    filterByPigIDContainer.classList.remove("d-none");
    filterByPigID.innerHTML = '';
    const filterAll = document.createElement('option');
    filterAll.text = 'All';
    filterAll.value = 'All';
    filterAll.selected = true;
    filterByPigID.add(filterAll);

    templateAnalytics.classList.add("d-none");

    let totalExpense = 0;
    let dateFinance = '';
    let notesSold = '';
    let notesDeceased = '';

    let soldPigsow = 0;
    let numberofPigSold = 0;
    let numberOfPigDeceased = 0;

    const dataSet = [];
    let dateSold = '';
    let pigNameSold = '';
    let pigOrigin = '';

    const querySnapshotPigletsRecords = await getDocs(query(
        collection(db, "PigletsRecords"),
        where("pigID", "==", pigID),
        where("loggedInUserId", "==", loggedInUserId)
    ));

    if (!querySnapshotPigletsRecords.empty) {
        querySnapshotPigletsRecords.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'Sold') {
                numberofPigSold = data.numberOfPig || 0;
                notesSold += data.notes.length > 0 ? `${data.notes}, ` : ' ';
            } else {
                numberOfPigDeceased = data.numberOfPig || 0;
                notesDeceased += data.notes.length > 0 ? `${data.notes}, ` : ' ';
            }

        });
    }

    const querySnapshot = await getDocs(query(
        collection(db, "FinancialRecord"),
        where("loggedInUserId", "==", loggedInUserId)
    ));

    if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
            const data = doc.data();

            if (data.itemName === 'Sold Pigsow') {
                soldPigsow = data.qty || 0;
            }

            if (data.pigId === pigID && data.type === 'Expense' && data.status === 'Completed' && pigID.includes('SOW')) {
                dateSold = dateFormatter(data.dateFinance);
                pigOrigin = '';
            } else {
                if (data.pigId === pigID && data.type === "Expense") {
                    const qty = extractNumber(data.qty || 0); // Ensure default 0 if null
                    const price = extractNumber(data.price || 0);
                    const total = qty * price;
                    totalExpense += total;

                    dataSet.push({
                        date: dateFinance.date,
                        name: data.itemName || 'N/A',
                        quantity: data.qty || 0,
                        price: data.price || 0,
                        total: total || 0,
                    });
                }
            }

            if (data.pigId === pigID && data.type === 'Income' && pigID.includes('SOW')) {
                dateSold = dateFormatter(data.dateFinance);
                pigOrigin = '';
            }

        });
    }

    // 🔹 Get additional expenses from ListOfPigsowExpenses
    const ListOfPigsowExpensesQuery = await getDocs(query(
        collection(db, "ListOfPigsowExpenses"),
        where("pigID", "==", pigID),
        where("loggedInUserId", "==", loggedInUserId)
    ));

    if (!ListOfPigsowExpensesQuery.empty) {
        for (const doc of ListOfPigsowExpensesQuery.docs) { // ✅ Use for...of
            const expenseData = doc.data();

            if (Array.isArray(expenseData.dataSet)) {
                expenseData.dataSet.forEach((item) => {
                    const total = extractNumber(item.quantity || 0) * extractNumber(item.price || 0);
                    totalExpense += total;
                    dataSet.push({
                        date: expenseData.date,
                        origin: expenseData.origin,
                        name: item.name || 'N/A',
                        quantity: item.quantity || 0,
                        price: item.price || 0,
                        total: total || 0,
                    });
                });
            }
        }
    }

    // 🔹 Get additional expenses from ListOfPigsowExpenses
    const getTheDataOfPigSold = await getDocs(query(
        collection(db, "ListOfPigsowExpenses"),
        where("pigID", "==", pigID),
        where("loggedInUserId", "==", loggedInUserId)
    ));

    if (!getTheDataOfPigSold.empty) {
        getTheDataOfPigSold.forEach((doc) => {
            const innerData = doc.data();
            dateSold = innerData.date;
            pigNameSold = innerData.pigName;
            pigOrigin = innerData.origin;
        });
    }

    document.getElementById('netProfitChart').classList.remove('d-none');
    document.getElementById('chartSkeleton').classList.add('d-none');

    // Combine the notes
    let notes = `<br>Sold Notes: ${notesSold.trim().slice(0, -1)}\n<br>Deceased Notes: ${notesDeceased.trim().slice(0, -1)}`;

    const grossIncome = await getTotalIncome(pigID); // Example value, replace with actual data
    const netIncome = grossIncome - totalExpense;

    // Add the filled template to the DOM only if it doesn't already exist
    if (!document.querySelector(`#analytics-pig-${pigID}`)) {

        const option = document.createElement('option');
        if (pidData.origin) {
            option.text = 'Origin: ' + pidData.origin + ' -> ' + pigName;
            option.value = pigID;
            filterByPigID.add(option);

        } else {
            option.text = pigName;
            option.value = pigID;
            filterByPigID.add(option);
        }

        const temp = {
            pigID: pigID,
            pigName: pigName,
            pigOrigin: pigOrigin,
            pigBirth: pidData.dateOfBirth || pidData.sowBirth,
            pigDays: pidData.daysInactive,
            date: dateSold, // Dec 25, 2024
            pigNameSold: pigNameSold,
            numberOfPig: numberOfPig,
            numberofPigSold: numberofPigSold || soldPigsow,
            numberOfPigDeceased: numberOfPigDeceased,
            notes: notes,
            dataSet: dataSet,
            grossIncome: grossIncome,
            totalExpense: totalExpense,
            netIncome: netIncome,
        };

        analyticsData.insertAdjacentHTML('afterbegin', template(temp));
        loadChart();
    }

}

function template(data) {
    const processedOrigins = new Set(); // Track unique origins 
    let originPig = data.pigOrigin || '';

    const keywords = {
        "Piglets": "bg-success-subtle",
        "Letchon": "bg-danger-subtle",
        "Fattening": "bg-primary-subtle"
    };

    const className = Object.keys(keywords).find(key => data.pigName.includes(key))
        ? keywords[Object.keys(keywords).find(key => data.pigName.includes(key))]
        : "bg-secondary-subtle";

    const rows = data.dataSet.map(row => {
        let headerRow = "";
        if (row.origin && !processedOrigins.has(row.origin)) {
            processedOrigins.add(row.origin);
            originPig = row.origin;
            headerRow = `<tr><td colspan="8" class="${className}">
                            <h6 class="text-dark m-0">Expenses Breakdown for Pigsow: ${row.origin}</h6>
                         </td></tr>`;
        }

        return `${headerRow}
            <tr>
                <td colspan="4">${row.name}</td>
                <td class="text-center">${row.quantity}</td>
                <td class="text-center">${row.price}</td>
                <td class="text-center" colspan="2">${row.total}</td>
            </tr>`;
    }).join('');

    if (data.netIncome) {
        netIncomeDataSet.push(data.netIncome);
        netIncomeLabel.push(`${data.pigOrigin ? `${data.date}<br>Origin: ${data.pigOrigin}<br>` : `${data.date}<br>`}${data.pigName} <br>`);
    }

    return `
        <div class="card ${className} p-2 w-100 mt-3" id="analytics-pig-${data.pigID}">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <tbody>
                        <tr>
                            <td colspan="6" class="${className}">
                                <h2 class="text-dark text-uppercase m-0"><span>${data.pigName || data.pigNameSold}</span></h2>
                            </td>
                            <td colspan="2" class="${className}">
                                <h2 class="text-dark text-uppercase m-0 text-end">${data.date}</h2>
                            </td>
                        </tr>
                        <tr><td colspan="8"><p class="text-dark m-0"><b>Additional Notes:</b> ${data.notes}</p></td></tr>
                        <tr>
                            <td class="${className} text-center"><b>Pig ID</b></td>
                            <td class="${className} ${originPig ? '' : 'd-none'} text-center"><b>Origin</b></td>
                            <td class="${className} text-center ${originPig ? '' : 'col-2'}"><b>Name</b></td>
                            <td class="${className} text-center"><b>Date of Birth</b></td>
                            <td class="${className} text-center"><b>Days</b></td>
                            <td class="${className} text-center"><b>Number of Pigs</b></td>
                            <td class="${className} text-center"><b>Sold</b></td>
                            <td class="${className} text-center"><b>Deceased</b></td>
                        </tr>
                        <tr>
                            <td class="text-center">${data.pigID}</td>
                            <td class="text-center ${originPig ? '' : 'd-none'}">${originPig}</td>
                            <td class="text-center ${originPig ? '' : 'col-2'}">${data.pigName}</td>
                            <td class="text-center">${dateFormatter(data.pigBirth)}</td>
                            <td class="text-center">${data.pigDays}</td>
                            <td class="text-center">${data.numberOfPig}</td>
                            <td class="text-center">${data.pigID.includes('SOW') && data.numberOfPigDeceased == 1 ? 0 : data.numberofPigSold}</td>
                            <td class="text-center">${data.numberOfPigDeceased}</td>
                        </tr>
                        <tr>
                            <td colspan="8" class="${className} ${data.dataSet.length === 0 ? 'd-none' : ''}">
                                <h6 class="text-dark m-0">Expenses Breakdown:</h6>
                            </td>
                        </tr>
                        <tr class="${data.dataSet.length === 0 ? 'd-none' : ''}">
                            <th colspan="4">Item Name</th>
                            <th class="text-center">Quantity</th>
                            <th class="text-center">Price</th>
                            <th class="text-center" colspan="2">Total</th>
                        </tr>
                        ${rows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="${className}">
                                <h6 class="text-dark m-0">Financial Overview:</h6>
                            </td>
                            <td colspan="1" class="${className}">
                                <h6 class="text-dark m-0 text-center">Grand Total:</h6>
                            </td>
                            <td colspan="2" class="${className}">
                                <h6 class="text-dark m-0 text-center">${data.totalExpense.toLocaleString()} PHP</h6>
                            </td>
                        </tr>
                        <tr>
                            <th colspan="4">Gross Income</th>
                            <th class="text-center" colspan="2">Total Expenses</th>
                            <th class="text-center" colspan="2">Net Income</th>
                        </tr>
                        <tr>
                            <td colspan="4">${data.grossIncome.toLocaleString()} PHP</td>
                            <td class="text-center" colspan="2">${data.totalExpense.toLocaleString()} PHP</td>
                            <td class="text-center" colspan="2">${data.netIncome.toLocaleString()} PHP</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>`;
}

function loadChart() {
    // ✅ Step 1: Group net incomes by sale date
    const groupedData = {};
    const totalNetIncome = {}; // Store total for each date

    netIncomeLabel.forEach((label, index) => {
        const date = label.split("<br>")[0].trim(); // Extract date
        const categoryName = label.split("<br>")[2].trim(); // Extract category name (Piglets, Letchon, etc.)

        if (!groupedData[date]) groupedData[date] = {}; // Create entry if not exists
        if (!groupedData[date][categoryName]) groupedData[date][categoryName] = 0;

        groupedData[date][categoryName] += netIncomeDataSet[index]; // ✅ Sum values per category & date

        if (!totalNetIncome[date]) totalNetIncome[date] = 0;
        totalNetIncome[date] += netIncomeDataSet[index]; // ✅ Compute total net income per date
    });

    // ✅ Step 2: Extract unique dates for the x-axis
    const categories = Object.keys(groupedData);

    // ✅ Step 3: Structure data correctly for Highcharts
    const seriesData = {};
    categories.forEach(date => {
        Object.keys(groupedData[date]).forEach(category => {
            if (!seriesData[category]) seriesData[category] = []; // Initialize array for each category

            // ✅ Hide 0 values by setting them as `null` (which Highcharts ignores)
            categories.forEach(d => {
                seriesData[category].push(d === date && groupedData[date][category] > 0 ? groupedData[date][category] : null);
            });
        });
    });

    const categoryColors = {
        "Piglets": "#66CDAA",   //
        "Letchon": "#CD5C5C",   // 
        "Fattening": "#87CEFA", // 
        "Pigsow": "#C0C0C0"     // 
    };

    // ✅ Step 4: Convert seriesData into Highcharts format
    const series = Object.keys(seriesData).map(category => {
        // Extract only "Piglets", "Letchon", "Fattening", or "Pigsow"
        const mainCategory = Object.keys(categoryColors).find(key => category.includes(key)) || "Default";

        return {
            name: category, // Keep full category name for legend
            data: seriesData[category].map(value => (value === 0 ? null : value)), // Hide 0 values
            color: categoryColors[mainCategory] || "#CCCCCC" // Default to Gray if no match
        };
    });

    // ✅ Step 5: Add "Total Net Income" label at the top of each stacked bar
    const totalIncomeSeries = {
        name: "Net Income",
        type: "scatter", // Use scatter to place text labels
        color: "black", // Text color
        data: categories.map(date => ({
            x: categories.indexOf(date), // Match index of date
            y: totalNetIncome[date], // Place label at the total height
            marker: { enabled: false }, // Hide marker
            dataLabels: {
                enabled: true,
                formatter: function () {
                    return `<b>${this.y.toLocaleString()}</b>`; // Show formatted total
                },
                style: {
                    fontWeight: "bold",
                    color: "black",
                    fontSize: "14px"
                },
                y: -10 // Position label slightly above the bar
            }
        }))
    };

    series.push(totalIncomeSeries); // ✅ Add total income labels

    // ✅ Highcharts Configuration
    Highcharts.chart('netProfitChart', {
        chart: {
            type: 'column',
            animation: { duration: 800, easing: 'easeOutBounce' },
            scrollablePlotArea: { minWidth: 1000, scrollPositionX: 1 }
        },
        title: {
            text: 'Net Income',
            style: { fontSize: '30px', color: '#444', fontWeight: 'bold' },
        },
        xAxis: {
            categories: categories, // ✅ Ensures separate bars per date
            crosshair: true,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#666',
                }
            },
            lineColor: '#ccc',
            lineWidth: 2,
            min: -10,
        },
        yAxis: {
            allowDecimals: false,
            title: { text: null },
            gridLineColor: '#f0f0f0',
            labels: {
                style: {
                    fontSize: '12px',
                    color: '#666',
                },
            },
        },
        credits: { enabled: false },
        legend: {
            enabled: false, // ✅ Show category legends
            align: 'center',
            verticalAlign: 'top',
            layout: 'horizontal',
            itemStyle: { fontSize: '12px', fontWeight: 'normal', color: '#444' },
        },
        tooltip: {
            shared: true, // ✅ Shows stacked category breakdown per date
            useHTML: true,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#ccc',
            borderRadius: 8,
            style: { color: '#333', fontSize: '18px', fontFamily: 'Arial, sans-serif' },
            formatter: function () {
                let dateLabel = categories[this.points[0].point.x]; // ✅ Get actual date instead of index
                let tooltipContent = `<b>${dateLabel}</b><br>`;
                let total = 0; // Track total for the hovered date

                this.points.forEach(point => {
                    if (point.y > 0) { // ✅ Hide zero values
                        tooltipContent += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y.toLocaleString()}</b><br>`;
                        total += point.y; // ✅ Add value to total
                    }
                });

                // ✅ Show total income at the bottom of the tooltip
                tooltipContent += `<hr><b>Net Income: ${total.toLocaleString()}</b>`;

                return tooltipContent;
            }
        },
        plotOptions: {
            column: {
                borderRadius: 5,
                stacking: 'normal', // ✅ Ensures correct stacking per date
                dataLabels: {
                    enabled: true,
                    formatter: function () { return this.y > 0 ? this.y : null; }, // ✅ Hide 0 values in data labels
                    style: { fontWeight: "bold", color: "#444" },
                }
            }
        },
        series: series, // ✅ Uses dynamically generated series data with Total Net Income
    });

    // ✅ Set Scroll to End After Rendering
    setTimeout(() => {
        if (chart.container) {
            chart.container.parentNode.scrollLeft = chart.container.parentNode.scrollWidth;
        }
    }, 500);
}

async function getTotalIncome(pigID) {
    const financeQuery = query(
        collection(db, "FinancialRecord"),
        where("pigId", "==", pigID),
        where("type", "==", "Income"),
        where("loggedInUserId", "==", loggedInUserId)
    );

    const querySnapshot = await getDocs(financeQuery);
    let totalIncome = 0;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const qty = extractNumber(data.qty || 0); // Ensure default 0 if null
        const price = extractNumber(data.price || 0);
        const total = qty * price;
        totalIncome += total;
    });

    return totalIncome || 0;
}

await fetchPigsData();

