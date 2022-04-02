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
  title: string,
  url: string,
  _token: string,
  userId: string,
  button_display: boolean,
  bmCategoryId: number,
  categoryItems: any[],
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
        bookMark(id: ${id}){
          id
          title
          url
          bmCategoryId
          createdAt
        }            
      }
      ` ,
      fetchPolicy: "network-only"
    });
console.log(data.data.bookMark); 
    return {
      id: id,
      item: data.data.bookMark,
      user_id : '',
      csrf: '',
    };
  }
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.state = {
      title: this.props.item.title, 
      url: this.props.item.url,
      _token : this.props.csrf.token,
      userId: '', button_display: false,
      categoryItems: [], bmCategoryId: 0,
    }
console.log(this.props )
  }
  async componentDidMount(){
    const key = process.env.COOKIE_KEY_USER_ID;
    const uid = LibCookie.get_cookie(key);
console.log( "userId=" , uid)    
    if(uid === null){
      flash.set({ messages_error: 'Error, Login require' })
      Router.push('/login');
    }else{
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
      this.setState({
        userId: uid, button_display: true, categoryItems: items,
      }); 
      // this.props.item.bmCategoryId
      const category = document.querySelector<HTMLInputElement>('#category');
      category.value = this.props.item.bmCategoryId;           
    }
  }     
  async handleClickDelete(){
    console.log("#deete-id:" , this.props.id)
    try {
      const result = await client.mutate({
        mutation:  gql`
        mutation {
          deleteBookMark(id: ${this.props.id}){
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
      Router.push('/bookmark');      
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
      console.log("#update_item-id:" , this.props.id);
      const title = document.querySelector<HTMLInputElement>('#title');
      const url = document.querySelector<HTMLInputElement>('#url');
      const category = document.querySelector<HTMLInputElement>('#category');
      const result = await client.mutate({
        mutation: gql`
        mutation {
          updateBookMark(id: ${this.props.id}, title: "${title.value}", 
            url: "${url.value}", bmCategoryId: ${category.value}){
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
      Router.push('/bookmark');
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
          <Link href="/bookmark">
            <a className="btn btn-outline-primary mt-2">Back</a></Link>
          <hr className="mt-2 mb-2" />
          <h1>bookmark - Edit</h1>
          <hr className="my-1" />
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
          <hr className="my-1" />
          <div className="col-md-6">
            <label>Title:</label>
            <input type="text" id="title" className="form-control"
            defaultValue={this.state.title}
             />
             {/*
             onChange={this.handleChangeTitle.bind(this)}
             */}
          </div>
          <div className="col-md-12">
            <label>URL:</label>
            <input type="text" name="url" id="url" className="form-control"
            defaultValue={this.state.url}  />
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

