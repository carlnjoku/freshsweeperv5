import http from './http-commons';
// import urlencode from 'urlencode';
class UserService {
    userLogin(data) {
      return http.post('/api/auth/login', data);
    }
    updatePhoneAndLocation(data) {
      return http.put('/api/users/update_phone_location', data);
    }

    changePassword(data) {
      return http.post('/api/auth/change_password', data);
    }
    
    requestPasswordReset(data){
      return http.post('/api/auth/request_password_reset', data)
    }

    resetPassword(data){
      return http.post('/api/auth/reset-password', data)
    }
    

  
  
    
    createUser(data) {
      return http.post('/api/users/', data);
    }
    getUser(id) {
      return http.get(`/api/users/${id}`);
    }
    getUsers() {
      return http.get('/api/users/');
    }

    updateCleanerContact(data){
      return http.put('/api/users/update_cleaner_contact', data)
    }
    updateCleanerAbout(data){
      return http.put('/api/users/update_cleaner_aboutme', data)
    }
    updateCleanerCertification(data){
      return http.put('/api/users/update_cleaner_certification', data)
    }
    updateAvailability(data){
      return http.put('/api/users/update_cleaner_availability', data)
    }

    getCleanerAvailability(cleanerId){
      return http.get(`/api/users/get_cleaner_availability/${cleanerId}`)
    }
  
    logOut(data) {
      return http.put('/api/users/logout', data);
    }
  
    addApartment(data){
      return http.post('/api/apartments/add_apartment', data)
    }
    updateApartment(data){
      return http.put('/api/apartments/update_apartment', data)
    }

    getApartment(userId){
      return http.get(`/api/apartments/get_host_apartments/${userId}`)
    }
    getApartmentById(aptId){
      return http.get(`/api/apartments/get_apartment_by_id/${aptId}`)
    }
  
    acceptInviteOnSignup(payload){
      return http.post('/api/apartments/accept_invite_on_signup', payload);
    }

