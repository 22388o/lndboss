import React from 'react';
import Link from 'next/link';
import { Link as MULink } from '@mui/material';

/*
  {
    label: <Link Label String>
    destination: <Link Destination String>
  }
  Returns the standard link
*/

const styles = {
  link: {
    fontSize: '20px',
    margin: '0px',
    cursor: 'pointer',
    color: 'black',
  },
};

type Props = {
  label: string;
  destination: string;
};

const StandardRouterLink = ({ label, destination }: Props) => {
  return (
    <Link href={destination}>
      <MULink style={styles.link} underline="hover">
        {label}
      </MULink>
    </Link>
  );
};
export default StandardRouterLink;
