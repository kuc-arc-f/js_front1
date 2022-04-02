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
//  content: string,
  _token: string,
  userId: string,
  button_display: boolean,
  categoryItems: any[]
}
interface IProps {
  csrf: any,
}
//
export default class TaskCreate extends Component<IProps, IState> {
  constructor(props){
    super(props)
    this.state = {
      title: '',  _token : '', userId: '', button_display: false, categoryItems: [],
    }
    this.handleClick = this.handleClick.bind(this);
//console.log(props)
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
//console.log( "uid=" , uid)
    if(uid === null){
      flash.set({ messages_error: 'Error, Login require' })
      Router.push('/login');
    }else{
  //console.log(data.data.getToken);
      const data = await client.query({
        query: gql`
        query {
          bmCategories(userId: "${uid}") {
            id
            name
            createdAt    
          }        
        }
        `,
        fetchPolicy: "network-only"
      });
      let items = data.data.bmCategories;
      console.log(items);
      this.setState({
        userId: uid, button_display: true, categoryItems: items,
      });    
    }
  }   
  handleClick(){
    this.addItem()
  } 
  async addItem(){
    try {
      const title = document.querySelector<HTMLInputElement>('#title');
      const url = document.querySelector<HTMLInputElement>('#url');
      const category = document.querySelector<HTMLInputElement>('#category');
//console.log(category.value);
      const result = await client.mutate({
        mutation:gql`
        mutation {
          addBookMark(title: "${title.value}", url: "${url.value}", bmCategoryId: ${category.value},
           userId: "${this.state.userId}"){
            id
          }
        }                    
      `
      });
console.log(result);
      Router.push('/bookmark');
    } catch (error) {
      console.error(error);
      alert("Error, save item")
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
          <Link href="/bookmark">
            <a className="btn btn-outline-primary mt-2">Back</a></Link>
          <hr className="mt-2 mb-2" />
          <h1>bookmark - Create</h1>
          <hr />
          <div className="col-md-6 form-group">
            <label>Category:</label>
            <select className="form-select" name="category" id="category">
            <option key={0} value={0}></option>
            {this.state.categoryItems.map((item ,index) => (
              <option key={index} value={item.id}>{item.name}</option>
            ))
            }
            </select>
          </div>          
          <div className="col-md-12">
            <label>Title:</label>
            <input type="text" className="form-control" name="title" id="title"
             />
          </div>
          <div className="col-md-12">
            <label>URL:</label>
            <input type="text" name="url" id="url" className="form-control"
             />
          </div>
          {this.state.button_display ? (
          <div className="form-group my-2">
            <button className="btn btn-primary" onClick={this.handleClick}>Create
            </button>
          </div>                
          ): (
          <div>false</div>
          )
          }          
          <hr />
          {/*
          */}
        </div>
      </main>
    </Layout>
    )    
  } 
}

