/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core'
import PropTypes from 'prop-types'

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
  },
}))

function PersonVideo({ person }) {
  const classes = useStyles();
  let videoRef = useRef();

  // Set the srcObject once the react ref returns current
  if (videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = person.stream;
  }

  return (
    <video
      // eslint-disable-next-line no-param-reassign
      ref={videoRef}
      autoPlay
      muted={person.muted}
      className={classes.video}
    >
      <track default />
    </video>
  )
}

PersonVideo.propTypes = {
  person: PropTypes.objectOf(PropTypes.object).isRequired,
}

export default PersonVideo
