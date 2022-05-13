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
import MessageBox from '@/components/MessageBox'

interface IState {
  title: string,
  content: string,
  complete: number,
  _token: string,
  userId: string,
  button_display: boolean,
  message: string,
}
interface IProps {
  id: string,
  csrf: any,
  item: any,
  complete_type: number,
}
//
export default class TaskEdit extends React.Component<IProps, IState> {
  static async getInitialProps(ctx) {
    console.log("id=", ctx.query.id)
    const id = ctx.query.id
    const data = await client.query({
      query: gql`
      query {
        todo(id:  ${id}) {
          id
          title
          content
          complete
          createdAt
        }                     
      }
      ` ,
      fetchPolicy: "network-only"
    });
console.log(data.data.todo); 
    return {
      id: id,
      item: data.data.todo,
      csrf: '',
    };
  }
  constructor(props){
    super(props)
    this.handleClick = this.handleClick.bind(this);
    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.state = {
      title: this.props.item.title, 
      content: this.props.item.content,
      complete: this.props.item.complete,
      _token : this.props.csrf.token,
      userId: '', button_display: false, message: '',
    }
console.log(this.props )
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
        userId: uid, button_display: true,
      });      
    }
  }  
  async handleClickDelete(){
    console.log("#deete-id:" , this.props.id)
    try {
      const result = await client.mutate({
        mutation:  gql`
        mutation {
          deleteTodo(id: ${this.props.id}){
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
      Router.push('/todos');      
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
      const content = document.querySelector<HTMLInputElement>('#content');
      let contentValue = content.value;
      contentValue = contentValue.replace(/\r?\n/g, '<br />');  //win
      contentValue = contentValue.replace(/\n/g, '<br />');
      contentValue = contentValue.replace(/\"/g, '<doubleQuarts>');
                 
      const result = await client.mutate({
        mutation: gql`
        mutation {
          updateTodo(id: ${this.props.id}, title: "${title.value}", 
          content: "${contentValue}", complete: ${this.state.complete}){
            id
          }          
        }                    
      `
      });
console.log(result);
      this.setState({message: "Success , Save"});
/*
      if(result.data.updateBook.id === 'undefined'){
        throw new Error('Error , updateBook');
      }
*/
//      Router.push('/todos');
    } catch (error) {
      console.error(error);
      alert("Error, save item");
    }     
  }
  async handleClickComplete(){
    console.log("#handleClickComplete", this.props.item.complete);
    try{
      let complete= 0
      if(this.props.item.complete === 0){
        complete = 1
      }
      const result = await client.mutate({
        mutation: gql`
        mutation {
          updateCompleteTodo(id: ${this.props.id}, complete: ${complete}){
            id
          }                    
        }                    
      `
      });
console.log(result);
//      this.setState({message: "Success , Save"});
      Router.push('/todos');      
    } catch (e) {
      console.error(e);
      alert("Error, save Complete");
    }
  }  
  render() {
console.log(this.state);
    let complete_btn_name = "complete";
    if(this.props.item.complete === 1){
      complete_btn_name = "change Todo";
    }
    let content = this.state.content;
    content = content.replace(/<br \/>/gi, '\n');
    content = content.replace(/<doubleQuarts>/gi, '"');
//console.log(content);
    return (
      <Layout>
        {this.state.button_display ? (<div />): (
          <LoadingBox></LoadingBox>
        )
        }
        <MessageBox success={this.state.message} error=""/>         
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <Link href="/todos">
              <a className="btn btn-outline-primary mt-2">Back</a></Link>
            </div>
            <div className="col-md-3"><h3>Todo - Edit</h3>
            </div>
            <div className="col-md-6 text-center">
              {this.state.button_display ? (
              <div>
                <div className="form-group mt-2 ">
                  <button className="btn btn-primary mx-2" onClick={this.handleClick}>Save
                  </button>
                  <button className="btn btn-outline-success mx-2"
                  onClick={() => this.handleClickComplete()}>{complete_btn_name}
                  </button>
                  <Link href={`/todos/${this.props.id}`}>
                    <a><button className="btn btn-outline-primary">Preview</button>
                    </a>
                  </Link>                              
                </div>
              </div>
              ): ""
              } 
            </div>
          </div>
          <hr className="my-1" />
          ID : {this.props.id}
          <hr className="my-1" />
          <div className="col-md-6 form-group">
            <label>Title:</label>
            <input type="text" id="title" className="form-control"
            defaultValue={this.state.title}
             />
          </div>
          <div className="form-group">
            <label>Content:</label>
            <div className="col-sm-12">
              <textarea name="content" id="content" className="form-control"
               rows={10} defaultValue={content}></textarea>
            </div>
          </div>          
          {this.state.button_display ? (
          <div>
            {/*
            */}
            <div className="form-group mt-2">
              <button className="btn btn-danger" onClick={this.handleClickDelete}>Delete
              </button>
            </div>
          </div>
          ): ""
          }          
        <hr className="my-2" />
          
        </div>
      </Layout>
    );
  }
}
/*
  <div className="form-group mt-2">
    <button className="btn btn-primary" onClick={this.handleClick}>Save
    </button>
  </div>
  <hr className="my-1" /> 
  <button className="btn btn-outline-success btn-sm mt-2"
  onClick={() => this.handleClickComplete()}>{complete_btn_name}
  </button>            
  <hr className="my-1" /> 
*/
