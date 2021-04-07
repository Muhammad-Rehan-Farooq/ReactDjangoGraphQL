import React, {useState} from 'react';
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import Modal from './Modal';
import MovieForm from './movieForm';

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
  },
});

export default function MediaCard(props) {
  const [open, setOpen] = useState(false);

  const deleteMovie = () => {
    let query = {
      query: `
        mutation deleteMovie {
          deleteMovie(id: ${movie.id}) {
            ok
          }
        }`
    }

    axios.post("http://127.0.0.1:8000/graphql/", query).then((res) => {
      if (res.data.data.deleteMovie.ok === true) {
        props.fetchMovies();
        alert("Movie Deleted")
      }
    })
  }

  const classes = useStyles();
  const { movie, fetchMovies } = props;
  const { actors, title, year } = movie;
  let actorNames = actors.map(actor => actor.name);

  return (
    <>
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt="Contemplative Reptile"
            height="200"
            image="https://www.desktopbackground.org/download/2048x1152/2013/01/28/521944_pictures-of-nature-scenery-wallpapers-mobile-kemecer-com_2560x1600_h.jpg"
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`Year: ${year}`}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`Actors: ${actorNames.join(', ')}`}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary" onClick={() => setOpen(true)}>
            Edit
        </Button>
          <Button size="small" color="primary" onClick={deleteMovie}>
            Delete
        </Button>
        </CardActions>
      </Card>

      <Modal title="Update Movie" open={open} handleClose={() => setOpen(false)}>
        <MovieForm
          closeModal={() => setOpen(false)}
          fetchMovies={fetchMovies}
          movie={movie}
        />
      </Modal>
    </>
  );
}