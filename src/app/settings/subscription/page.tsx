'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Divider,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Spinner,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { getSubscriptionDetails, getSubscriptionHistory, cancelSubscription } from '../../../services/subscriptionService';
import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface SubscriptionHistoryItem {
  id: string;
  payment_reference: string;
  amount: number;
  payment_status: 'successful' | 'failed' | 'pending' | 'refunded';
  payment_date: string;
  plan_type: string;
  payment_method?: string;
  transaction_id?: string;
}

interface PaginatedHistory {
  total: number;
  items: SubscriptionHistoryItem[];
}

const SubscriptionManagementPage = () => {
  const router = useRouter();
  const { subscriptionDetails, isPremium, token } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<any>(null);
  const [history, setHistory] = useState<PaginatedHistory | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cancellation modal state
  const { isOpen: isCancelModalOpen, onOpen: openCancelModal, onClose: closeCancelModal } = useDisclosure();
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  
  // Pre-defined cancellation reasons
  const cancellationReasons = [
    "Too expensive",
    "Not using premium features",
    "Found a better alternative",
    "Technical issues",
    "Other (please specify)"
  ];

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const detailsData = await getSubscriptionDetails();
        setDetails(detailsData);
        setLoading(false);
        
        // Fetch history if user has a subscription
        if (detailsData.planType === 'premium') {
          fetchHistory(1);
        }
      } catch (err) {
        setError('Failed to load subscription details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, router]);
  
  const fetchHistory = async (page: number) => {
    try {
      setHistoryLoading(true);
      const historyData = await getSubscriptionHistory(page, 5);
      setHistory(historyData);
      setHistoryPage(page);
      setHistoryLoading(false);
    } catch (err) {
      setError('Failed to load subscription history. Please try again later.');
      setHistoryLoading(false);
    }
  };
  
  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const reasonToSubmit = selectedReason === 'Other (please specify)' 
        ? cancellationReason 
        : selectedReason;
      
      await cancelSubscription(reasonToSubmit);
      setCancelSuccess(true);
      
      // Refresh subscription details
      const updatedDetails = await getSubscriptionDetails();
      setDetails(updatedDetails);
      
      setTimeout(() => {
        closeCancelModal();
        setCancelSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to cancel subscription. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toFixed(2)}`;
  };
  
  const getStatusBadgeColorScheme = (status: string) => {
    switch (status) {
      case 'successful': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      case 'refunded': return 'blue';
      default: return 'gray';
    }
  };

  // Custom pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    return (
      <Flex justify="center" align="center" mt={4}>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage <= 1}
          mr={2}
        >
          <ChevronLeftIcon />
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
          ml={2}
        >
          <ChevronRightIcon />
        </Button>
      </Flex>
    );
  };
  
  if (loading) {
    return (
      <Box p={4}>
        <Heading size="lg" mb={4}>
          Subscription Management
        </Heading>
        <Card>
          <CardBody>
            <Stack spacing={4}>
              <Skeleton height="60px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" width="60%" />
            </Stack>
          </CardBody>
        </Card>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Heading size="lg" mb={4}>
        Subscription Management
      </Heading>
      
      {error && (
        <Alert status="error" mb={3}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card mb={4} bg={cardBg} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Current Plan</Heading>
          <Divider mt={2} />
        </CardHeader>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flex={1}>
              <Text fontWeight="medium">
                Plan: <Badge colorScheme={details?.planType === 'premium' ? 'purple' : 'gray'} ml={1}>
                  {details?.planType === 'premium' ? 'Premium' : 'Free'}
                </Badge>
              </Text>
              
              {details?.planType === 'premium' && (
                <>
                  <Text fontWeight="medium" mt={2}>
                    Start Date: {formatDate(details?.startDate)}
                  </Text>
                  <Text fontWeight="medium" mt={2}>
                    Expiry Date: {formatDate(details?.expiryDate)}
                  </Text>
                  <Text fontWeight="medium" mt={2}>
                    Remaining Days: {details?.remainingDays || 0}
                  </Text>
                  <Text fontWeight="medium" mt={2}>
                    Auto-Renew: {details?.autoRenew ? 'Yes' : 'No'}
                  </Text>
                  
                  {details?.cancellationDate && (
                    <Alert status="warning" mt={4}>
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">
                          Subscription will end on {formatDate(details?.expiryDate)}
                        </Text>
                        <Text fontSize="sm">
                          Cancelled on: {formatDate(details?.cancellationDate)}
                        </Text>
                        {details?.cancellationReason && (
                          <Text fontSize="sm">
                            Reason: {details.cancellationReason}
                          </Text>
                        )}
                      </Box>
                    </Alert>
                  )}
                </>
              )}
            </Box>
            
            <Flex direction="column" justify="center" align={{ base: 'flex-start', md: 'flex-end' }} mt={{ base: 4, md: 0 }}>
              {details?.planType === 'premium' && !details?.cancellationDate && (
                <Button 
                  variant="outline" 
                  colorScheme="red" 
                  onClick={openCancelModal}
                >
                  Cancel Subscription
                </Button>
              )}
              
              {details?.planType === 'free' && (
                <Button 
                  colorScheme="brand" 
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade to Premium
                </Button>
              )}
              
              {details?.planType === 'premium' && details?.cancellationDate && (
                <Button 
                  colorScheme="brand" 
                  onClick={() => router.push('/pricing')}
                >
                  Renew Subscription
                </Button>
              )}
            </Flex>
          </Flex>
        </CardBody>
      </Card>
      
      {details?.planType === 'premium' && (
        <Card bg={cardBg} boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Payment History</Heading>
            <Divider mt={2} />
          </CardHeader>
          <CardBody>
            {historyLoading ? (
              <Flex justify="center" p={6}>
                <Spinner size="xl" />
              </Flex>
            ) : history && history.items.length > 0 ? (
              <>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Reference</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Payment Method</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {history.items.map((item) => (
                        <Tr key={item.id}>
                          <Td>{formatDate(item.payment_date)}</Td>
                          <Td>{item.payment_reference}</Td>
                          <Td>{formatCurrency(item.amount)}</Td>
                          <Td>
                            <Badge colorScheme={getStatusBadgeColorScheme(item.payment_status)}>
                              {item.payment_status}
                            </Badge>
                          </Td>
                          <Td>{item.payment_method || 'Card'}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                
                {history.total > 5 && (
                  <Pagination 
                    currentPage={historyPage}
                    totalPages={Math.ceil(history.total / 5)}
                    onPageChange={(page) => fetchHistory(page)}
                  />
                )}
              </>
            ) : (
              <Text textAlign="center" py={6}>
                No payment history found.
              </Text>
            )}
          </CardBody>
        </Card>
      )}
      
      {/* Cancellation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => !isCancelling && closeCancelModal()}>
        <ModalOverlay />
        <ModalContent mx={4}>
          {cancelSuccess ? (
            <Box p={6} textAlign="center">
              <Heading size="md" color="green.500" mb={2}>
                Subscription Cancelled Successfully
              </Heading>
              <Text>
                Your subscription will remain active until {formatDate(details?.expiryDate)}.
              </Text>
            </Box>
          ) : (
            <>
              <ModalHeader>Cancel Subscription</ModalHeader>
              <ModalCloseButton isDisabled={isCancelling} />
              <ModalBody>
                <Text mb={4}>
                  Your subscription will remain active until the end of your current billing period ({formatDate(details?.expiryDate)}), but will not renew afterward.
                </Text>
                
                <FormControl mb={4}>
                  <FormLabel>Reason for cancellation:</FormLabel>
                  <RadioGroup value={selectedReason} onChange={(value) => setSelectedReason(value)}>
                    <Stack>
                      {cancellationReasons.map((reason) => (
                        <Radio key={reason} value={reason}>
                          {reason}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>
                
                {selectedReason === 'Other (please specify)' && (
                  <Textarea
                    placeholder="Please specify your reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    mb={4}
                  />
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  variant="ghost" 
                  mr={3} 
                  onClick={closeCancelModal}
                  isDisabled={isCancelling}
                >
                  Keep Subscription
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleCancel}
                  isDisabled={isCancelling || (selectedReason === 'Other (please specify)' && !cancellationReason)}
                  isLoading={isCancelling}
                  loadingText="Cancelling"
                >
                  Cancel Subscription
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionManagementPage; 