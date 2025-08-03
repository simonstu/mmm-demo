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

function calcPredictions() {
  return months.map((_, i) =>
    baseSales +
    planSpend.Search[i] * roi.Search +
    planSpend.Social[i] * roi.Social +
    planSpend.Email[i] * roi.Email
  );
}

function enforceCaps(channel, month, value) {
  let otherMonth = 0;
  Object.keys(planSpend).forEach(key => {
    if (key !== channel) otherMonth += planSpend[key][month];
  });
  let capped = Math.max(0, Math.min(value, maxPerMonth - otherMonth));

  let otherTotal = 0;
  Object.keys(planSpend).forEach(key => {
    planSpend[key].forEach((v, idx) => {
      if (key === channel && idx === month) return;
      otherTotal += v;
    });
  });
  const remaining = totalBudget - otherTotal;
  return Math.min(capped, Math.max(0, remaining));
}

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
        data: calcPredictions(),
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
        onDrag: function(e, datasetIndex, index, value) {
          const channel = e.chart.data.datasets[datasetIndex].label;
          const newValue = enforceCaps(channel, index, value);
          planSpend[channel][index] = newValue;
          e.chart.data.datasets[3].data = calcPredictions();
          e.chart.update();
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

