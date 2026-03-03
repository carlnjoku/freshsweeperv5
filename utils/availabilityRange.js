import moment from 'moment';

// Function to convert the original data to the desired format
const availabilityRange = (data) => {
    
    // Map over the original data and transform each element
    const transformedData = data.map(({ day, isAvailable, startTime, endTime }) => {
        // Initialize the time range as null
        let timeRange = null;

        // Check if the day is available
        if (isAvailable) {
            // Convert startTime and endTime to 12-hour time format
            const startTimeFormatted = moment(startTime).format('h:mm A');
            const endTimeFormatted = moment(endTime).format('h:mm A');
            
            // Create the time range string
            timeRange = `${startTimeFormatted} - ${endTimeFormatted}`;
        }

        // Return the transformed object
        return {
            day,
            timeRange,
        };
    });

    // console('dataaaaaaaaaaaaaaaaa')
    // console.log(transformedData)
    // console('dataaaaaaaaaaaaaaaaa')

    return transformedData;
};

export default availabilityRange

