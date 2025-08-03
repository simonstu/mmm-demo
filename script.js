const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ----- Static history chart -----
const historySpend = {
  Search: [4000, 3800, 4200, 4500, 5000, 4800, 4700, 4600, 4400, 4300, 4100, 4000],
  Social: [3000, 2800, 3000, 3200, 3300, 3400, 3500, 3600, 3500, 3400, 3300, 3200],
  Email:  [1000, 1200, 1100, 1000, 1300, 1200, 1100, 1000, 1200, 1100, 1000, 900]
};
const historyRevenue = [20000, 21000, 22000, 23000, 24000, 23500, 24500, 25000, 25500, 26000, 26500, 27000];

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
const roi = { Search: 4, Social: 3, Email: 2 };

const planSpend = {
  Search: Array(12).fill(3000),
  Social: Array(12).fill(2000),
  Email: Array(12).fill(1000)
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
          const chart = e.chart;
          const datasets = chart.data.datasets;

          // Per-month cap
          let otherMonth = 0;
          datasets.forEach((ds, idx) => {
            if (idx !== datasetIndex && idx !== 3) {
              otherMonth += ds.data[index];
            }
          });
          let newValue = Math.max(0, Math.min(value, maxPerMonth - otherMonth));

          // Total budget cap
          let otherTotal = 0;
          datasets.forEach((ds, idx) => {
            if (idx === 3) return;
            ds.data.forEach((v, i) => {
              if (idx === datasetIndex && i === index) return;
              otherTotal += v;
            });
          });
          const remainingTotal = Math.max(0, totalBudget - otherTotal);
          newValue = Math.min(newValue, remainingTotal);

          datasets[datasetIndex].data[index] = newValue;
          updatePredictions();
          chart.update();
          return newValue;
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
  for (let i = 0; i < months.length; i++) {
    const search = datasets[0].data[i] * roi.Search;
    const social = datasets[1].data[i] * roi.Social;
    const email = datasets[2].data[i] * roi.Email;
    predictions[i] = baseSales + search + social + email;
  }
  datasets[3].data = predictions;
}

updatePredictions();