    acceptInvite(authToken, inviteToken){

      return http.post(
        '/api/apartments/accept_invite',
        { token: inviteToken },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    
    }

    
    getClanersAssignedByApartmentIds(aptId){
      return http.get(`/api/apartments/get_cleaner_assigned_to_apartments/${aptId}`)
    }

    getCustomChecklistsByProperty(checklist){
      return http.post('/api/apartments/get_checklist_by_property', checklist)
    }
    updatePropertyWithChecklist(propertyId, updateData){
      return http.put(`/api/apartments/update_property_checklist/${propertyId}`, updateData)
    }

    createSyncCalendar(data){
      return http.post('/api/apartments/create_ical_sync', data)
    }
    updateCalendar(data){
      return http.put('/api/apartments/update_ical_sync', data)
    }

    getSyncedCalsByApartmentIds(aptId){
      return http.get(`/api/apartments/get_sync_calendar/${aptId}`)
    }
    
    saveChecklist(data){
      return http.post('/api/schedules/create_checklist', data)
    }
    
    
    deleteChecklist(chlistId, token) {
      return http.delete(
        `/api/schedules/delete_checklist/${chlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
    

    getChecklists(hostId){
      return http.get(`/api/schedules/get_checklists/${hostId}`)
    }
    
    getChecklistById(checklisId){
      return http.get(`/api/schedules/get_checklists_checklistId/${checklisId}`)
    }

    createSchedule(data){
      return http.post('/api/schedules/create_schedule', data)
    }
    updateSchedule(data){
      return http.put('/api/schedules/update_schedule', data)
    }

    getSchedulesByHostId(hostId){
      return http.get(`/api/schedules/get_host_schedules/${hostId}`)
    }


    getSchedulesAssignedToCleaner(cleanerId){
      return http.get(`/api/schedules/get_schedules_assigned_to_cleaner/${cleanerId}`)
    }
    getUpcomingSchedulesByHostId(hostId){
      return http.get(`/api/schedules/get_host_upcoming_schedules/${hostId}`)
    }

    getPaymentsByHostId(hostId){
      return http.get(`/api/schedules/get_all_payment_history/${hostId}`)
    }
    
    approveSchedule(data){
      return http.put('/api/schedules/approve_schedule', data)
    }
    clockIn(data){
      return http.post('/api/schedules/clock_in', data)
    }
    getPendingPayments(apartmentId){
      return http.get(`/api/schedules/get_payments/${apartmentId}`)
    }

    getRecommendedCleaners(schedulId){
      return http.get(`/api/recommended_cleaners/get_recommended_cleaners/${schedulId}`)
    }
  
    findCleaners(schedulId){
      return http.get(`/api/recommended_cleaners/find_cleaners/${schedulId}`)
    }

    getPlatformCleaners(data){
      return http.post(`/api/recommended_cleaners/get_platform_cleaners`, data)
    }

  
    getMyCleaningRequest(cleanerId){
      return http.get(`/api/schedules/get_cleaners_requests/${cleanerId}`);
    }
    getMyCleaningPendingPayment(cleanerId){
      return http.get(`/api/schedules/get_cleaners_pending_payment/${cleanerId}`);
    }
    getAllCleaningRequest(cleanerId){
      return http.get(`/api/schedules/get_all_cleaners_requests/${cleanerId}`);
    }
    getHostCleaningRequest(hostId, currentTime){
      return http.get(`/api/schedules/get_host_requests/${hostId}/${currentTime}`);
    }
    getCleanerEarnings(cleanerId){
      return http.get(`/api/users/earnings/${cleanerId}`);
    }
    getAllCleanerPayments(cleanerId){
      return http.get(`/api/users/payment/${cleanerId}/payments`);
    }
    getHostCleaningRequestByScheduleId(scheduleId, currentTime){
      return http.get(`/api/schedules/get_host_requests_by_scheduleId/${scheduleId}/${currentTime}`);
    }

    getCleanerChatReference(cleanerId, scheduleId){
      return http.get(`/api/schedules/get_cleaner_chat_reference/${cleanerId}/${scheduleId}`)
    }
    
    addApplication(data) {
      return http.post('/api/schedules/add_application', data);
    }

    deleteApplication(applicationId){
      return http.get(`/api/schedules/delete_application/${applicationId}`)
    }
    getAllHostApplications(hostId){
      return http.get(`/api/schedules/get_all_host_applications/${hostId}`)
    }

    getAllCleanerApplications(cleanerId){
      return http.get(`/api/schedules/get_all_cleaner_applications/${cleanerId}`)
    }
    updateApproved(data){
      return http.put('/api/schedules/manual_payment_approval', data)
    }

    approve_completion
    // Profile 
    updateProfile(data) {
      return http.put('/api/users/update_profile', data);
    }
    updateHostProfile(data) {
      return http.put('/api/users/update_host_profile', data);
    }
    // Profile 
    updateProfileAvatar(data) {
      return http.put('/api/users/update_profile_photo', data);
    }
    

    // Upload task photos
    // uploadTaskPhotos(data){
    //   return http.put('/api/task_photos/upload_task_photos', data)
    // }

    uploadTaskPhotos(data) {
      return http.put('/api/task_photos/upload_task_photos', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  
    // Upload task photos
    uploadBeforeTaskPhotos(data){
      return http.put(`/api/task_photos/upload_before_task_photos`, data)
    }
  
    
    // Delete photo
    deleteBeforePhoto(scheduleId, taskTitle, imageUrl) {
      const encodedImageUrl = encodeURIComponent(imageUrl); 
      return http.delete(`/api/task_photos/delete_before_task_photo/${scheduleId}/${taskTitle}?image_url=${encodedImageUrl}`);
  }
   
  deleteSpaceAfterPhoto(data){
    return http.post('/api/task_photos/delete_after_task_photo', data)
  }


    // Upload incident photos
    uploadPhotosIncidentPhotos(data){
      return http.post('/api/task_photos/upload-incident-photos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }})
    }

    sendFeedback(data){
      return http.post('/api/feedbacks/submit_feedback', data)
    }
    getCleanerFeedbacks(cleanerId){
      return http.get(`/api/feedbacks/get_cleaner_feedbacks/${cleanerId}`)
    }

    

    // Stripe connect
    createStripeConnectAccount(data){
      return http.post('/api/stripes/create_connected_account', data)
    }
    getWeeklyEarning(cleanerId){
      return http.get(`/api/stripes/weekly-earnings/${cleanerId}`)
    }
    getWeeklyEarningToDate(cleanerId){
      return http.get(`/api/stripes/weekly-earnings-to-date/${cleanerId}`)
    }
  
    getClientSecret(){
      return http.post(`/api/stripes/create-setup-intent/`)
    }
    fetchSinglePaymentIntentClientSecret(data){
      return http.post('/api/stripes/create-setup-intent-single-payment', data)
    }
    fetchGroupPaymentIntentClientSecret(data){
      return http.post('/api/stripes/create-setup-intent-group-payment', data)
    }
    fetchPaymentIntentClientSecret(data){
      return http.post('/api/stripes/create-setup-intent-outstanding-payment/', data)
    }
    fetchCustomerPaymentMethods(data){
      return http.post('/api/stripes/retrieve-saved-payment-methods', data)
    }

    createLinkUrl(accountId, cleanerId){
      return http.get(`/api/stripes/onboard_cleaner/${accountId}/${cleanerId}`)
    }
    getStatus(accountId){
      return http.get(`/api/stripes/check_account_status/${accountId}`)
    }

    getPaymentsByStripeCustomerId(customer_id){
      return http.get(`/api/stripes/payments/stripe/customer/${customer_id}`)
    }
    
    // Card payment
    createPayment(data){
      return http.post('/api/payments/create-payment-intent', data)
    } 

    // Create verification session
    createVerificationSession(data){
      return http.post('/api/stripes/create-verification-session', data)
    }

    // Check verification status
    checkVerificationStatus(cleanerId){
      return http.get(`/api/stripes/check-verification-status/${cleanerId}`)
    }
    
    // Tax information 
    updateTaxInfomation(stripe_account_id){
      return http.get(`/api/stripes/update-tax-info/${stripe_account_id}`)
    }
    

    // Send push notitfication for cleaner request
    sendCleaningRequestPushNotification(data){
      return http.post('/api/push_notification/cleaning_request', data)
    }
    sendCleaningRequest(data){
      return http.post('/api/schedules/cleaning_request', data)
    }
    acceptCleaningRequest(data){
      return http.put('/api/schedules/accept_cleaning_request', data)
    }
    declineCleaningRequest(requestId){
      return http.post(`/api/schedules/decline_cleaning_request/${requestId}`)
    }
    acceptedCleaners(scheduleId){
      return http.get(`/api/schedules/${scheduleId}/accepted_cleaners`)
    }

    sendExtraTimeRequest(data){
      return http.post('/api/schedules/send_extra_time_request', data)
    }

    getExtraTime(hostId){
      return http.get(`/api/schedules/get_cleaning_time_requests/${hostId}`)
    }

    updateTimeRequest(data){
      return http.put('/api/schedules/approve_extra_cleaning_time_request', data)
    }

    updateAssignedToID(data){
      return http.put('/api/schedules/update_assigned_cleaner_id', data)
    }

    
    sendChatMessagePushNotification(data){
      return http.post('/api/schedules/payment_success', data)
    }

  
    // Update expo push token
    updateExpoPushToken(data){
      return http.put('/api/push_notification/update_expo_push_token', data)
    }

    // Redis push notifications
    // Validate token
    validateToken(data){
      return http.post("/api/redis/validate", data)
    }
    // Store token
    storeToken(data){
      return http.post("/api/redis/store-token", data)
    }

    getUserPushTokens(userId){
      return http.get(`/api/redis/get-tokens/${userId}`)
    }
    // Get updated images
    getUpdatedImageUrls(scheduleId){
      return http.get(`/api/task_photos/fetch_uploaded_images/${scheduleId}`)
    }
    // Get updated images
    getIncidents(scheduleId){
      return http.get(`/api/task_photos/fetch_incidents/${scheduleId}`)
    }

    updateScheduleIncidents(data){
      return http.put('/api/task_photos/update_incident', data)
    }
    updateChecklist(data){
      return http.put('/api/task_photos/update_checklist_tasks', data)
    }

    
    editChecklist(checklistId, data){
      return http.put(`/api/schedules/${checklistId}/edit_checklist`, data)
    }
    getICalendar(){
      return http.get(`/api/schedules/calendar`)
    }

    cancelSchedule(schedule_id, data){
      return http.post(`/api/schedules/${schedule_id}/cancel`, data)
    }

    // Get cleaner's tasks upcoming, passed, completed and cancelled

    getMySchedules(cleanerId){
      return http.get(`/api/schedules/get_all_cleaning_schedules/${cleanerId}`)
    }
    getAllSchedules(){
      return http.get(`/api/schedules/get_all_cleaning_schedules`)
    }
    getScheduleById(scheduleId){
      return http.get(`/api/schedules/get_schedule_by_id/${scheduleId}`)
    }
    getUserCompletedJobs(cleanerId){
      return http.get(`/api/schedules/get_completed_schedules/${cleanerId}`)
    }
    updateSheduleWithChatroom(chatroom){
      return http.put('/api/schedules/add_chatroom_to_schedule', chatroom)
    }
    finishCleaning(data){
      return http.put('/api/schedules/finish_cleaning', data)
    }

    updateAva(id){
      return http.get(`/api/schedules/update_avail/${id}`)
    }

    // Schedule Polling 
    getJobStatus(job_id){
      return http.get(`/api/job_queue/job_status/${job_id}`)
    }

    


    
    
  






    
    // Categories Components
    getCategories(){
      return http.get('/categories/')
    }
    getSubCategories(categoryId){
      return http.get(`/categories/get_sub_categories/${categoryId}`)
    }
  
    getFieldData(categoryId){
        return http.get(`/categories/get_fields_data_by_sub_category_name/${categoryId}` )
    }

    getFields(subcategory_name){
      return http.get(`/categories/get_fields/${subcategory_name}`)
    }
  
    getFieldDataBySubCategoryName(subcatname){
      return http.get(`/categories/get_fields_data_by_sub_category_name/${subcatname}` )
    }
    getAttributeFieldDataBySubCategoryName(subcatname){
      return http.get(`/categories/get_attribute_fields_data_by_sub_category_name/${subcatname}` )
    }

    getAttributeData(attr_name, child_field, sub_category_name){
        return http.get(`/categories/get_fields_attribute_data/${attr_name}/${child_field}/${sub_category_name}` )
      }

    

    // Post / Ads

    add_new_listing(data){
        return http.post('/posts/add_new_listing_mobile', data)
    }
    getAllPosts(){
        return http.get('/posts')
    }
    
    // getSimilarAds(data){
    //     return http.post(`/posts/get_similar_ads`, data)
    //   }
  
    // getSimilarAds(id){
    //     return http.get(`/posts/get_similar_ads/${id}`)
    // }
    getSimilarAds(data){
      return http.post('/posts/get_similar_ads', data)
    }
  
    // Locations
    getCountries(){
      return http.get('/get_countries')
    }

    // Reviews
    createReview(data){
      return http.post('/posts/create_review', data)
    }

    getReviews(ownerId){
      return http.get(`/posts/get_reviews/${ownerId}`)
    }
    getMyReviews(currentUsrId){
      return http.get(`/posts/get_my_reviews/${currentUsrId}`)
    }

    
    // getJobs(){
    //   return http.get('/jobs')
    // }
  
  }
  
  
  export default new UserService();







