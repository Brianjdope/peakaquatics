import React, { useMemo, useState } from 'react'
import { SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'

const API_BASE = 'https://your-vercel-domain.vercel.app/api'

export default function App() {
  const [email, setEmail] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [message, setMessage] = useState('')
  const enabled = useMemo(() => email.length > 4 && bookingId.length > 3, [email, bookingId])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505', padding: 20 }}>
      <StatusBar barStyle="light-content" />
      <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700', marginBottom: 8 }}>
        Peak Aquatic
      </Text>
      <Text style={{ color: '#b4b4b4', marginBottom: 22 }}>
        Mobile booking dashboard connected to Vercel APIs.
      </Text>

      <Text style={{ color: '#fff', marginBottom: 6 }}>Booking ID</Text>
      <TextInput
        value={bookingId}
        onChangeText={setBookingId}
        placeholder="PK-XXXXXX"
        placeholderTextColor="#777"
        style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 12 }}
      />

      <Text style={{ color: '#fff', marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        placeholderTextColor="#777"
        style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 18 }}
      />

      <TouchableOpacity
        disabled={!enabled}
        onPress={async () => {
          try {
            const res = await fetch(`${API_BASE}/booking/cancel`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookingId, email }),
            })
            const data = await res.json()
            setMessage(data.success ? 'Booking cancelled successfully.' : (data.error || 'Unable to cancel.'))
          } catch {
            setMessage('Network error. Please try again.')
          }
        }}
        style={{
          backgroundColor: enabled ? '#fff' : '#444',
          padding: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#000', fontWeight: '700' }}>Cancel Booking</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 16 }}>
        <Text style={{ color: '#9ad08f' }}>{message}</Text>
        <Text style={{ color: '#777', marginTop: 6, fontSize: 12 }}>API: {API_BASE}</Text>
      </View>
    </SafeAreaView>
  )
}
