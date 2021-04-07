import axios from "axios";
import Button from '@material-ui/core/Button';
import React, { useState, useEffect } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import TextField from '@material-ui/core/TextField';


export default function MovieForm(props) {
  const [actors, setActors] = useState([])
  const [selectedActors, setSelectedActors] = useState([])
  const [title, setTitle] = useState()
  const [year, setYear] = useState()

  useEffect(() => {
    let query = {
      query: `
        query getActors {
          actors {
            id
            name
          }
        }`
    }

    axios.post("http://127.0.0.1:8000/graphql/", query).then((res) => {
      setActors(res.data.data.actors)
    })

    if (props.movie && Object.keys(props.movie).length > 0 && props.movie.constructor === Object) {
      setTitle(props.movie.title)
      setYear(props.movie.year)
      setSelectedActors(props.movie.actors)
    }
  }, [])

  const createMovie = (e) => {
    e.preventDefault();
    if (selectedActors.length === 0) {
      alert("Actors list cannot be empty");
      return
    }

    props.closeModal();
    let query = {
      query: `
        mutation createMovie($title: String!, $actors: [ActorInput]!, $year: Int!) {
          createMovie(input: {title: $title, actors: $actors, year: $year}) {
            ok
          }
        }`,
      variables: {
        title: title,
        year: year,
        actors: selectedActors,
      }
    }

    axios.post("http://127.0.0.1:8000/graphql/", query).then(() => {
      props.fetchMovies();
      alert("Movie Added")
    })
  }

  const updateMovie = (e) => {
    e.preventDefault();
    if (selectedActors.length === 0) {
      alert("Actors list cannot be empty");
      return
    }

    props.closeModal();
    let query = {
      query: `
        mutation updateMovie($title: String!, $actors: [ActorInput]!, $year: Int!) {
          updateMovie(id: ${props.movie.id}, input: {title: $title, actors: $actors, year: $year}) {
            ok
          }
        }`,
      variables: {
        title: title,
        year: year,
        actors: selectedActors,
      }
    }

    axios.post("http://127.0.0.1:8000/graphql/", query).then(() => {
      props.fetchMovies();
      alert("Movie updated")
    })
  }

  return (
    <form onSubmit={props.movie ? updateMovie : createMovie}>
      <TextField
        autoFocus fullWidth
        margin="dense" required
        label="Movie Name"
        type="text" value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        margin="dense" fullWidth
        label="Movie year" required
        type="number" value={year}
        style={{ marginBottom: 20 }}
        onChange={(e) => setYear(e.target.value)}
      />
      <Multiselect
        options={actors}
        selectedValues={selectedActors}
        onSelect={(selectedList, selectedItem) => setSelectedActors(selectedList)}
        onRemove={(selectedList, selectedItem) => setSelectedActors(selectedList)}
        displayValue="name"
      />

      <Button type="submit" variant="contained" color="primary" style={{ marginTop: 20 }}>
        {props.movie && Object.keys(props.movie).length > 0 && props.movie.constructor === Object ? 
          "Update Movie" : "Create Movie"}
      </Button>
    </form>
  )
}
