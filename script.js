// Utility functions to generate month labels
function getPastMonths(n) {
  const labels = [];
  const date = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    labels.push(d.toLocaleString('default', { month: 'short' }));
  }
  return labels;
}

function getFutureMonths(n) {
  const labels = [];
  const date = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
    labels.push(d.toLocaleString('default', { month: 'short' }));
  }
  return labels;
}

// ----- Static chart for past 12 months -----
const pastLabels = getPastMonths(12);
const pastSocial = [4000,5000,4500,6000,7000,5000,6500,7000,6000,5500,6000,6500];
const pastSearch = [3000,3500,3200,4000,4500,3800,4200,4600,4300,4100,4400,4800];
const pastDisplay = [2000,2500,2200,3000,2800,2600,2700,2900,2500,2400,2600,3000];
const pastRevenue = pastSocial.map((_,i)=>{
  return (pastSocial[i]+pastSearch[i]+pastDisplay[i]) * 1.8;
});

const historyCtx = document.getElementById('historyChart').getContext('2d');
const historyChart = new Chart(historyCtx, {
  type: 'line',
  data: {
    labels: pastLabels,
    datasets: [
      {label:'Social', data: pastSocial, backgroundColor:'rgba(54,162,235,0.5)', borderColor:'rgba(54,162,235,1)', fill:true, stack:'spend'},
      {label:'Search', data: pastSearch, backgroundColor:'rgba(255,99,132,0.5)', borderColor:'rgba(255,99,132,1)', fill:true, stack:'spend'},
      {label:'Display', data: pastDisplay, backgroundColor:'rgba(75,192,192,0.5)', borderColor:'rgba(75,192,192,1)', fill:true, stack:'spend'},
      {label:'Revenue', data: pastRevenue, borderColor:'#000', fill:false, borderWidth:2, yAxisID:'y1'}
    ]
  },
  options: {
    responsive:true,
    interaction:{mode:'index', intersect:false},
    stacked:false,
    plugins:{legend:{position:'top'}},
    scales:{
      y:{stacked:true, title:{display:true, text:'€'}},
      y1:{position:'right', title:{display:true, text:'€'}, grid:{drawOnChartArea:false}}
    }
  }
});

// ----- Interactive chart for next 12 months -----
const futureLabels = getFutureMonths(12);
const futureSocial = Array(12).fill(2000);
const futureSearch = Array(12).fill(1500);
const futureDisplay = Array(12).fill(1000);

const forecastCtx = document.getElementById('forecastChart').getContext('2d');

const forecastChart = new Chart(forecastCtx, {
  type: 'line',
  data: {
    labels: futureLabels,
    datasets: [
      {label:'Social', data: futureSocial, backgroundColor:'rgba(54,162,235,0.5)', borderColor:'rgba(54,162,235,1)', fill:true, stack:'spend', dragData:true},
      {label:'Search', data: futureSearch, backgroundColor:'rgba(255,99,132,0.5)', borderColor:'rgba(255,99,132,1)', fill:true, stack:'spend', dragData:true},
      {label:'Display', data: futureDisplay, backgroundColor:'rgba(75,192,192,0.5)', borderColor:'rgba(75,192,192,1)', fill:true, stack:'spend', dragData:true},
      {label:'Predicted Sales', data:Array(12).fill(0), borderColor:'#000', fill:false, borderWidth:2, dragData:false}
    ]
  },
  options: {
    responsive:true,
    interaction:{mode:'index', intersect:false},
    plugins:{
      legend:{position:'top'},
      dragData:{
        round:0,
        showTooltip:true,
        onDrag:function(e, datasetIndex, index, value){
          const capped = clampValue(datasetIndex, index, value);
          forecastChart.data.datasets[datasetIndex].data[index] = capped;
          updatePredicted();
          updateAllocationInfo();
          return capped;
        }
      }
    },
    scales:{
      y:{stacked:true, title:{display:true, text:'€'}},
    }
  }
});

function clampValue(datasetIndex, index, newValue){
  // monthly cap 20k
  let otherMonthly = 0;
  forecastChart.data.datasets.forEach((ds,i)=>{
    if(ds.stack==='spend' && i!==datasetIndex){
      otherMonthly += ds.data[index];
    }
  });
  let capped = Math.min(newValue, 20000 - otherMonthly);
  if(capped < 0) capped = 0;

  // total cap 100k
  let sumExcept = 0;
  forecastChart.data.datasets.forEach((ds,i)=>{
    if(ds.stack==='spend'){
      ds.data.forEach((v,idx)=>{
        if(!(i===datasetIndex && idx===index)) sumExcept += v;
      });
    }
  });
  const remaining = 100000 - sumExcept;
  capped = Math.min(capped, remaining);
  if(capped < 0) capped = 0;
  return capped;
}

function updatePredicted(){
  const predicted = forecastChart.data.datasets.find(ds=>ds.label==='Predicted Sales');
  for(let i=0;i<futureLabels.length;i++){
    let monthly = 0;
    forecastChart.data.datasets.forEach(ds=>{
      if(ds.stack==='spend') monthly += ds.data[i];
    });
    predicted.data[i] = monthly * 1.5; // simple ROI assumption
  }
  forecastChart.update();
}

function updateAllocationInfo(){
  let total = 0;
  forecastChart.data.datasets.forEach(ds=>{
    if(ds.stack==='spend') total += ds.data.reduce((a,b)=>a+b,0);
  });
  document.getElementById('allocationInfo').innerText = `Allocated: €${total.toFixed(0)}`;
}

updatePredicted();
updateAllocationInfo();
