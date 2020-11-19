var introChartOptions = {
  series: [getUsers(), getPoints(), getCommands(), getQuotes(), 50],
  labels: ["Users", "Points", "Commands", "Quotes", "Alt"],
  chart: {
    width: 380,
    type: "donut",
    foreColor: '#f0f8ff'
  },
  
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 270,
    },
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    type: "gradient",
  },
  legend: {
    formatter: function (val, opts) {
      return val + " - " + opts.w.globals.series[opts.seriesIndex];
    },
  },
  title: {
    text: "Bot Usage",
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
};

function getUsers() {
    return 56;
}

function getQuotes() {
    return 44;
}

function getCommands() {
    return 57;
}

function getPoints() {
    return 29;
}