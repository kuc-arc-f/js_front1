import Head from 'next/head'
import React from 'react'
import { marked } from 'marked';

import Link from 'next/link';
import { gql } from "@apollo/client";
import client from '@/apollo-client'

import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'
import LibCommon from '@/lib/LibCommon'
//
interface IState {
  title: string,
  content: string,
  _token: string,
  item: any,
  createdAt: string,
  button_display: boolean,
}
interface IProps {
  id: string,
  csrf: any,
  item: any,
  complete_type: number,
}
//
export default class Page extends React.Component<IProps, IState> {
  constructor(props){
    super(props)  
//console.log(props);
    this.state = {
      title: '', 
      content: '',
      createdAt: '',
      _token : '',
      item: {},
      button_display: false,
    }
  }
  async componentDidMount(){
    try{
      const id = this.props.id;
      const data = await client.query({
        query: gql`
        query {
          todo(id:  ${id}) {
            id
            title
            content
            createdAt
          }                  
        }
        ` ,
        fetchPolicy: "network-only"
      });
      console.log(data.data.todo); 
      const item = data.data.todo;      
console.log(item);
      let date = LibCommon.converDateString(item.createdAt);
      let content = item.content.replace(/<br \/>/gi, '\n');
      content = content.replace(/<doubleQuarts>/gi, '"');
      content = marked.parse(content);
      this.setState({
        item: item, 
        content: content, 
        createdAt: date, button_display: true,
      });

    } catch (e) {
      console.error(e);
    }
  }    
  render(){
    return (
    <Layout>
      {this.state.button_display ? (<div />): (
        <LoadingBox></LoadingBox>
      )}       
      <Head><title key="title">{this.state.item.title}</title></Head>
      <div className="container bg-light">
        <div className="hidden_print">
          <Link href="/todos">
            <a className="btn btn-outline-primary mt-2">Back</a></Link>
        </div> 
        <div className="card shadow-sm my-2">
          <div className="card-body">
            <h1>{this.state.item.title}</h1>
            Date: {this.state.createdAt}<br />
            ID: {this.state.item.id}
          </div>
        </div>           
        <div className="shadow-sm bg-white p-4 mt-2 mb-4">
          <div id="post_item" dangerouslySetInnerHTML={{__html: `${this.state.content}`}}>
          </div>
        </div>
      </div>
      <style>{`
        div#post_item img{
          max-width : 100%;
          height : auto;
        }
        #post_item pre{
          background-color: #EEE;
          padding: 0.5rem;
        }      
        .show_head_wrap{ font-size: 1.4rem; }
        .pdf_next_page {
          page-break-before: always;
          background-color: green;
          border: none;        
        }
        @media print {
          .hidden_print{
            display: none;
          }
        }
      `}</style>
    </Layout>
    )
  }

}
//
export const getServerSideProps = async (ctx) => {
  const id = ctx.query.id;
  return {
    props: {
      id: id 
    },
  }
}

//export default Page

