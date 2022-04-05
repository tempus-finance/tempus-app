import React, { CSSProperties } from 'react';

import Typography from './Typography';

export default {
  title: 'Typography',
  component: Typography,
  argTypes: {},
};

const style: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

export const Header = () => (
  <div style={style}>
    <Typography variant="header">Header</Typography>
    <br />
    <Typography variant="header" weight="medium">
      Header Medium
    </Typography>
    <br />
    <Typography variant="header" weight="bold">
      Header Bold
    </Typography>
    <br />
    <Typography variant="header" type="mono">
      Header Mono
    </Typography>
    <br />
    <Typography variant="header" weight="medium" type="mono">
      Header Mono Medium
    </Typography>
    <br />
    <Typography variant="header" weight="bold" type="mono">
      Header Mono Bold
    </Typography>
  </div>
);

export const Subheader = () => (
  <div style={style}>
    <Typography variant="subheader">Subheader</Typography>
    <br />
    <Typography variant="subheader" weight="medium">
      Subheader Medium
    </Typography>
    <br />
    <Typography variant="subheader" weight="bold">
      Subheader Bold
    </Typography>
    <br />
    <Typography variant="subheader" type="mono">
      Subheader Mono
    </Typography>
    <br />
    <Typography variant="subheader" weight="medium" type="mono">
      Subheader Mono Medium
    </Typography>
    <br />
    <Typography variant="subheader" weight="bold" type="mono">
      Subheader Mono Bold
    </Typography>
  </div>
);

export const Title = () => (
  <div style={style}>
    <Typography variant="title">Title</Typography>
    <br />
    <Typography variant="title" weight="medium">
      Title Medium
    </Typography>
    <br />
    <Typography variant="title" weight="bold">
      Title Bold
    </Typography>
    <br />
    <Typography variant="title" type="mono">
      Title Mono
    </Typography>
    <br />
    <Typography variant="title" weight="medium" type="mono">
      Title Mono Medium
    </Typography>
    <br />
    <Typography variant="title" weight="bold" type="mono">
      Title Mono Bold
    </Typography>
  </div>
);

export const Subtitle = () => (
  <div style={style}>
    <Typography variant="subtitle">Subtitle</Typography>
    <br />
    <Typography variant="subtitle" weight="medium">
      Subtitle Medium
    </Typography>
    <br />
    <Typography variant="subtitle" weight="bold">
      Subtitle Bold
    </Typography>
    <br />
    <Typography variant="subtitle" type="mono">
      Subtitle Mono
    </Typography>
    <br />
    <Typography variant="subtitle" weight="medium" type="mono">
      Subtitle Mono Medium
    </Typography>
    <br />
    <Typography variant="subtitle" weight="bold" type="mono">
      Subtitle Mono Bold
    </Typography>
  </div>
);

export const BodyPrimary = () => (
  <div style={style}>
    <Typography variant="body-primary">Body Primary</Typography>
    <br />
    <Typography variant="body-primary" weight="medium">
      Body Primary Medium
    </Typography>
    <br />
    <Typography variant="body-primary" weight="bold">
      Body Primary Bold
    </Typography>
    <br />
    <Typography variant="body-primary" type="mono">
      Body Primary Mono
    </Typography>
    <br />
    <Typography variant="body-primary" weight="medium" type="mono">
      Body Primary Mono Medium
    </Typography>
    <br />
    <Typography variant="body-primary" weight="bold" type="mono">
      Body Primary Mono Bold
    </Typography>
  </div>
);

export const BodySecondary = () => (
  <div style={style}>
    <Typography variant="body-secondary">Body Secondary</Typography>
    <br />
    <Typography variant="body-secondary" weight="medium">
      Body Secondary Medium
    </Typography>
    <br />
    <Typography variant="body-secondary" weight="bold">
      Body Secondary Bold
    </Typography>
    <br />
    <Typography variant="body-secondary" type="mono">
      Body Secondary Mono
    </Typography>
    <br />
    <Typography variant="body-secondary" weight="medium" type="mono">
      Body Secondary Mono Medium
    </Typography>
    <br />
    <Typography variant="body-secondary" weight="bold" type="mono">
      Body Secondary Mono Bold
    </Typography>
  </div>
);

export const BodyTertiary = () => (
  <div style={style}>
    <Typography variant="body-tertiary">Body Tertiary</Typography>
    <br />
    <Typography variant="body-tertiary" weight="medium">
      Body Tertiary Medium
    </Typography>
    <br />
    <Typography variant="body-tertiary" weight="bold">
      Body Tertiary Bold
    </Typography>
    <br />
    <Typography variant="body-tertiary" type="mono">
      Body Tertiary Mono
    </Typography>
    <br />
    <Typography variant="body-tertiary" weight="medium" type="mono">
      Body Tertiary Mono Medium
    </Typography>
    <br />
    <Typography variant="body-tertiary" weight="bold" type="mono">
      Body Tertiary Mono Bold
    </Typography>
  </div>
);
