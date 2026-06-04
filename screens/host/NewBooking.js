import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import PropertyDetails from './CreateBookingContents/PropertyDetails';
import { AuthContext } from '../../context/AuthContext';
import Duration from './CreateBookingContents/Duration';
import CleaningTask from './CreateBookingContents/CleaningTask';
import Review from './CreateBookingContents/Review';
import { AntDesign } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import * as Animatable from 'react-native-animatable';
import { useBookingContext } from '../../context/BookingContext';
import { useNavigation } from '@react-navigation/native';
import userService from '../../services/connection/userService';
import { calculateCleaningTimeByTasks } from '../../utils/calculateCleaningTimeByTasks';
import ROUTES from '../../constants/routes';
import StepsIndicator from '../../components/shared/StepsIndicator';
import { before_photos, checklist } from '../../utils/tasks_photo';
import HeaderWithStatusBarAndClose from '../../components/shared/HeaderWithStatusBarAndClose';
import { addExtraCleaningTasks } from '../../utils/addExtraCleaningTasks';
import Toast from 'react-native-toast-message';
import { formatDateToYYYYMMDD } from '../../utils/formatDate';
import { tSafe } from '../../utils/tSafe';

const NewBooking = ({ schedule, close_modal, mode }) => {
  const { currency, currentUser, currentUserId } = useContext(AuthContext);
  const { formData, setFormData, setModalVisible, modalVisible, resetFormData, handleCreateSchedule } = useBookingContext();
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [extras, setExtras] = useState([]);
  const [checkList, setChecklist] = useState([]);
  const [updated_task_checklist, setUpdatedTaskChecklist] = useState([]);

  // Validation states
  const [stepValidations, setStepValidations] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: true
  });
  const validationRef = useRef({
    step1: false,
    step2: false,
    step3: false,
    step4: true
  });

  // Refs for tracking
  const checklistCreatedRef = useRef(false);
  const prevFormDataRef = useRef({});

  // Job tracking states
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [jobProgress, setJobProgress] = useState('');
  const [pollingComplete, setPollingComplete] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [currentJobId, setCurrentJobId] = useState(null);

  // Interval ref for cleanup
  const pollingIntervalRef = useRef(null);

  const taskTimes = {
    "Window Washing": 20,
    "Inside Cabinets": 15,
    "Carpet Cleaning": 30,
    "Upholstery Cleaning": 20,
    "Tile & Grout Cleaning": 50,
    "Hardwood Floor Refinishing": 50,
    "Inside Fridge": 5,
    "Inside Oven": 30,
    "Pet Cleanup": 20,
    "Dishwasher": 30,
    "Laundry": 30,
    "Exterior": 120,
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Form change effect
  useEffect(() => {
    if (prevFormDataRef.current.aptId !== formData.aptId ||
        prevFormDataRef.current.checklistId !== formData.checklistId ||
        prevFormDataRef.current.checklists?.length !== formData.checklists?.length) {
      if (step === 1) {
        const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
        const isValid = formData.aptId && hasChecklist;
        validateForm(isValid);
      }
      prevFormDataRef.current = {
        aptId: formData.aptId,
        checklistId: formData.checklistId,
        checklists: formData.checklists
      };
    }
  }, [formData.aptId, formData.checklistId, formData.checklists, step]);

  // Modal open/close effect
  useEffect(() => {
    if (schedule && !formData.cleaning_date) {
      setFormData(schedule.schedule);
    }
    if (modalVisible) {
      checklistCreatedRef.current = false;
      if (step === 1 && formData.aptId) {
        const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
        validateForm(formData.aptId && hasChecklist);
      }
    }
    if (!modalVisible) {
      validationRef.current = { step1: false, step2: false, step3: false, step4: true };
      setStepValidations({ step1: false, step2: false, step3: false, step4: true });
      prevFormDataRef.current = {};
    }
  }, [schedule, modalVisible, mode, resetFormData, setFormData]);

  // Log step changes
  useEffect(() => {
    console.log(`Step changed to ${step}, validation:`, validationRef.current[`step${step}`]);
  }, [step]);

  // Validation helper
  const validateForm = useCallback((isFormValid) => {
    validationRef.current[`step${step}`] = isFormValid;
    setStepValidations(prev => ({ ...prev, [`step${step}`]: isFormValid }));
  }, [step]);

  const forceStep1Validation = useCallback(() => {
    if (step === 1) {
      const hasChecklist = formData.checklistId || (formData.checklists && formData.checklists.length > 0);
      validateForm(formData.aptId && hasChecklist);
    }
  }, [step, formData.aptId, formData.checklistId, formData.checklists, validateForm]);

  const resetSubsequentStepsValidation = useCallback((fromStep) => {
    for (let i = fromStep + 1; i <= 3; i++) {
      validationRef.current[`step${i}`] = false;
      setStepValidations(prev => ({ ...prev, [`step${i}`]: false }));
    }
  }, []);

  const getCurrentStepValidation = useCallback(() => {
    return validationRef.current[`step${step}`];
  }, [step]);

  // Checklist callback
  const handleChecklistCreatedCallback = useCallback((checklistData) => {
    checklistCreatedRef.current = true;
    setTimeout(() => forceStep1Validation(), 100);
  }, [forceStep1Validation]);

  // Form handlers
  const handleOnCleaningTime = useCallback((value) => {
    setFormData(prev => ({ ...prev, cleaning_time: value }));
  }, [setFormData]);

  const handleOnCleaningDate = useCallback((value) => {
    setFormData(prev => ({ ...prev, cleaning_date: value }));
  }, [setFormData]);

  const handleSelectedProperty = useCallback((text, input) => {
    setFormData(prev => ({ ...prev, [input]: text }));
  }, [setFormData]);

  const handleCleanignExtraSelection = useCallback((selectedExtras) => {
    setExtras(selectedExtras);
  }, []);

  const handleExtraTaskTime = useCallback((extra_task, input) => {
    const extraCleaningTime = calculateCleaningTimeByTasks(extra_task, taskTimes);
    setFormData(prev => ({ ...prev, [input]: extraCleaningTime }));
  }, [setFormData]);

  const handleTotalTaskTime = useCallback((totalTime, input) => {
    setFormData(prev => ({ ...prev, [input]: totalTime }));
  }, [setFormData]);

  const handleBedroomBathroom = useCallback((text, input) => {
    setFormData(prev => ({ ...prev, [input]: text }));
  }, [setFormData]);

  const handleNextStep = useCallback(() => {
    if (getCurrentStepValidation()) {
      setStep(prev => prev + 1);
    }
  }, [getCurrentStepValidation]);

  const handlePrevStep = useCallback(() => {
    if (step > 1) setStep(prev => prev - 1);
  }, [step]);

  const handleEditStep = useCallback((stp) => {
    setStep(stp);
  }, []);

  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    resetFormData();
  }, [setModalVisible, resetFormData]);

  const handlePropertyChange = useCallback((newPropertyData) => {
    resetSubsequentStepsValidation(1);
    setFormData(prev => ({
      ...prev,
      ...newPropertyData,
      cleaning_date: '',
      cleaning_time: '',
      cleaning_end_time: '',
      total_cleaning_fee: newPropertyData.regular_cleaning_fee || 0,
      total_cleaning_time: newPropertyData.regular_cleaning_time || 0
    }));
    setTimeout(() => forceStep1Validation(), 100);
  }, [resetSubsequentStepsValidation, setFormData, forceStep1Validation]);

  const createTaskChecklist = useCallback(() => {
    if (formData.extra && formData.extra.length > 0) {
      const formattedExtras = formData.extra.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));
      const cleanedArray = formattedExtras.map(service => {
        const { icon, price, ...valueWithoutIconAndPrice } = service.value;
        return { ...service, value: valueWithoutIconAndPrice };
      });
      const formattedRegular = formData.regular_cleaning.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      }));
      setUpdatedTaskChecklist([...cleanedArray, ...formattedRegular]);
    } else {
      const formattedRegular = formData.regular_cleaning?.map((item, index) => ({
        id: index + 1,
        label: item.label,
        value: item
      })) || [];
      setUpdatedTaskChecklist(formattedRegular);
    }
  }, [formData.extra, formData.regular_cleaning]);

  // Polling function
  const startJobPolling = useCallback(async (jobId) => {
    setCurrentJobId(jobId);
    
    setIsPolling(true);
    setPollingComplete(false);
    setPollingError(null);
    

    let pollCount = 0;
    const maxPolls = 60;

    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      try {
        const response = await userService.getJobStatus(jobId);
        const statusData = response.data;
        setJobStatus(statusData.status);
        

        if (statusData.progress) {
          const progress = statusData.progress;
          if (progress.percentage !== undefined) setProgressPercentage(progress.percentage);
          if (progress.current_action) {
            setJobProgress(progress.current_action);
          } else if (progress.current_stage) {
            const stageMessages = {
              'starting': tSafe('job_starting', '🔄 Starting schedule processing...'),
              'finding_cleaners': tSafe('job_finding_cleaners', '🔍 Finding available cleaners in your area...'),
              'sending_host_notification': tSafe('job_sending_host_notification', '📧 Sending confirmation...'),
              'sending_cleaner_requests': tSafe('job_sending_cleaner_requests', '📨 Notifying available cleaners...'),
              'completed': tSafe('job_completed', '✅ All tasks completed! Redirecting...'),
              'error': tSafe('job_error', '❌ An error occurred')
            };
            setJobProgress(stageMessages[progress.current_stage] || progress.current_stage);
          }
          if (progress.cleaners_found !== undefined) {
            setAdditionalInfo(tSafe('found_cleaners', 'Found {count} cleaners', { count: progress.cleaners_found }));
          }
          if (progress.notifications_sent !== undefined) {
            setAdditionalInfo(tSafe('notified_cleaners', 'Notified {count} cleaners', { count: progress.notifications_sent }));
          }
          
        } else {
          switch (statusData.status) {
            case 'queued':
              setJobProgress(tSafe('job_queued', '🔄 Your schedule is in queue...'));
              setProgressPercentage(0);
              break;
            case 'started':
              setJobProgress(tSafe('job_started', '🔄 Processing your schedule...'));
              setProgressPercentage(25);
              break;
            case 'finished':
              setJobProgress(tSafe('job_finished', '✅ All tasks completed! Redirecting...'));
              setProgressPercentage(100);
              break;
            case 'failed':
              setJobProgress(tSafe('job_failed', '❌ We encountered an issue.'));
              setProgressPercentage(0);
              break;
          }
        }

        // if (statusData.status === 'finished') {
        //   setPollingComplete(true);
        //   clearInterval(pollingIntervalRef.current);
        //   pollingIntervalRef.current = null;
        //   setTimeout(() => {
        //     validationRef.current = { step1: false, step2: false, step3: false, step4: true };
        //     setStepValidations({ step1: false, step2: false, step3: false, step4: true });
        //     setIsPolling(false);
        //     handleCreateSchedule(false);
        //     navigation.navigate(ROUTES.host_home_tab);
        //   }, 2000);
        // }


        if (statusData.status === 'finished') {
          setPollingComplete(true);
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setTimeout(() => {
            // 1️⃣ Close the modal and reset context
            handleCreateSchedule(false);   // this should close the modal
            // 2️⃣ Wait a tiny bit for the modal to disappear
            setTimeout(() => {
              setIsPolling(false);
              // 3️⃣ Replace the modal stack with the host home tab
              navigation.replace(ROUTES.host_home_tab);
            }, 300);
          }, 2000);
        }

        if (statusData.status === 'failed') {
          setPollingError(tSafe('job_failed_error', 'Job failed'));
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsPolling(false);
        }

        // if (pollCount >= maxPolls) {
        //   clearInterval(pollingIntervalRef.current);
        //   pollingIntervalRef.current = null;
        //   setJobProgress(tSafe('job_timeout', '✅ Schedule created! Some tasks may still be processing.'));
        //   setPollingComplete(true);
        //   setPollingError(tSafe('job_timeout_error', 'Processing took longer than expected'));
        //   setTimeout(() => {
        //     validationRef.current = { step1: false, step2: false, step3: false, step4: true };
        //     setStepValidations({ step1: false, step2: false, step3: false, step4: true });
        //     setIsPolling(false);
        //     handleCreateSchedule(false);
            
        //     console.log('Navigating to:', ROUTES.host_home_tab);
        //     navigation.navigate(ROUTES.host_home_tab);
        //   }, 2000);
        // }

        if (pollCount >= maxPolls) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setPollingComplete(true);
          setTimeout(() => {
            handleCreateSchedule(false);
            setTimeout(() => {
              setIsPolling(false);
              navigation.replace(ROUTES.host_home_tab);
            }, 300);
          }, 2000);
        }
      } catch (error) {
        console.log('Polling error:', error);
        // if (error.response?.status === 404 && pollCount > 2) {
        //   setJobProgress(tSafe('job_completed_processing', '✅ Schedule processing completed!'));
        //   setPollingComplete(true);
        //   clearInterval(pollingIntervalRef.current);
        //   pollingIntervalRef.current = null;
        //   setTimeout(() => {
        //     validationRef.current = { step1: false, step2: false, step3: false, step4: true };
        //     setStepValidations({ step1: false, step2: false, step3: false, step4: true });
        //     setIsPolling(false);
        //     handleCreateSchedule(false);
        //     navigation.navigate(ROUTES.host_home_tab);
        //   }, 2000);
        // }
        if (error.response?.status === 404 && pollCount > 2) {
          setJobProgress(tSafe('job_completed_processing', '✅ Schedule processing completed!'));
          setPollingComplete(true);
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setTimeout(() => {
            handleCreateSchedule(false);
            setTimeout(() => {
              setIsPolling(false);
              navigation.replace(ROUTES.host_home_tab);
            }, 300);
          }, 2000);
        }
        
      }
    }, 3000);
  }, [handleCreateSchedule, navigation]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    const formattedData = {
      ...formData,
      cleaning_date: formatDateToYYYYMMDD(formData.cleaning_date)
    };
    const updatedChecklist = addExtraCleaningTasks(checklist, formattedData.extra);
    const data = {
      hostInfo: currentUser,
      schedule: formattedData,
      checklist: updatedChecklist,
      before_photos: before_photos
    };

    try {
      const response = await userService.createSchedule(data);
      if (response.status === 200) {
        const job_id = response.data.job_id;
        Toast.show({ type: 'success', text1: tSafe('schedule_created', 'Schedule created! Processing notifications...') });
        startJobPolling(job_id);
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (err) {
      console.log(err);
      Toast.show({ type: 'error', text1: tSafe('error_title', 'Something went wrong'), text2: tSafe('try_again', 'Please try again') });
      setIsPolling(false);
    }
  }, [formData, checklist, currentUser, startJobPolling]);

  const handleManualRedirect = useCallback(() => {
    validationRef.current = { step1: false, step2: false, step3: false, step4: true };
    setStepValidations({ step1: false, step2: false, step3: false, step4: true });
    setIsPolling(false);
    handleCreateSchedule(false);
    navigation.replace(ROUTES.host_home_tab);
  }, [handleCreateSchedule, navigation]);

  // Render
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <HeaderWithStatusBarAndClose
          title={isPolling ? tSafe('creating_schedule', 'Creating Schedule...') : tSafe('create_schedule', 'Create Schedule')}
          onClose={handleClose}
        />
        <StepsIndicator step={step} />

        {!isPolling && !getCurrentStepValidation() && step < 4 && (
          <View style={styles.validationBanner}>
            <AntDesign name="exclamationcircle" size={16} color="#fff" />
            <Text style={styles.validationText}>
              {step === 1
                ? tSafe('validation_step1', 'Please select a property and ensure it has a checklist')
                : tSafe('validation_general', 'Please fill in all required fields to continue')}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          {isPolling ? (
            <View style={styles.pollingContainer}>
              <View style={styles.pollingContent}>
                <ActivityIndicator size="large" color={COLORS.primary} style={styles.pollingSpinner} />
                <Text style={styles.pollingTitle}>{tSafe('setting_up_schedule', 'Setting up your schedule')}</Text>
                <Text style={styles.pollingText}>{jobProgress}</Text>
                {jobStatus === 'started' && (
                  <Text style={styles.pollingHint}>
                    {tSafe('polling_hint', 'This usually takes 10-30 seconds as we find the best cleaners near you')}
                  </Text>
                )}
                {pollingError && <Text style={styles.pollingErrorText}>{pollingError}</Text>}
                {pollingComplete && (
                  <View style={styles.pollingCompleteSection}>
                    <AntDesign name="checkcircle" size={24} color="#4CAF50" />
                    <Text style={styles.pollingCompleteText}>{tSafe('all_done_redirecting', 'All done! Redirecting...')}</Text>
                  </View>
                )}
                {(jobStatus === 'queued' || jobStatus === 'started') && (
                  <TouchableOpacity style={styles.pollingManualButton} onPress={handleManualRedirect}>
                    <Text style={styles.pollingManualText}>{tSafe('continue_to_dashboard', 'Continue to dashboard')}</Text>
                    <Text style={styles.pollingManualSubtext}>
                      {tSafe('notifications_background', '(Notifications will continue in background)')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              {step === 1 && (
                <Animatable.View animation="slideInRight" duration={550}>
                  <PropertyDetails
                    selectedProperty={handleSelectedProperty}
                    formData={formData}
                    setFormData={setFormData}
                    validateForm={validateForm}
                    onPropertyChange={handlePropertyChange}
                    navigation={navigation}
                    onChecklistCreated={handleChecklistCreatedCallback}
                  />
                </Animatable.View>
              )}
              {step === 2 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <Duration
                    getCleanTime={handleOnCleaningTime}
                    getCleanDate={handleOnCleaningDate}
                    formData={formData}
                    setFormData={setFormData}
                    validateForm={validateForm}
                  />
                </Animatable.View>
              )}
              {step === 3 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <CleaningTask
                    onExtraSelect={handleCleanignExtraSelection}
                    extraTasks={handleExtraTaskTime}
                    totalTaskTime={handleTotalTaskTime}
                    roomBathChange={handleBedroomBathroom}
                    formData={formData}
                    setFormData={setFormData}
                    extras={extras}
                    validateForm={validateForm}
                  />
                </Animatable.View>
              )}
              {step === 4 && (
                <Animatable.View animation="slideInRight" duration={600}>
                  <Review
                    onExtraSelect={handleCleanignExtraSelection}
                    formData={formData}
                    setFormData={setFormData}
                    extras={extras}
                    validateForm={validateForm}
                    step={handleEditStep}
                  />
                </Animatable.View>
              )}
            </View>
          )}
        </View>

        {!isPolling && (
          <View style={styles.footerSticky}>
            <View style={styles.buttonRow}>
              {step > 1 && (
                <TouchableOpacity style={styles.previous_button} onPress={handlePrevStep}>
                  <View style={styles.previous_icon}>
                    <AntDesign name="caretleft" size={20} color={COLORS.gray} />
                    <Text style={styles.previous_buttonText}>{tSafe('previous', ' Previous')}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              {step < 4 ? (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    getCurrentStepValidation() ? styles.validButton : styles.invalidButton,
                  ]}
                  onPress={handleNextStep}
                  disabled={!getCurrentStepValidation()}
                >
                  <Text style={styles.buttonText}>{tSafe('next', 'Next')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isPolling}>
                  <Text style={styles.buttonText}>{tSafe('save_publish', 'Save & Publish')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  validationBanner: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  validationText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  pollingContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  pollingContent: {
    alignItems: 'center',
    width: '100%',
  },
  pollingSpinner: {
    marginBottom: 25,
  },
  pollingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  pollingText: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  pollingHint: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 18,
  },
  pollingErrorText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  pollingCompleteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  pollingCompleteText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
  },
  pollingManualButton: {
    marginTop: 25,
    padding: 15,
    backgroundColor: COLORS.light_gray_1,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  pollingManualText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pollingManualSubtext: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  footerSticky: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray_1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  previous_button: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  previous_buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previous_icon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    minWidth: 120,
    alignItems: 'center',
  },
  validButton: {
    backgroundColor: COLORS.primary,
  },
  invalidButton: {
    backgroundColor: 'gray',
  },
});

export default NewBooking;