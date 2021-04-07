import axios from "axios";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from "react";
import React from 'react';

import Modal from './Modal';
import MovieCard from './movie';
import MovieForm from './movieForm';


const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    padding: 10,
  },
  btn: {
    float: "right",
    borderRadius: 20,
  },
});

export default function MovieListing() {
  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = () => {
    let query = {
      query: `
          query getMovies {
            movies {
              id
              title
              year
              actors {
                id
                name
              }
            }
          }`
    }

    axios.post("http://127.0.0.1:8000/graphql/", query).then((res) => {
      setMovies(res.data.data.movies)
    })
  }

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Button variant="contained" color="primary" className={classes.btn} onClick={() => setOpen(true)}>
        Create Movie
      </Button>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        {
          movies.map(movie => (
            <Grid item xs={12} sm={12} md={3} key={movie.id}>
              <MovieCard
                movie={movie}
                fetchMovies={fetchMovies}
              />
            </Grid>
          ))
        }
      </Grid>

      <Modal title="Create Movie" open={open} handleClose={() => setOpen(false)}>
        <MovieForm
          closeModal={() => setOpen(false)}
          fetchMovies={fetchMovies}
          movie={null}
        />
      </Modal>
    </div>
  )
}
