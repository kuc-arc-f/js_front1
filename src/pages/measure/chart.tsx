import {useState, useEffect}  from 'react';
import React from 'react';
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
import { Line } from 'react-chartjs-2';

import Link from 'next/link';
import { gql } from "@apollo/client";
import client from '@/apollo-client'
import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'
import LibCookie from '@/lib/LibCookie'
import LibCommon from '@/lib/LibCommon'
import LibMeasure from '@/lib/LibMeasure'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const perPage = 5;
interface IProps {
//  items: Array<object>,
  history:string[],
  ym: string,
}
interface IState {
  items: any[],
  items_all: any[],
  perPage: number,
  offset: number,
  pageCount: number,
  button_display: boolean,
  chart_display: boolean,
}

//console.log(data.datasets[0].data);
// console.log(data);
//
export default class Chart extends React.Component<IProps, IState> {
  constructor(props){
    super(props)
    this.state = {
      items: [], items_all: [], perPage: 10, offset: 0, pageCount: 0,
      button_display: false, chart_display: false,
     };
console.log(props);   
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
console.log(uid);
    if(uid === null){
      location.href = '/auth/login';
    }
//console.log(typeof window);
    const data = await client.query({
      query: gql`
      query {
        measures(userId: "${uid}") {
          id
          mvalue
          mdate
          createdAt    
        }
      }
      `,
      fetchPolicy: "network-only"
    });
    let items = data.data.measures;
    items = LibMeasure.getMonthItem(items, this.props.ym);
console.log(items);
    this.setState({
      items: items,
      button_display: true, 
    })  
  }    
  render(){
console.log(this.state);
    const options = {
      responsive: true,
      plugins: {
        legend: { },
        title: {
          display: true,
          text: 'Measure Chart',
        },
      },
    };
    const labels = this.state.items.map(item =>{
      let date = LibCommon.converDateString(item.mdate);
//console.log(date);
      return (date) 
    });
    const mapValue = this.state.items.map(item =>{
      return (item.mvalue) 
    });
//console.log(mapValue);
    const data = {
      labels,
      datasets: [
        {
          label: 'Value',
          data: mapValue,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    return(
    <Layout>
      {this.state.button_display ? (<div />): (
        <LoadingBox></LoadingBox>
      )}       
      <div className="container mt-1 mb-4">
        <Link href="/measure">
          <a className="btn btn-outline-primary mt-1">Back</a>
        </Link>
         <hr className="mt-2 mb-2" />
        <h3>Chart</h3>
        <hr className="my-1" />
        <Line options={options} data={data} />
        <hr className="mt-1 mb-4" />
      </div>
    </Layout>
    );
  }
}
export const getServerSideProps = async (ctx) => {
  const id = ctx.query.id
console.log(ctx.query.ym); 
//  const item = data.data.task; 
  return {
    props: { ym: ctx.query.ym, },
  }
}