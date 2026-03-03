import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import JobCard from './JobCard';
import { EmptyListingNoButton } from '../../../components/shared/EmptyListingNoButton';
import CardNoPrimary from '../../../components/shared/CardNoPrimary';


const Portfolio = ({ portfolio, portfolio2 }) => {

    console.log("pooooooooorto")
    // console.log(portfolio2)
    console.log("pooooooooorto")
  return (
    <View style={styles.container}>
    <CardNoPrimary>
      <Text style={styles.header}>Cleaner Portfolio</Text>
      <FlatList
        // data={portfolio.jobs}
        data={portfolio2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <JobCard job={item} />
        )}
        ListEmptyComponent={<EmptyListingNoButton 
          message="The cleaner has not uploaded their profile."
          iconName="briefcase"
          size={24} 
        />}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.listContent} // Optional: styling for list content
      
      />
      </CardNoPrimary>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // padding: 10,
    
  },
  header: {
    fontSize:16,
    fontWeight:'bold',
    marginTop:0,
    marginBottom:10
  },
  listContent:{
    paddingVertical: 10,
    
  }
});

export default Portfolio;
