import React, {Component} from 'react';
import CommentList from './commentList';
import CommentForm from './commentForm';
import axios from 'axios';
import _ from 'underscore';
import MicroContainer from 'react-micro-container';

export default class CommentBox extends MicroContainer {
  constructor() {
    super();
    this.state = { data: [] };
  }
  loadCommentsFromServer() {
    axios.get(this.props.url).then(res => {
      this.setState({ data: res.data });
    }).catch(err => {
      console.error(this.props.url, err.toString());
    });
  }

  handleCommentSubmit(comment) {
    var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({ data: newComments });
    axios.post(this.props.url, comment).then(res => {
      this.setState({ data: res.data });
    }).catch(err => {
      this.setState({ data: comments });
      console.error(this.props.url, err.toString());
    })
  }

  removeComment1(id) {
    var comments = this.state.data;
    axios.delete(this.props.url + '/' + id).then(res => {
      this.setState({ data: _.filter(comments, function(comment){ return comment.id != id; }) });
    }).catch(err => {
      this.setState({ data: comments });
      console.error(this.props.url, err.toString());
    })
  }

  componentDidMount() {
    this.subscribe({
      commentSubmit: this.handleCommentSubmit
    });
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer.bind(this), this.props.pollInterval);
  }

  render() {
    return (
      <div>
        <section className="section">
          <h1 className="title">Comments</h1>
          <CommentList data={this.state.data} removeComment1={ this.removeComment1.bind(this) } />
        </section>
        <section className="section">
          <CommentForm dispatch={this.dispatch} />
        </section>
      </div>
    );
  }
}
