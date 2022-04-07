//import { Chart, registerables } from "chart.js"
//import { Chart } from "chart.js"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';

//Chart.register(...registerables)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const Graph = () => {
  const labels = [
    "小学生",
    "中学生",
    "高校生",
    "大学生",
    "20代前半",
    "20代後半",
  ]
  const data = {
    labels: labels,
    datasets: [
      {
        label: "人生",
        data: [40, 60, 70, 40, 50, 90],
        borderColor: "rgb(75, 192, 192)",
      },
    ],
  }
/*
  const options: {} = {
    maintainAspectRatio: false,
    responsive: false,
  }
*/
  const options = {
    responsive: true,
    plugins: {
      legend: { },
      title: {
        display: true,
        text: 'Chart.js Line Chart',
      },
    },
  };
  return (
    <Line data={data} options={options} />
  )
}

export default Graph
