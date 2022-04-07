import {useState, useEffect}  from 'react';
import React from 'react';
const ExcelJS = require('exceljs');
import axios from 'axios'
import Link from 'next/link';
import moment from 'moment';
import { gql } from "@apollo/client";
import client from '@/apollo-client'
import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'
import IndexRow from './IndexRow';
import LibCookie from '@/lib/LibCookie'
import LibCommon from '@/lib/LibCommon'
import LibMeasure from '@/lib/LibMeasure'

const perPage = 5;
interface IProps {
  items: Array<object>,
  history:string[],
}
interface IState {
  items: any[],
  items_all: any[],
  categoryItems: any[],
  category: string,
  perPage: number,
  offset: number,
  pageCount: number,
  button_display: boolean,
  now_month_title: string,
}
//
export default class NotesIndex extends React.Component<IProps, IState> {
  static async getInitialProps(ctx) {
    return { items: [], }
  }
  constructor(props){
    super(props)
    this.state = {
      items: [], items_all: [], perPage: 10, offset: 0, pageCount: 0, categoryItems: [],
      category: '', button_display: false, now_month_title: '',
     };
//console.log(props);   
  }
  async componentDidMount(){
    try{
      const self = this;
      window.addEventListener("load", function() {
        window.document.getElementById("month").addEventListener("change", function() {
          console.log("#-change")
          self.changeInputMonth();
        });
      })
      const now = moment(new Date);
      const now_month = now.format("YYYY-MM");
//console.log(now.format("YYYY-MM"));
      const month = document.querySelector<HTMLInputElement>('#month');
      month.value = now_month;
//console.log(month.value);
      const key = process.env.COOKIE_KEY_USER_ID;
      const uid = LibCookie.get_cookie(key);
  console.log(uid);
      if(uid === null){
        location.href = '/auth/login';
      }
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
//console.log(d);
      this.setState({
        items: LibMeasure.getMonthItem(items, now_month),
        items_all: items,
        button_display: true, 
        now_month_title: now_month,
      })
    } catch (e) {
      console.error(e);
    }    
  }
  async clickHandler(e: any){
    console.log("#clickHandler");
    e.preventDefault();
    const res = await axios.get("/measure_temp.xlsx", { responseType: "arraybuffer" });
    const data = new Uint8Array(res.data);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);    
    //data
    const worksheet = workbook.getWorksheet('sheet1');
    worksheet.pageSetup = {orientation:'portrait'};
    const startRow = 4;
    let iCount = 0;
    let row = worksheet.getRow(1);
    const borderObj = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };
    for (const item of this.state.items) {
      let pos = startRow + iCount;
      row = worksheet.getRow(pos);
      let date = LibCommon.converDateString(item.mdate);
      row.getCell(1).value = item.id;
      row.getCell(2).value = date;
      row.getCell(3).value = item.mvalue;
      iCount += 1;
    }
    // style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        // セルの枠線を設定
        if (rowNumber >= startRow) {
          cell.border = borderObj;
        }
      });
      row.commit();
    });    
    //save
    const uint8Array = await workbook.xlsx.writeBuffer();
//console.log(uint8Array);
    const blob = new Blob([uint8Array], {type: 'application/octet-binary'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measure_report.xlsx`;
    a.click();
    a.remove()     
  }  
  changeInputMonth(){
    try{
      const month = document.querySelector<HTMLInputElement>('#month');
      console.log("#changeInputMonth", month.value);
      const items = LibMeasure.getMonthItem(this.state.items_all, month.value);
      this.setState({items: items, now_month_title: month.value });
    } catch (e) {
      console.error(e);
      alert("Error, change month.");
    }    
  }    
  clickBeforeMonth(){
    console.log("clickBeforeMonth", this.state.now_month_title);
    const month = LibMeasure.getBeforeMonthStr(this.state.now_month_title)
    console.log(month);
    const items = LibMeasure.getMonthItem(this.state.items_all, month);
    console.log(items);
    const monthInput = document.querySelector<HTMLInputElement>('#month');
    monthInput.value = month;    
    this.setState({items: items, now_month_title: month});
  }  
  clickNextMonth(){
    console.log("clickNextMonth");
    const month = LibMeasure.getNextMonthStr(this.state.now_month_title)
    console.log(month);
    const items = LibMeasure.getMonthItem(this.state.items_all, month);
    console.log(items);
    const monthInput = document.querySelector<HTMLInputElement>('#month');
    monthInput.value = month;    
    this.setState({items: items, now_month_title: month});    
  }  
  render(){
    const data = this.state.items;
// console.log(this.state);
    return(
    <Layout>
      {this.state.button_display ? (<div />): (
        <LoadingBox></LoadingBox>
      )}       
      <div className="container py-4">
        <h3>Measure - index</h3>
        <hr className="my-1" />
        <div className="row">
          <div className="col-md-4">
            <Link href="/measure/create">
              <a><button className="btn btn-primary">Create</button>
              </a>
            </Link>
          </div>
          <div className="col-md-4 text-center">
            <Link href={`/measure/chart?ym=${this.state.now_month_title}`}>
              <a><button className="btn btn-outline-primary mx-2">Chart</button>
              </a>
            </Link>
          </div>
          <div className="col-md-4 text-end">
            <button className="btn btn-sm btn-outline-success mx-2"
              onClick={(e) => this.clickHandler(e)}>xlsx Export
            </button>
          </div>
        </div>
        <hr className="my-1" />
        <div className="month_move_wrap text-center" >
          <button  className="btn btn-sm btn-outline-primary mx-2"
          onClick={() => this.clickBeforeMonth()} >⇐
          </button>
          <label>
            <input type="month" id="month" name="month" className="form-control"  />
          </label>  
          <button  className="btn btn-sm btn-outline-primary mx-2"
          onClick={() => this.clickNextMonth()}>⇒
          </button>
        </div>
        <hr className="my-1" />
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {data.map((item: any ,index: number) => {
    //console.log(item.values.title);  created_at
            let date = LibCommon.converDateString(item.mdate);
            return (
              <IndexRow key={index} id={item.id} mvalue={item.mvalue} date={date} />
            )
          })}      
          </tbody>
        </table>
      </div>
    </Layout>
    );
  }
}
