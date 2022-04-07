//import Head from 'next/head'
import Link from 'next/link';
import Router from 'next/router'
import React from 'react'
import flash from 'next-flash';
import { gql } from "@apollo/client";
import client from '@/apollo-client'

import LibCookie from "@/lib/LibCookie";
import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'

interface IState {
  _token: string,
  user_id: string,
  button_display: boolean,
  mvalue : number,
}
interface IProps {
  id: string,
  csrf: any,
  item: any,
  user_id: string,
}
//
export default class TaskEdit extends React.Component<IProps, IState> {
  static async getInitialProps(ctx) {
    console.log("id=", ctx.query.id)
    const id = ctx.query.id
    const data = await client.query({
      query: gql`
      query {
        measure(id:  ${id}) {
          id
          mvalue
          createdAt
        }        
      }
      ` ,
      fetchPolicy: "network-only"
    });
console.log(data.data.measure); 
    return {
      id: id,
      item: data.data.measure,
      user_id : '',
      csrf: '',
    };
  }
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.state = {
      mvalue: this.props.item.mvalue, 
//      content: this.props.item.content,
      _token : this.props.csrf.token,
      user_id: '', button_display: false,
    }
//console.log(this.props )
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
console.log( "user_id=" , uid)    
    if(uid === null){
      flash.set({ messages_error: 'Error, Login require' })
      Router.push('/login');
    }else{
      this.setState({
        user_id: uid, button_display: true,
      });      
    }
  }     
  async handleClickDelete(){
    console.log("#deete-id:" , this.props.id)
    try {
      const result = await client.mutate({
        mutation:  gql`
        mutation {
          deleteMeasure(id: ${this.props.id}){
            id
          }          
        }
      ` 
      })
console.log(result);
/*
      if(result.data.deleteBook.id === 'undefined'){
        throw new Error('Error , deleteTask');
      }
*/
      Router.push('/measure');      
    } catch (error) {
      console.error(error);
    }     
  } 
  async handleClick(){
  console.log("#-handleClick")
    await this.update_item()
  }     
  async update_item(){
    try {
      const mvalue = document.querySelector<HTMLInputElement>('#mvalue');
      console.log("#update_item-id:" , this.props.id);
      const result = await client.mutate({
        mutation: gql`
        mutation {
          updateMeasure(id: ${this.props.id}, mvalue: ${mvalue.value} ){
            id
          }          
        }                    
      `
      });
console.log(result);
/*
      if(result.data.updateBook.id === 'undefined'){
        throw new Error('Error , updateBook');
      }
*/
      Router.push('/measure');
    } catch (error) {
      console.error(error);
      alert("Error, save item");
    }     
  }  
  render() {
console.log(this.state);
    return (
      <Layout>
        {this.state.button_display ? (<div />): (
          <LoadingBox></LoadingBox>
        )
        }        
        <div className="container">
          <Link href="/measure">
            <a className="btn btn-outline-primary mt-2">Back</a></Link>
          <hr className="mt-2 mb-2" />
          <h1>Measure - Edit</h1>
          <div className="form-group w-30">
            <label className="w-30">Value
              <input type="number" className="form-control mt-2" name="mvalue" 
              id="mvalue" defaultValue={this.state.mvalue} />
            </label>
          </div>            
          {this.state.button_display ? (
          <div>
            <div className="form-group mt-2">
              <button className="btn btn-primary" onClick={this.handleClick}>Save
              </button>
            </div>
            <hr />                  
            <div className="form-group">
              <button className="btn btn-danger" onClick={this.handleClickDelete}>Delete
              </button>
            </div>
          </div>
          ): ""
          }          
          <hr />
          ID : {this.props.id}
        </div>
      </Layout>
    );
  }
}

