import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: [],
      loading: true,
      seenJokes: new Set(),
    };

    this.numJokesToGet = props.numJokesToGet || 10;
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  getJokes = async () => {
    try {
      let newJokes = [];
      while (newJokes.length < this.numJokesToGet) {
        let response = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { id, joke } = response.data;

        if (!this.state.seenJokes.has(id)) {
          this.setState(prevState => ({
            seenJokes: new Set(prevState.seenJokes.add(id)),
          }));
          newJokes.push({ id, joke, votes: 0 });
        }
      }
      this.setState(st => ({
        jokes: [...st.jokes, ...newJokes],
        loading: false
      }));
    } catch (error) {
      console.error("Error fetching jokes", error);
      this.setState({ loading: false });
    }
  };

  generateNewJokes = () => {
    this.setState({ jokes: [], loading: true }, this.getJokes);
  };

  vote = (id, delta) => {
    this.setState(st => ({
      jokes: st.jokes.map(j => 
        j.id === id ? { ...j, votes: j.votes + delta } : j
      ),
    }));
  };

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>; // Could be replaced with a spinner or similar
    }

    const sortedJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <button className="JokeList-getmore" onClick={this.generateNewJokes}>
          Get New Jokes
        </button>

        {sortedJokes.map(j => (
          <Joke key={j.id} id={j.id} votes={j.votes} text={j.joke} vote={this.vote} />
        ))}
      </div>
    );
  }
}

export default JokeList;

