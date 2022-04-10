import {useState, useEffect}  from 'react';
import Head from 'next/head'
import React from 'react';

import Link from 'next/link';
import { gql } from "@apollo/client";
import client from '@/apollo-client'
import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'
import IndexRow from './IndexRow';
import ReactPaginate from 'react-paginate';
import LibPagenate from '@/lib/LibPagenate';
import LibCookie from '@/lib/LibCookie'
import LibCommon from '@/lib/LibCommon'

const perPage = 100;
interface IProps {
  items: Array<object>,
  history:string[],
}
interface IState {
  items: any[],
  items_all: any[],
//  categoryItems: any[],
  category: string,
  perPage: number,
  offset: number,
  pageCount: number,
  button_display: boolean,
  userId: string,
  type_complete: number,
  paginate_display: boolean, 
}
//
export default class MemoIndex extends React.Component<IProps, IState> {
  static async getInitialProps(ctx) {
//console.log(items);  
    return {
      items: [],
    }
  }
  constructor(props){
    super(props)
    this.state = {
      items: [], items_all: [], perPage: 10, offset: 0, pageCount: 0,
      category: '', button_display: false, userId: '', type_complete: 0, paginate_display: false,
     };
//console.log(props);   
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
console.log(uid);
    if(uid === null){
      location.href = '/auth/login';
    }
    const data = await client.query({
      query: gql`
      query {
        memos(userId: "${uid}") {
          id
          title
          createdAt    
        }                
      }
      `,
      fetchPolicy: "network-only"
    });
    let items = data.data.memos;
    const items_all = items;
//    items = items_all.filter(item => (item.complete === 0));
//console.log(items);
    LibPagenate.set_per_page(perPage);
    const n = LibPagenate.getMaxPage(items.length);
    const d = LibPagenate.getPageStart(0);
    this.setState({
      items: items.slice(d.start, d.end), items_all: items_all, button_display: true, pageCount: n,
      userId: uid, paginate_display: true,
    })  
  }    
  handlePageClick (data: any) {
    console.log('onPageChange', data);
    let selected = data.selected;
    let offset = Math.ceil(selected * perPage);
    const d = LibPagenate.getPageStart(selected);
//console.log(d);
    this.setState({
      offset: offset, 
      items: this.state.items_all.slice(d.start, d.end) 
    });
  }
  async clickClear(){
    location.href= '/memo';
  }  
  async clickSearch(){
    try{
      const searchKey = document.querySelector<HTMLInputElement>('#searchKey');
      console.log(searchKey.value);
      this.setState({ items: [] , button_display: false })
      const data = await client.query({
        query: gql`
        query {
          searchMemos(userId: "${this.state.userId}", seachKey: "${searchKey.value}") {
            id
            title
            createdAt    
          }          
        }
        `,
        fetchPolicy: "network-only"
      });
      let items = data.data.searchMemos;
//console.log(items);
      this.setState({ items: items, paginate_display: false, button_display: true })            
    } catch (e) {
      console.error(e);
    }    
  }   
  render(){
    const currentPage = Math.round(this.state.offset / perPage);
    const data = this.state.items;
//console.log(this.state);
    return(
    <Layout>
      <Head><title key="title">Memo</title></Head>
      {this.state.button_display ? (<div />): (
        <LoadingBox></LoadingBox>
      )}       
      <div className="container mt-2 mb-4">
        <div className="row">
          <div className="col-md-6"><h3>Md Memo</h3>
          </div>
          <div className="col-md-6  text-end">
            <Link href="/memo/create">
              <a><button className="btn btn-primary mt-2">Create</button>
              </a>
            </Link>
          </div>
        </div>
        <hr className="my-1" />
        <div className="row">
          <div className="col-md-8 pt-2">
            <button onClick={() => this.clickClear()} className="btn btn-sm btn-outline-primary">Clear
            </button>
            <span className="search_key_wrap">
              {/* form-control form-control-sm */}
              <input type="text" size={24} className="mx-2 " name="searchKey" id="searchKey"
              placeholder="Title search Key" />        
            </span>
            <button onClick={() => this.clickSearch()} className="btn btn-sm btn-outline-primary">Search
            </button>
          </div>
          <div className="col-md-4">
          </div>
        </div>      
        <hr className="my-1" />  
        {/* data */}      
        {data.map((item: any ,index: number) => {
          let date = LibCommon.converDatetimeString(item.createdAt);
  //console.log(item.values.title);  created_at
          return (
            <IndexRow key={index} id={item.id} title={item.title} date={date} />
          )
        })}      
        <hr />
        {this.state.paginate_display ? (
          <nav aria-label="Page navigation comments" className="mt-4">
            <ReactPaginate
              previousLabel="previous"
              nextLabel="next"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="page-link"
              pageCount={this.state.pageCount}
              pageRangeDisplayed={4}
              marginPagesDisplayed={2}
              onPageChange={this.handlePageClick.bind(this)}
              containerClassName="pagination justify-content-center"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              activeClassName="active"
              hrefBuilder={(page, pageCount) =>
                page >= 1 && page <= pageCount ? `/page/${page}` : '#'
              }
              hrefAllControls
              forcePage={currentPage}
              onClick={(clickEvent) => {
                console.log('onClick', clickEvent);
              }}
            />
          </nav>
        ): (<div></div>)}
        
      </div>
      <style>{`
      .card_col_body{ text-align: left; width: 100%;}
      .card_col_icon{ font-size: 2.4rem; }      
      `}</style>
    </Layout>
    );
  }
}
