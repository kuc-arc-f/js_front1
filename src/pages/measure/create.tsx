import Link from 'next/link';
import Router from 'next/router'
import flash from 'next-flash';
import React, {Component} from 'react';
import { gql } from "@apollo/client";
import client from '@/apollo-client'

import LibCookie from "@/lib/LibCookie";
import Layout from '@/components/layout'
import LoadingBox from '@/components/LoadingBox'

interface IState {
  title: string,
  content: string,
  _token: string,
  userId: string,
  button_display: boolean,
}
interface IProps {
  csrf: any,
  user_id: string,
}
//
export default class PageCreate extends Component<IProps, IState> {
  /*
  static async getInitialProps(ctx) {
    return {}
  }  
  */
  constructor(props){
    super(props)
    this.state = {
      title: '', content: '', _token : '', userId: '', button_display: false
    }
    this.handleClick = this.handleClick.bind(this);
//console.log(props)
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
console.log( "user_id=" , uid)
    if(uid === null){
      flash.set({ messages_error: 'Error, Login require' })
      Router.push('/login');
    }else{
  //console.log(data.data.getToken);
      this.setState({
        userId: uid, button_display: true,
      });    
    }
  }   
  handleClick(){
    this.addItem()
  } 
  async addItem(){
    try {
      const mvalue = document.querySelector<HTMLInputElement>('#mvalue');
//console.log(mvalue.value);
      const result = await client.mutate({
        mutation:gql`
        mutation {
          addMeasure(mvalue: ${mvalue.value}, userId:"${this.state.userId}" ){
            id
          }
        }                    
      `
      });
console.log(result);
      Router.push('/measure');
    } catch (error) {
      console.error(error);
      alert("Error, save item: " + error)
    }    
  } 
  render() {
console.log(this.state);
    return (
    <Layout>
      <main>
        {this.state.button_display ? (<div />): (
          <LoadingBox></LoadingBox>
        )}
        <div className="container">
          <Link href="/measure">
            <a className="btn btn-outline-primary mt-2">Back</a></Link>
          <hr className="mt-2 mb-2" />
          <h1>Measure - Create</h1>
          <hr className="my-1" />
          <div className="form-group w-30">
            <label className="w-30">Value
              <input type="number" className="form-control mt-2" name="mvalue" id="mvalue" />
            </label>
          </div>
          {this.state.button_display ? (
          <div className="form-group my-2">
            <button className="btn btn-primary" onClick={this.handleClick}>Save
            </button>
          </div>                
          ): (
          <div>false</div>
          )
          }          
          <hr />
        </div>
      </main>
    </Layout>
    )    
  } 
}

