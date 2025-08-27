import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Input, Stack } from '@chakra-ui/react';

const CALENDAR_API = "http://127.0.0.1:5000/calendar";

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inputValue, setInputValue] = useState("");
  const [events, setEvents] = useState([]);

  // Fetch events for selected date
  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    fetch(`${CALENDAR_API}?date=${dateKey}`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(() => setEvents([]));
  }, [selectedDate]);

  // Add event handler
  const handleAddEvent = () => {
    if (!inputValue) return;
    const dateKey = selectedDate.toISOString().split('T')[0];
    fetch(CALENDAR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateKey, event: inputValue })
    })
      .then(res => res.json())
      .then(newEvent => setEvents(prev => [...prev, newEvent]))
      .catch(() => {});
    setInputValue("");
  };

  return (
    <Stack spacing={4} maxW="md" w="100%" align="center">
      <Heading size="md">
        Add appointment for {selectedDate.getDate()}-{selectedDate.getMonth() + 1}-{selectedDate.getFullYear()}
      </Heading>
      <Input
        placeholder="Type your appointment..."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <Button colorScheme="teal" onClick={handleAddEvent}>
        Add
      </Button>
      {events.length > 0 && (
        <Box w="100%" mt={4}>
          <Heading size="sm" mb={2}>Events for Today:</Heading>
          <Stack>
            {events.map((event, idx) => (
              <Box key={event.id || idx} p={2} bg="teal.100" borderRadius="md">
                {event.event}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

export default Calendar;