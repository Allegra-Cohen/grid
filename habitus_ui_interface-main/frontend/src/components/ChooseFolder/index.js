import { Icon } from '@iconify/react';
import { Button } from 'components';
import React from 'react';
import './styles.css'

const ChooseFolder = ({ onChange, label, placeholder, variable }) => {

  return (
    <div>
      <div className='center-component'>
        <div className='input-create'>
          <div className='label' >
            {label}
          </div>
          <div className="provide-fileName">
            *Please provide a file
          </div>
        </div>
      </div>
      <div className='center-component'>
        <div className='input-text'>
          <label htmlFor="file-upload" className="custom-file-input-label">
            <Icon icon="solar:file-outline" width="20" height="20" />
            <div>Choose File</div>
          </label>
          <span className="custom-file-name" id="file-name">{placeholder}</span>
          <input type="file" id={variable} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};

export default ChooseFolder;

