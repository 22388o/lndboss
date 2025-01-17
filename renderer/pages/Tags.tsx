import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  CssBaseline,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import commands from '../commands';
import { TagsOutput } from '../output';
import { StandardButtonLink, StandardSwitch, StartFlexBox, SubmitButton } from '../standard_components';
import * as types from '../types';

const stringify = (obj: any) => JSON.stringify(obj, null, 2);
const TagsCommand = commands.find(n => n.value === 'Tags');

/*
  Renders the Tags command
*/

const styles: any = {
  form: {
    marginLeft: '50px',
    marginTop: '100px',
    width: '300px',
  },
  button: {
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '10px',
    border: '1px solid black',
    marginTop: '20px',
  },
  box: {
    marginTop: '100px',
    minWidth: '600px',
  },
  h4: {
    marginTop: '0px',
  },
  inputLabel: {
    fontWeight: 'bold',
    color: 'black',
  },
  select: {
    width: '300px',
  },
  textField: {
    width: '500px',
    marginTop: '12px',
  },
};

const Tags = () => {
  const [avoid, setAvoid] = useState(false);
  const [formValues, setFormValues] = useState([{ pubkey: '' }]);
  const [icon, setIcon] = useState('');
  const [tagType, setTagType] = React.useState('');
  const [tagName, setTagName] = React.useState('');
  const [data, setData] = useState('');

  const handleAvoidChange = () => {
    setAvoid((previousState: boolean) => !previousState);
  };

  const handleChoiceChange = (event: SelectChangeEvent) => {
    setTagType(event.target.value);
    setFormValues([{ pubkey: '' }]);
    setTagName('');
    setData('');
    setIcon('');
    setAvoid(false);
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIcon(event.target.value);
  };

  const handleTagNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(event.target.value);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newFormValues = [...formValues];
    newFormValues[i][e.target.name] = e.target.value;
    setFormValues(newFormValues);
  };

  const addFormFields = () => {
    setFormValues([...formValues, { pubkey: '' }]);
  };

  const removeFormFields = (i: number) => {
    const newFormValues = [...formValues];
    newFormValues.splice(i, 1);
    setFormValues(newFormValues);
  };

  const fetchData = async () => {
    const flags: types.commandTags = {
      icon,
      add: tagType === 'add' ? formValues.map(n => n.pubkey) : [],
      is_avoided: avoid,
      remove: tagType === 'remove' ? formValues.map(n => n.pubkey) : [],
      tag: tagName,
    };

    const { error, result } = await window.electronAPI.commandTags(flags);
    if (!!error) {
      window.alert(error);
    }
    if (!!result) {
      setData(stringify(result));
    }
  };
  return (
    <CssBaseline>
      <Head>
        <title>Tags</title>
      </Head>
      <StartFlexBox>
        <StandardButtonLink label="Home" destination="/Commands" />
        <Box style={styles.box}>
          <h2>{TagsCommand.name}</h2>
          <h4 style={styles.h4}>{TagsCommand.description}</h4>
          <div>
            <InputLabel id="demo-simple-select-standard-label" style={styles.inputLabel}>
              Pick a value
            </InputLabel>
            <Select
              labelId="tag-type"
              id="tag-type"
              value={tagType}
              onChange={handleChoiceChange}
              label="TagType"
              style={styles.select}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="display" id="display">
                Display Tags
              </MenuItem>
              <MenuItem value="add" id="add">
                Add Tag
              </MenuItem>
              <MenuItem value="remove" id="remove">
                Remove Tag
              </MenuItem>
            </Select>
          </div>
          {tagType === 'add' || tagType === 'remove' ? (
            <>
              <div>
                <TextField
                  type="text"
                  name={TagsCommand.args.tag}
                  id={TagsCommand.args.tag}
                  placeholder={TagsCommand.args.tag}
                  label={TagsCommand.args.tag}
                  onChange={handleTagNameChange}
                  style={styles.textField}
                  value={tagName}
                />
                <FormControlLabel
                  control={<StandardSwitch checked={avoid} onChange={handleAvoidChange} id={TagsCommand.flags.avoid} />}
                  label="Mark to globally avoid all tagged nodes"
                  style={styles.textField}
                />
                <TextField
                  type="text"
                  name={TagsCommand.flags.icon}
                  id={TagsCommand.flags.icon}
                  placeholder={`${TagsCommand.flags.icon} (Emoji optional)`}
                  label={TagsCommand.flags.icon}
                  onChange={handleIconChange}
                  style={styles.textField}
                  value={icon}
                />
              </div>
              <Button href="#text-buttons" onClick={() => addFormFields()} style={styles.button}>
                Add +
              </Button>
              {formValues.map((element, index) => (
                <Grid container key={index}>
                  <>
                    <TextField
                      type="text"
                      name="pubkey"
                      placeholder="Pubkey"
                      label="Pubkey"
                      value={element.pubkey || ''}
                      onChange={e => handleChange(index, e)}
                      style={styles.textField}
                      key={index}
                      id={`pubkey-${index}`}
                    />
                    {!!index ? (
                      <IconButton aria-label="delete" onClick={() => removeFormFields(index)}>
                        <DeleteIcon />
                      </IconButton>
                    ) : null}
                  </>
                </Grid>
              ))}
            </>
          ) : null}
          <SubmitButton variant="contained" onClick={fetchData} disabled={!tagType ? true : false}>
            Run Command
          </SubmitButton>
          {!!data ? <TagsOutput result={data} /> : null}
        </Box>
      </StartFlexBox>
    </CssBaseline>
  );
};
export default Tags;
