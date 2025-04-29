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
import { useSubscription } from '../hooks/useSubscription';
import { useSubscriptionPrompt } from '../contexts/SubscriptionContext';

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
  
  // Use subscription hooks - now using a single subscription hook for all feature types
  const { showSubscriptionPrompt } = useSubscriptionPrompt();
  const { isPremium, refreshSubscription } = useSubscription();
  
  // Check premium status for a specific feature type
  const checkPremiumFeature = async (featureType: 'document' | 'image' | 'camera' | 'audio') => {
    // Refresh subscription only when a premium feature is attempted
    await refreshSubscription();
    
    if (!isPremium) {
      showSubscriptionPrompt(featureType);
      return false;
    }
    return true;
  };
  
  // Modified to check premium status before proceeding
  const handleDocumentUpload = async () => {
    const canProceed = await checkPremiumFeature('document');
    if (canProceed) {
      documentInputRef.current?.click();
    }
  };
  
  // Modified to check premium status before proceeding
  const handleImageUpload = async () => {
    const canProceed = await checkPremiumFeature('image');
    if (canProceed) {
      imageInputRef.current?.click();
    }
  };
  
  // Modified to check premium status before proceeding
  const handleCameraCapture = async () => {
    const canProceed = await checkPremiumFeature('camera');
    if (canProceed) {
      // Set accept to image/* and capture to environment
      // This will open the camera on mobile devices
      const input = imageInputRef.current;
      if (input) {
        input.setAttribute('capture', 'environment');
        input.click();
        input.removeAttribute('capture');
      }
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
    } catch (error: any) {
      console.error('File upload failed:', error);
      
      // Check for 403 error which indicates premium feature access denied
      if (error.response && error.response.status === 403) {
        // Show the subscription prompt
        showSubscriptionPrompt(fileType);
        toast({
          title: 'Premium feature',
          description: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploads require a premium subscription.`,
          status: 'info',
          duration: 5000,
          isClosable: true
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload file. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
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
          <MenuItem 
            icon={<Icon icon="ph:file-doc" />} 
            onClick={handleDocumentUpload}
            closeOnSelect={true}
          >
            Attach Document
            {!isPremium && <Icon icon="ph:crown" style={{ marginLeft: '8px', color: '#f4965c' }} />}
          </MenuItem>
          <MenuItem 
            icon={<Icon icon="ph:image-square" />} 
            onClick={handleImageUpload}
            closeOnSelect={true}
          >
            Upload Image
            {!isPremium && <Icon icon="ph:crown" style={{ marginLeft: '8px', color: '#f4965c' }} />}
          </MenuItem>
          <MenuItem 
            icon={<Icon icon="ph:camera" />} 
            onClick={handleCameraCapture}
            closeOnSelect={true}
          >
            Take Photo
            {!isPremium && <Icon icon="ph:crown" style={{ marginLeft: '8px', color: '#f4965c' }} />}
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