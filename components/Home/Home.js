// components/Home/Home.js
import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, Text, TextInput, Button } from 'react-native';
import axios from 'axios';
import { EventEndpoints } from '../../configs/Apis';
import { AuthContext } from '../../configs/MyContexts';

const Home = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await axios.get(EventEndpoints.LIST, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = () => {
    // Implement search functionality here
  };

  const renderItem = ({ item }) => (
    <View>
      <Text onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
        {item.name} - {item.location}
      </Text>
    </View>
  );

  return (
    <View>
      <TextInput placeholder="Search events..." value={search} onChangeText={setSearch} />
      <Button title="Search" onPress={handleSearch} />
      <FlatList data={events} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
    </View>
  );
};

export default Home;
