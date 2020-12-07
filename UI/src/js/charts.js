var userCount,pointCount,commandCount,quoteCount;
 function getBasicData() {
  var users = UserHandle.getAll().then( a =>  {
    userCount = a.length;
    var points = QuoteHandle.getAll().then( b => {
      quoteCount = b.length;
      var commands = CommandHandle.getAll().then( c => {
        commandCount = c.length;
        pointCount = 4;
        var introChart = new ApexCharts(document.querySelector("#chart"), introChartOptions);
        introChart.render();
      })
    })
  })
}
var introChartOptions = {
  series: [userCount, pointCount, commandCount, quoteCount, 4],
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

