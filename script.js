const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ----- Static history chart -----
const historySpend = {
  Search: [4000, 3800, 4200, 4500, 0, 0, 1500, 2000, 2500, 2000, 5000, 4000],
  Social: [500, 500, 1000, 1000, 3000, 3000, 3500, 3600, 3500, 3400, 3300, 3200],
  Email:  [1000, 1200, 1100, 1000, 3000, 3000, 0, 0, 2000, 3000, 2000, 2000]
};
const historyRevenue = [20000, 21000, 18200, 23000, 24000, 16500, 17500, 22000, 25500, 26000, 26500, 27000];

new Chart(document.getElementById('historyChart'), {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      {
        label: 'Search',
        data: historySpend.Search,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78,121,167,0.4)',
        fill: true,
        stack: 'spend'
      },
      {
        label: 'Social',
        data: historySpend.Social,
        borderColor: '#f28e2b',
        backgroundColor: 'rgba(242,142,43,0.4)',
        fill: true,
        stack: 'spend'
      },
      {
        label: 'Email',
        data: historySpend.Email,
        borderColor: '#e15759',
        backgroundColor: 'rgba(225,87,89,0.4)',
        fill: true,
        stack: 'spend'
      },
      {
        label: 'Revenue',
        data: historyRevenue,
        borderColor: '#76b7b2',
        fill: false,
        stack: 'revenue'
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  }
});

// ----- Interactive plan chart -----
const totalBudget = 100000;
const maxPerMonth = 20000;
const baseSales = 5000;
const salesFactor = 2;

const planSpend = {
  Search: Array(12).fill(2000),
  Social: Array(12).fill(1500),
  Email: Array(12).fill(500)
};

const salesFactors = {
  Search: 2,
  Social: 1.5,
  Email: 1.2
};

const planChart = new Chart(document.getElementById('planChart'), {
  type: 'line',
  data: {
    labels: months,
    datasets: [
      {
        label: 'Search',
        data: planSpend.Search,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78,121,167,0.4)',
        fill: true,
        stack: 'spend',
        dragData: true
      },
      {
        label: 'Social',
        data: planSpend.Social,
        borderColor: '#f28e2b',
        backgroundColor: 'rgba(242,142,43,0.4)',
        fill: true,
        stack: 'spend',
        dragData: true
      },
      {
        label: 'Email',
        data: planSpend.Email,
        borderColor: '#e15759',
        backgroundColor: 'rgba(225,87,89,0.4)',
        fill: true,
        stack: 'spend',
        dragData: true
      },
      {
        label: 'Predicted Sales',
        data: [],
        borderColor: '#59a14f',
        fill: false,
        stack: 'revenue'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      dragData: {
        round: 0,
        onDragEnd: function(e, datasetIndex, index, value) {
          if (datasetIndex === 3) return; // skip predictions
          const chart = planChart;
          const datasets = chart.data.datasets;
          // Per-month cap
          let otherMonth = 0;
          datasets.forEach((ds, idx) => {
            if (idx !== datasetIndex && idx !== 3) {
              otherMonth += ds.data[index];
            }
          });
          let newValue = Math.min(Math.max(value, 0), maxPerMonth - otherMonth);
          // Total budget cap
          let otherTotal = 0;
          datasets.forEach((ds, idx) => {
            if (idx === 3) return;
            ds.data.forEach((v, i) => {
              if (idx === datasetIndex && i === index) return;
              otherTotal += v;
            });
          });
          newValue = Math.min(newValue, totalBudget - otherTotal);
          datasets[datasetIndex].data[index] = newValue;
          updatePredictions();
          chart.update();
        }
      }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  }
});

function updatePredictions() {
  const datasets = planChart.data.datasets;
  const predictions = [];
  totalSpendings = 0;
  predictedSales = 0;
  for (let i = 0; i < months.length; i++) {
    totalSpendings = totalSpendings + datasets[0].data[i] + datasets[1].data[i] + datasets[2].data[i]
  }
  for (let i = 0; i < months.length; i++) {
    const spend = (datasets[0].data[i] * salesFactors.Search) 
      + (datasets[1].data[i] * salesFactors.Social )
      + (datasets[2].data[i] * salesFactors.Email);
    predictions[i] = baseSales + spend;
  }
  for (let i = 0; i < months.length; i++) {
    predictedSales = predictedSales + predictions[i]
  }
  datasets[3].data = predictions;
  document.getElementById('totalMarketingSpending').textContent=totalSpendings;
  document.getElementById('predictedSales').textContent=predictedSales;
}

updatePredictions();
planChart.update();
