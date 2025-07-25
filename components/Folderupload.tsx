import React from 'react';
// Make sure to adjust the import path for your icon
import { IconFolderPlus } from '@tabler/icons-react';

// Define the component's props

interface FolderUploadButtonProps {
  handleFolderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Use React.forwardRef to allow parent components to pass a ref to the <input>
const FolderUploadButton = React.forwardRef<HTMLInputElement, FolderUploadButtonProps>(
  ({ handleFolderChange }, ref) => {
    return (
      <>
        <IconFolderPlus className="size-4" />
        <span>Folder</span>
        <input
          ref={ref}
          type="file"
          // @ts-ignore - webkitdirectory is non-standard but widely supported
          webkitdirectory="true"
          directory=""
          multiple
          style={{ display: 'none' }}
          onChange={handleFolderChange}
          tabIndex={-1} // Prevents the hidden input from being focused by tabbing
        />
      </>
    );
  }
);

// Assigning a display name is good practice for debugging
FolderUploadButton.displayName = 'FolderUploadButton';

export default FolderUploadButton;