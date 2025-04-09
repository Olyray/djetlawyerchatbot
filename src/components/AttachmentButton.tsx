import React, { useState, useRef } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useToast,
  Tooltip
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

interface AttachmentButtonProps {
  onFileAttached: (attachmentId: string, fileName: string, fileType: string) => void;
  disabled?: boolean;
}

const AttachmentButton: React.FC<AttachmentButtonProps> = ({ 
  onFileAttached,
  disabled = false
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isUploading, setIsUploading] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  
  const handleDocumentUpload = () => {
    documentInputRef.current?.click();
  };
  
  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };
  
  const handleCameraCapture = () => {
    // Set accept to image/* and capture to environment
    // This will open the camera on mobile devices
    const input = imageInputRef.current;
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
      input.removeAttribute('capture');
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'document' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/attachments/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      onFileAttached(
        response.data.id,
        response.data.file_name,
        response.data.file_type
      );
    } catch (error) {
      console.error('File upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };
  
  return (
    <>
      <Menu>
        <Tooltip label="Attach files">
          <MenuButton
            as={IconButton}
            aria-label="Attach files"
            icon={<Icon icon="ph:paperclip" />}
            variant="ghost"
            isLoading={isUploading}
            isDisabled={disabled}
            colorScheme="brand"
          />
        </Tooltip>
        <MenuList>
          <MenuItem icon={<Icon icon="ph:file-doc" />} onClick={handleDocumentUpload}>
            Attach Document
          </MenuItem>
          <MenuItem icon={<Icon icon="ph:image-square" />} onClick={handleImageUpload}>
            Upload Image
          </MenuItem>
          <MenuItem icon={<Icon icon="ph:camera" />} onClick={handleCameraCapture}>
            Take Photo
          </MenuItem>
        </MenuList>
      </Menu>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={documentInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileChange(e, 'document')}
      />
      <input
        type="file"
        ref={imageInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
      />
    </>
  );
};

export default AttachmentButton; 